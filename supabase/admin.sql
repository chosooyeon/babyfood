-- /admin 관리 화면용. schema.sql 을 먼저 실행한 뒤, 이것도 SQL Editor 에 통째로 붙여넣고 Run.
-- 다시 실행해도 안전하다.

-- ── 방문 기록 ────────────────────────────────────────────────
-- 화면을 열 때마다 한 줄. IP 는 해시 앞자리만 (누구인지가 아니라 같은 기기인지만 본다)
create table if not exists visits (
  id          bigint generated always as identity primary key,
  ts          timestamptz not null default now(),
  path        text not null,            -- "/", "/history", "action:addMeal" ...
  device      text,                     -- "iPhone · 홈화면 앱"
  ua          text,
  ip_hash     text,
  duration_ms int                       -- 서버가 화면을 그리는 데 걸린 시간
);
create index if not exists visits_ts_idx on visits (ts desc);
alter table visits enable row level security;   -- 정책 없음 = service_role 만 접근
-- 내 기기(/admin 에 로그인한 폰·컴퓨터, 로컬 개발)에서 온 것. 통계에서 뺀다
alter table visits add column if not exists mine boolean not null default false;
-- 링크 미리보기 봇(페북·인스타·카톡)이 남긴 줄을 지운다. 코드가 걸러내기 전에 쌓인 것 (다시 돌려도 안전)
delete from visits where ua ~* 'facebookexternalhit|kakaotalk-scrap|vercel-favicon';
-- 로컬 npm run dev 에서 온 방문은 x-forwarded-for 가 없어 ip_hash 가 null — 전부 내 것이다 (다시 돌려도 안전)
update visits set mine = true where ip_hash is null and not mine;

-- ── 체험팩 링크 클릭 ─────────────────────────────────────────
-- /samples 의 "사이트 열기"를 누르면 /go/{brand} 가 한 줄 남기고 공식 홈으로 보낸다.
-- 업체와 이야기할 때 꺼낼 숫자라 방문 기록과 달리 지우지 않는다 (한 줄 100바이트쯤).
create table if not exists sample_clicks (
  id        bigint generated always as identity primary key,
  ts        timestamptz not null default now(),
  brand_id  text not null,                   -- src/data/samples.ts 의 id
  src       text not null default 'samples', -- samples(화면) | cal(캘린더 알림)
  household text,                            -- 수첩 코드. 몇 집이 눌렀는지 셀 때
  device    text,
  ip_hash   text,
  mine      boolean not null default false   -- 내 기기 → 집계에서 뺀다
);
create index if not exists sample_clicks_brand_ts_idx on sample_clicks (brand_id, ts desc);
alter table sample_clicks enable row level security;

