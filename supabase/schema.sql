-- Supabase → SQL Editor 에 통째로 붙여넣고 실행하면 끝.
-- 다시 실행해도 안전하도록 전부 if not exists.

create extension if not exists "pgcrypto";

-- ── 아기 (한 명만 쓴다. 둘째가 생기면 그때 늘린다) ────────────
create table if not exists babies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  birth_date date not null,
  created_at timestamptz not null default now()
);

-- ── 끼니 기록 ────────────────────────────────────────────────
create table if not exists meals (
  id             uuid primary key default gen_random_uuid(),
  date           date not null,
  slot           int  not null default 1,        -- 그날 몇 번째 끼니
  menu           text not null,
  amount_ml      int,
  reaction       text not null default 'good',   -- good | soso | refused
  ingredient_ids text[] not null default '{}',   -- 재료 사전의 id 들
  note           text,
  created_at     timestamptz not null default now()
);
create index if not exists meals_date_idx on meals (date desc, slot);

-- ── 재료 도입 이력 (알레르기 3일 관찰) ────────────────────────
-- 재료 하나당 한 행. 처음 먹인 날부터 3일을 센다.
create table if not exists trials (
  id            uuid primary key default gen_random_uuid(),
  ingredient_id text not null unique,
  first_date    date not null,
  status        text not null default 'testing', -- testing | safe | allergic
  symptoms      text[] not null default '{}',
  note          text,
  created_at    timestamptz not null default now()
);

-- ── 잠금 ──────────────────────────────────────────────────────
-- RLS 를 켜고 정책을 하나도 만들지 않는다 = anon 키로는 아무것도 못 읽는다.
-- 앱은 service_role 키로 서버에서만 접근하므로 이 상태가 정상이다.
-- (Supabase 대시보드가 "정책이 없다"고 경고해도 의도한 것)
alter table babies enable row level security;
alter table meals  enable row level security;
alter table trials enable row level security;
