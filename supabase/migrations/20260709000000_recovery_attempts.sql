-- Story 1.5: table RecoveryAttempt pour l'anti-brute-force sur le Code de
-- récupération (AD-9). Volontairement sans lien vers conversations : au
-- moment de la tentative, on ne sait pas encore si le Code correspond à une
-- Conversation existante.

create table if not exists recovery_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  code_hash_attempted text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists recovery_attempts_ip_created_at_idx
  on recovery_attempts (ip, created_at desc);

-- AD-4 : deny-by-default, comme conversations/messages. Seule la clé service
-- (qui contourne RLS) accède à cette table.
alter table recovery_attempts enable row level security;