-- ── 통계 함수 ────────────────────────────────────────────────
-- 앱이 db.rpc('admin_stats') 로 부른다. 한 번에 다 모아 json 으로 돌려주고,
-- 부를 때 90일 지난 방문 기록을 지운다 (매일 돌 배치를 따로 두지 않기 위해).
create or replace function admin_stats()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with cleanup as (
    delete from visits where ts < now() - interval '90 days' returning 1
  ),
  kst as (
    select (now() at time zone 'Asia/Seoul')::date as today
  )
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),

    'tables', (
      select jsonb_agg(jsonb_build_object(
               'name',  t.name,
               'rows',  t.rows,
               'bytes', pg_total_relation_size(t.name::regclass),
               'last',  t.last
             ) order by t.name)
      from (values
        ('babies', (select count(*) from babies), (select max(created_at) from babies)),
        ('meals',  (select count(*) from meals),  (select max(created_at) from meals)),
        ('trials', (select count(*) from trials), (select max(created_at) from trials)),
        ('bottles', (select count(*) from bottles), (select max(created_at) from bottles)),
        ('sample_claims', (select count(*) from sample_claims), (select max(claimed_at) from sample_claims)),
        ('tips',   (select count(*) from tips),   (select max(created_at) from tips)),
        ('visits', (select count(*) from visits), (select max(ts) from visits)),
        ('sample_clicks', (select count(*) from sample_clicks), (select max(ts) from sample_clicks))
      ) as t(name, rows, last)
    ),

    'visits_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day',     to_char(d, 'YYYY-MM-DD'),
               'n',       coalesce(v.n, 0),
               'devices', coalesce(v.devices, 0),
               'mine',    coalesce(v.mine, 0)
             ) order by d), '[]'::jsonb)
      from kst,
           generate_series(kst.today - 13, kst.today, interval '1 day') as d
      left join (
        select (ts at time zone 'Asia/Seoul')::date as day,
               count(*) filter (where not mine) as n,
               count(distinct ip_hash) filter (where not mine) as devices,
               count(*) filter (where mine) as mine
        from visits
        where ts > now() - interval '15 days' and path not like 'action:%'
        group by 1
      ) v on v.day = d::date
    ),

    'devices_7d', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'device', x.device, 'ip_hash', x.ip_hash, 'n', x.n, 'mine_n', x.mine_n, 'last', x.last, 'mine', x.mine
             ) order by x.mine, x.last desc), '[]'::jsonb)
      from (
        select device, ip_hash,
               count(*) filter (where not mine) as n,     -- 남의 방문
               count(*) filter (where mine) as mine_n,    -- 내 방문 (따로 보여만 준다)
               max(ts) as last, bool_or(mine) as mine
        from visits
        where ts > now() - interval '7 days'
        group by device, ip_hash
      ) x
    ),

    'latency_7d', (
      select jsonb_build_object(
        'avg', round(avg(duration_ms)),
        'p95', round((percentile_cont(0.95) within group (order by duration_ms))::numeric),
        'max', max(duration_ms)
      )
      from visits
      where ts > now() - interval '7 days' and duration_ms is not null
    ),

    'recent', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.ts desc), '[]'::jsonb)
      from (
        select ts, path, device, ip_hash, duration_ms, mine
        from visits order by ts desc limit 30
      ) r
    ),

    -- 체험팩 클릭: 브랜드별 전체·7일·오늘·누른 집 수. 내 기기 클릭은 따로 센다
    'clicks', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'brand_id',   c.brand_id,
               'total',      c.total,
               'd7',         c.d7,
               'today',      c.today,
               'households', c.households,
               'cal',        c.cal,
               'mine',       c.mine,
               'last',       c.last
             ) order by c.total desc, c.mine desc), '[]'::jsonb)
      from (
        select brand_id,
               count(*) filter (where not mine) as total,
               count(*) filter (where not mine and ts > now() - interval '7 days') as d7,
               count(*) filter (where not mine and (ts at time zone 'Asia/Seoul')::date = kst.today) as today,
               count(distinct household) filter (where not mine) as households,
               count(*) filter (where not mine and src = 'cal') as cal,
               count(*) filter (where mine) as mine,
               max(ts) filter (where not mine) as last
        from sample_clicks, kst
        group by brand_id
      ) c
    ),

    'clicks_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day',     to_char(d, 'YYYY-MM-DD'),
               'n',       coalesce(c.n, 0),
               'devices', coalesce(c.households, 0),
               'mine',    coalesce(c.mine, 0)
             ) order by d), '[]'::jsonb)
      from kst,
           generate_series(kst.today - 13, kst.today, interval '1 day') as d
      left join (
        select (ts at time zone 'Asia/Seoul')::date as day,
               count(*) filter (where not mine) as n,
               count(distinct household) filter (where not mine) as households,
               count(*) filter (where mine) as mine
        from sample_clicks
        where ts > now() - interval '15 days'
        group by 1
      ) c on c.day = d::date
    ),

    'generated_at', now()
  );
$$;

-- service_role 만 부를 수 있게. 브라우저용 키로는 호출 불가.
revoke all on function admin_stats() from public, anon, authenticated;
