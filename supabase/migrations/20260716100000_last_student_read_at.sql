-- Accusés de lecture (✓ reçu / ✓✓ lu) : pendant de last_organizer_read_at
-- pour le sens inverse — null signifie "jamais lu par l'Élève", comparé au
-- created_at des messages organisateur pour décider ✓ ou ✓✓.

alter table conversations
  add column if not exists last_student_read_at timestamptz;
