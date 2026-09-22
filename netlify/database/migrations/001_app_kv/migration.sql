create table if not exists app_kv (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
