/*
# Ajout des politiques de validation

1. Sécurité
  - Activation du RLS pour la table workflows
  - Politique d'accès pour les logs de validation
*/

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès lecture logs validation" 
  ON validation_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Accès écriture supervision"
  ON workflows
  FOR INSERT
  WITH CHECK (auth.role() = 'supervisor');