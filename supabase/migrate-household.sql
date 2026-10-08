-- 기기별(집별) 기록 분리. schema.sql 을 이미 실행한 DB 에 한 번만 실행한다.
-- 다시 실행해도 안전하다.
--
-- 지금까지 쌓인 기록은 전부 아래 코드 한 집의 것으로 묶는다.
-- 배포 뒤 폰의 설정 탭에서 이 코드를 입력하면 기록이 그대로 보인다:
--
--     YN9MK99PCGBY
--
alter table babies add column if not exists household text;
alter table meals  add column if not exists household text;
alter table trials add column if not exists household text;

update babies set household = 'YN9MK99PCGBY' where household is null;
update meals  set household = 'YN9MK99PCGBY' where household is null;
update trials set household = 'YN9MK99PCGBY' where household is null;

alter table babies alter column household set not null;
alter table meals  alter column household set not null;
alter table trials alter column household set not null;

create index if not exists babies_household_idx    on babies (household);
create index if not exists meals_household_date_idx on meals (household, date desc, slot);

-- 재료 하나당 한 행 → "집 하나에 재료 하나당 한 행"
alter table trials drop constraint if exists trials_ingredient_id_key;
create unique index if not exists trials_household_ingredient_idx on trials (household, ingredient_id);
