-- ============================================
-- DONNÉES INITIALES POUR LES OBJECTIFS
-- ============================================

-- Créer des objectifs par défaut pour les utilisateurs existants
-- (Seulement pour ceux qui n'en ont pas encore)
INSERT INTO objectifs_utilisateurs (utilisateur_id, type_objectif, description, est_actif)
SELECT 
  u.utilisateur_id,
  'force',
  'Développer la force musculaire',
  true
FROM utilisateurs u
WHERE NOT EXISTS (
  SELECT 1 FROM objectifs_utilisateurs o 
  WHERE o.utilisateur_id = u.utilisateur_id 
  AND o.type_objectif = 'force'
);

INSERT INTO objectifs_utilisateurs (utilisateur_id, type_objectif, description, est_actif)
SELECT 
  u.utilisateur_id,
  'endurance',
  'Améliorer l''endurance cardiovasculaire',
  true
FROM utilisateurs u
WHERE NOT EXISTS (
  SELECT 1 FROM objectifs_utilisateurs o 
  WHERE o.utilisateur_id = u.utilisateur_id 
  AND o.type_objectif = 'endurance'
);

INSERT INTO objectifs_utilisateurs (utilisateur_id, type_objectif, description, est_actif)
SELECT 
  u.utilisateur_id,
  'poids',
  'Maintenir un poids santé',
  true
FROM utilisateurs u
WHERE NOT EXISTS (
  SELECT 1 FROM objectifs_utilisateurs o 
  WHERE o.utilisateur_id = u.utilisateur_id 
  AND o.type_objectif = 'poids'
);
