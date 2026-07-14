create extension if not exists pgcrypto;

create table if not exists members (
  id text primary key,
  name text not null,
  pose_variant text not null default 'back-high-step',
  activity_state_override text check (
    activity_state_override is null
    or activity_state_override in ('active', 'supposed_to_be_resting', 'resting')
  ),
  expected_return_date date,
  pin_hash text not null default crypt('0000', gen_salt('bf')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table members
add column if not exists pose_variant text;

update members
set pose_variant = case id
  when '69eefe57479beb6eb9d3ab94' then 'back-high-step'
  when '69df96d203f16d16fa359849' then 'back-frog-sit'
  when '69de89a204b6c76cca2ee8aa' then 'back-high-flag'
  when '69de8141b641914647ac4807' then 'back-straight-hang'
  when '69de6ed4d2ed611cdd74ff6f' then 'back-side-reach'
  when '69de696486dbd8b0c38ff2e0' then 'back-high-step'
  when '69de66ae4c1866a759800426' then 'back-side-reach'
  when '69de6176d02099e81b39f5e5' then 'back-frog-sit'
  when '69de60c82066868e774a911c' then 'back-straight-hang'
  when '69de5d2206eb9d520685c3e0' then 'back-high-flag'
  when '69dd5147356d7d0ee50227a9' then 'back-high-step'
  when '69dd4f4bf6aa257f3edbb82d' then 'back-frog-sit'
  else 'back-high-step'
end
where pose_variant is null or trim(pose_variant) = '';

alter table members
alter column pose_variant set default 'back-high-step';

alter table members
alter column pose_variant set not null;

create table if not exists injuries (
  id text primary key,
  member_id text not null references members(id) on delete cascade,
  injury_status text not null check (
    injury_status in ('climbable', 'risky', 'no_climbing')
  ),
  notes text not null default '',
  expected_return_date date,
  body_part_key text not null,
  injury_title text not null,
  is_current boolean not null default true,
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists injury_markers (
  id text primary key,
  injury_id text not null references injuries(id) on delete cascade,
  body_zone_key text not null,
  x_position numeric not null,
  y_position numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function random_pose_variant_id()
returns text
language sql
volatile
as $$
  select (array[
    'back-high-step',
    'back-frog-sit',
    'back-straight-hang',
    'back-side-reach',
    'back-high-flag'
  ])[floor(random() * 5)::int + 1];
$$;

drop trigger if exists members_set_updated_at on members;
create trigger members_set_updated_at
before update on members
for each row execute function set_updated_at();

drop trigger if exists injuries_set_updated_at on injuries;
create trigger injuries_set_updated_at
before update on injuries
for each row execute function set_updated_at();

drop trigger if exists injury_markers_set_updated_at on injury_markers;
create trigger injury_markers_set_updated_at
before update on injury_markers
for each row execute function set_updated_at();

alter table members enable row level security;
alter table injuries enable row level security;
alter table injury_markers enable row level security;

drop policy if exists "public read members" on members;
create policy "public read members"
on members for select
to anon, authenticated
using (true);

drop policy if exists "public read injuries" on injuries;
create policy "public read injuries"
on injuries for select
to anon, authenticated
using (true);

drop policy if exists "public read injury markers" on injury_markers;
create policy "public read injury markers"
on injury_markers for select
to anon, authenticated
using (true);

create or replace function verify_member_pin(p_member_id text, p_pin text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from members
    where id = p_member_id
      and pin_hash = crypt(p_pin, pin_hash)
  );
$$;

create or replace function assert_member_pin(p_member_id text, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be four digits' using errcode = '22023';
  end if;

  if not verify_member_pin(p_member_id, p_pin) then
    raise exception 'Invalid member PIN' using errcode = '28000';
  end if;
end;
$$;

create or replace function save_member(
  p_member_id text,
  p_pin text,
  p_name text,
  p_activity_state_override text,
  p_expected_return_date date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_member_pin(p_member_id, p_pin);

  if p_activity_state_override is not null
     and p_activity_state_override not in ('active', 'supposed_to_be_resting', 'resting') then
    raise exception 'Invalid activity state' using errcode = '22023';
  end if;

  update members
  set
    name = coalesce(nullif(trim(p_name), ''), name),
    activity_state_override = p_activity_state_override,
    expected_return_date = p_expected_return_date
  where id = p_member_id;
end;
$$;

create or replace function set_member_pin(
  p_member_id text,
  p_pin text,
  p_new_pin text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_member_pin(p_member_id, p_pin);

  if p_new_pin is null or p_new_pin !~ '^[0-9]{4}$' then
    raise exception 'New PIN must be four digits' using errcode = '22023';
  end if;

  update members
  set pin_hash = crypt(p_new_pin, gen_salt('bf'))
  where id = p_member_id;
end;
$$;

create or replace function create_member(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_member_id text;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Name is required' using errcode = '22023';
  end if;

  next_member_id := gen_random_uuid()::text;

  insert into members (id, name, pose_variant, pin_hash)
  values (next_member_id, trim(p_name), random_pose_variant_id(), crypt('0000', gen_salt('bf')));

  return next_member_id;
end;
$$;

create or replace function save_injury(
  p_member_id text,
  p_pin text,
  p_injury_id text,
  p_injury_status text,
  p_notes text,
  p_expected_return_date date,
  p_body_part_key text,
  p_injury_title text,
  p_is_current boolean,
  p_start_date date,
  p_markers jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_injury_id text;
  marker jsonb;
begin
  perform assert_member_pin(p_member_id, p_pin);

  if p_injury_status not in ('climbable', 'risky', 'no_climbing') then
    raise exception 'Invalid injury status' using errcode = '22023';
  end if;

  next_injury_id := coalesce(nullif(p_injury_id, ''), gen_random_uuid()::text);

  if p_injury_id is null or p_injury_id = '' then
    insert into injuries (
      id,
      member_id,
      injury_status,
      notes,
      expected_return_date,
      body_part_key,
      injury_title,
      is_current,
      start_date
    ) values (
      next_injury_id,
      p_member_id,
      p_injury_status,
      coalesce(p_notes, ''),
      p_expected_return_date,
      coalesce(nullif(p_body_part_key, ''), 'unknown'),
      coalesce(nullif(p_injury_title, ''), 'Injury'),
      coalesce(p_is_current, true),
      p_start_date
    );
  else
    update injuries
    set
      injury_status = p_injury_status,
      notes = coalesce(p_notes, ''),
      expected_return_date = p_expected_return_date,
      body_part_key = coalesce(nullif(p_body_part_key, ''), 'unknown'),
      injury_title = coalesce(nullif(p_injury_title, ''), 'Injury'),
      is_current = coalesce(p_is_current, true),
      start_date = p_start_date
    where id = next_injury_id
      and member_id = p_member_id;

    if not found then
      raise exception 'Injury not found' using errcode = '02000';
    end if;

    delete from injury_markers where injury_id = next_injury_id;
  end if;

  for marker in
    select value from jsonb_array_elements(coalesce(p_markers, '[]'::jsonb))
  loop
    insert into injury_markers (
      id,
      injury_id,
      body_zone_key,
      x_position,
      y_position
    ) values (
      gen_random_uuid()::text,
      next_injury_id,
      marker->>'bodyZoneKey',
      (marker->>'xPosition')::numeric,
      (marker->>'yPosition')::numeric
    );
  end loop;

  return next_injury_id;
end;
$$;

create or replace function resolve_injury(
  p_member_id text,
  p_pin text,
  p_injury_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform assert_member_pin(p_member_id, p_pin);

  update injuries
  set is_current = false
  where id = p_injury_id
    and member_id = p_member_id;

  if not found then
    raise exception 'Injury not found' using errcode = '02000';
  end if;
end;
$$;

grant execute on function verify_member_pin(text, text) to anon, authenticated;
grant execute on function create_member(text) to anon, authenticated;
grant execute on function save_member(text, text, text, text, date) to anon, authenticated;
grant execute on function set_member_pin(text, text, text) to anon, authenticated;
grant execute on function save_injury(text, text, text, text, text, date, text, text, boolean, date, jsonb) to anon, authenticated;
grant execute on function resolve_injury(text, text, text) to anon, authenticated;
