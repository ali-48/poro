/*
# Tables pour le système CrewAI

1. Tables principales
  - workflows : Suivi des exécutions
  - validation_logs : Historique des validations
  - prompt_versions : Versioning des prompts
*/

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  errors JSONB,
  is_valid BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès workflows" ON workflows
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Write validation logs" ON validation_logs
  FOR INSERT WITH CHECK (auth.role() = 'validator');