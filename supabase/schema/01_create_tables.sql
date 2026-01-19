-- ============================================
-- TABLES MANQUANTES POUR SMARTGYM
-- ============================================

-- Table des objectifs utilisateurs (NOUVELLE TABLE)
CREATE TABLE IF NOT EXISTS objectifs_utilisateurs (
  objectif_id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(utilisateur_id) ON DELETE CASCADE,
  type_objectif VARCHAR(100) NOT NULL, -- 'force', 'endurance', 'poids', etc.
  description TEXT,
  est_actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_completion TIMESTAMP NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_objectifs_utilisateur ON objectifs_utilisateurs(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_objectifs_actifs ON objectifs_utilisateurs(utilisateur_id, est_actif);

-- RLS (Row Level Security) pour sécuriser les objectifs
ALTER TABLE objectifs_utilisateurs ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour objectifs
CREATE POLICY "Utilisateurs peuvent voir leurs propres objectifs"
  ON objectifs_utilisateurs FOR ALL
  USING (
    utilisateur_id IN (
      SELECT utilisateur_id FROM utilisateurs WHERE auth_uuid = auth.uid()
    )
  );

-- S'assurer que la colonne auth_uuid existe dans utilisateurs
-- (Si elle n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'utilisateurs' AND column_name = 'auth_uuid'
  ) THEN
    ALTER TABLE utilisateurs ADD COLUMN auth_uuid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
