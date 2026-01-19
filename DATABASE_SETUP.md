# Configuration de la base de données SmartGym

## 📋 Instructions d'installation

### 1. Exécuter les scripts SQL dans Supabase

Connectez-vous à votre projet Supabase et exécutez les scripts dans l'ordre :

1. **`supabase/schema/01_create_tables.sql`** - Création des tables et des politiques RLS
2. **`supabase/schema/02_seed_data.sql`** - Données de test initiales

### 2. Vérifier que les tables sont créées

Dans l'éditeur SQL de Supabase, exécutez :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Vous devriez voir :

- `utilisateurs`
- `objectifs_utilisateurs` ✨ (NOUVELLE)
- `performances`
- `exercices`
- `machines`
- `categories`
- `muscles_cibles`
- `recommandations_charges`
- `salles_de_sport`

## 🔄 Comment ça fonctionne maintenant

### Authentification et création d'utilisateur

Quand un utilisateur s'inscrit via `supabase.auth.signUp()` :

1. Un compte est créé dans `auth.users`
2. **Automatiquement**, un trigger crée une entrée dans la table `utilisateurs`
3. L'application récupère l'`utilisateur_id` via la fonction `getUserIdFromAuth()`

### Récupération de l'utilisateur_id

```typescript
// Dans two.tsx
const id = await getUserIdFromAuth(user.id);
setUserId(id);
```

Cette fonction fait le lien entre :

- `auth.users.id` (UUID) → `utilisateurs.auth_uuid`
- Retourne → `utilisateurs.utilisateur_id` (INTEGER)

### Objectifs

Les objectifs sont maintenant **dynamiques** et stockés dans la base :

```typescript
const { objectifs } = useObjectifs(userId);
// Retourne les objectifs personnalisés de l'utilisateur
```

Par défaut, 3 objectifs sont créés automatiquement :

- Force musculaire
- Endurance cardiovasculaire
- Maintien du poids

### Historique des performances

L'historique fonctionne maintenant car `userId` est correctement récupéré :

```typescript
const { performances } = usePerformances(userId);
// Affiche les 10 dernières séances de l'utilisateur
```

### Statistiques

Les stats affichent :

- **Machines** : Nombre total de machines disponibles
- **Catégories** : Nombre de catégories d'exercices
- **Exercices** : Nombre total d'exercices disponibles

## 📝 Enregistrer une performance

Après qu'un utilisateur termine un exercice, enregistrez-le :

```typescript
import { enregistrerPerformance } from "@/utils/database";

await enregistrerPerformance({
  utilisateurId: userId,
  exerciceId: exercice.exercice_id,
  series: 3,
  repetitions: 12,
  charge: 50, // optionnel
});
```

## 🎯 Ajouter un objectif personnalisé

```typescript
const { ajouterObjectif } = useObjectifs(userId);

await ajouterObjectif("endurance", "Courir un marathon en moins de 4 heures");
```

## 🔐 Sécurité (RLS)

Les politiques de sécurité au niveau des lignes garantissent que :

- Un utilisateur ne voit que **ses propres** performances
- Un utilisateur ne peut modifier que **ses propres** objectifs
- Les données des autres utilisateurs sont **totalement invisibles**

## ⚠️ Important

Pour que tout fonctionne :

1. ✅ Exécutez les scripts SQL dans Supabase
2. ✅ Assurez-vous que le trigger `on_auth_user_created` est actif
3. ✅ Vérifiez que RLS est activé sur les tables sensibles
4. ✅ Testez avec `npx expo start`

## 🐛 Dépannage

### L'historique est vide

- Vérifiez que `userId` n'est pas `null` : `console.log('userId:', userId)`
- Vérifiez que des performances existent : SQL → `SELECT * FROM performances;`

### Les objectifs ne s'affichent pas

- Vérifiez la table : `SELECT * FROM objectifs_utilisateurs;`
- Exécutez le script seed pour créer des objectifs par défaut

### Erreur "utilisateur_id not found"

- Le trigger n'a pas créé l'utilisateur automatiquement
- Créez-le manuellement ou réexécutez le script SQL
