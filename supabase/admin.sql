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
        ('visits', (select count(*) from visits), (select max(ts) from visits))
      ) as t(name, rows, last)
    ),

    'visits_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day',     to_char(d, 'YYYY-MM-DD'),
               'n',       coalesce(v.n, 0),
               'devices', coalesce(v.devices, 0)
             ) order by d), '[]'::jsonb)
      from kst,
           generate_series(kst.today - 13, kst.today, interval '1 day') as d
      left join (
        select (ts at time zone 'Asia/Seoul')::date as day,
               count(*) as n,
               count(distinct ip_hash) as devices
        from visits
        where ts > now() - interval '15 days' and path not like 'action:%'
        group by 1
      ) v on v.day = d::date
    ),

    'devices_7d', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'device', x.device, 'ip_hash', x.ip_hash, 'n', x.n, 'last', x.last
             ) order by x.last desc), '[]'::jsonb)
      from (
        select device, ip_hash, count(*) as n, max(ts) as last
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
        select ts, path, device, ip_hash, duration_ms
        from visits order by ts desc limit 30
      ) r
    ),

    'generated_at', now()
  );
$$;

-- service_role 만 부를 수 있게. 브라우저용 키로는 호출 불가.
revoke all on function admin_stats() from public, anon, authenticated;
