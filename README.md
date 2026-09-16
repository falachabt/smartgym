Cahier des charges - Optimisation et compression des contenus BlockNote stockés dans Supabase
1. Contexte

La plateforme stocke les contenus pédagogiques (cours, exercices, quiz, étapes de parcours, etc.) sous forme de JSON générés par BlockNote.

Les principaux constats sont :

La base Supabase approche de sa limite de stockage.
Les contenus BlockNote contiennent énormément de structures répétitives.
Les mêmes propriétés reviennent des milliers de fois.
Les IDs UUID sont volumineux.
Aucune recherche textuelle n'est actuellement effectuée sur le contenu.
Les contenus doivent rester rééditables dans BlockNote.

L'objectif est donc de réduire drastiquement l'espace disque occupé tout en conservant une reconstruction parfaite du document lors de l'édition.

2. Objectifs
Objectif principal

Réduire la taille de stockage des contenus BlockNote de 60 à 90%.

Objectifs secondaires
Réduire l'utilisation du quota Supabase.
Conserver 100% de compatibilité avec BlockNote.
Ne perdre aucune information.
Permettre les évolutions futures du format.
Préparer un système versionné.
3. Principe général

Pipeline de sauvegarde :

JSON BlockNote
       ↓
Analyse
       ↓
Simplification
       ↓
Tokenisation
       ↓
Compression Gzip
       ↓
Encodage Base64
       ↓
Supabase


Pipeline de lecture :

Supabase
       ↓
Base64 Decode
       ↓
Gzip Uncompress
       ↓
Expansion du dictionnaire
       ↓
Reconstruction BlockNote
       ↓
Edition

4. Étape 1 - Inventaire complet du format BlockNote

Avant toute optimisation :

Analyse de plusieurs milliers de contenus

Créer un script d'audit chargé d'analyser :

Les types de blocs utilisés

Exemple :

"type": "paragraph"
"type": "divider"
"type": "heading"
"type": "bulletListItem"
"type": "numberedListItem"
"type": "table"
"type": "image"
"type": "codeBlock"


Résultat attendu :

{
  "paragraph": 145000,
  "divider": 32000,
  "heading": 18000
}

Les propriétés les plus fréquentes

Exemple :

{
  "textColor": "default",
  "textAlignment": "left",
  "backgroundColor": "default"
}


Objectif :

identifier tous les groupes de propriétés récurrents.

Les styles les plus fréquents

Exemple :

{
  "bold": true
}


ou

{}

Les structures complètes répétées

Détecter automatiquement :

{
  "type":"paragraph",
  "props":{
     "textColor":"default",
     "textAlignment":"left",
     "backgroundColor":"default"
  }
}


Si cette structure apparaît :

100 000 fois


elle devient candidate à la tokenisation.

5. Construction du dictionnaire
Important

Le dictionnaire doit porter uniquement sur :

les propriétés
les structures
les clés système

Jamais sur les vraies données métier.

Exemple
Dictionnaire des propriétés
{
  "P1": {
    "textColor": "default",
    "textAlignment": "left",
    "backgroundColor": "default"
  }
}

Dictionnaire des types
{
  "p": "paragraph",
  "d": "divider",
  "h": "heading"
}

Dictionnaire des styles
{
  "S1": {},
  "S2": {
    "bold": true
  }
}

6. Éviter toute collision avec le contenu utilisateur

C'est le point le plus important.

Problème

Un utilisateur pourrait écrire :

P1


dans son cours.

Il ne faut jamais que cela soit interprété comme :

P1 => dictionnaire

Solution retenue

Créer une syntaxe réservée.

Exemple :

"__P1__"


ou

"$P1$"


ou

"@P1"


Encore mieux :

{
   "__token__":"P1"
}


Ainsi :

P1


reste un texte normal.

et

{
   "__token__":"P1"
}


est reconnu comme un élément compressé.

Aucune ambiguïté possible.

7. Gestion des IDs
Situation actuelle
"id":"aea670a9-1c7b-4ae9-9656-995688a1bbc7"


36 caractères.

Compression

Remplacement :

"id":"aea670a9-..."


↓

"i":1

Reconstruction

Lors du chargement :

crypto.randomUUID()


génère :

"id":"nouvel-uuid"


pour chaque bloc.

Validation obligatoire

Avant mise en production :

Vérifier que BlockNote :

ouvre le document
édite le document
ajoute des blocs
supprime des blocs
déplace des blocs
sauvegarde

sans nécessiter de conserver les IDs originaux.

8. Simplification des clés
Exemple

Avant :

{
  "type":"paragraph",
  "content":[]
}


Après :

{
  "t":"paragraph",
  "c":[]
}

Mapping
{
  "t":"type",
  "p":"props",
  "c":"content",
  "s":"styles",
  "i":"id",
  "ch":"children"
}

9. Suppression des valeurs par défaut

Exemple :

Avant :

{
  "textColor":"default",
  "textAlignment":"left",
  "backgroundColor":"default"
}


Après :

{}


Le moteur de reconstruction réinjectera les valeurs par défaut.

10. Compression Gzip

Après simplification :

JSON simplifié
      ↓
gzip


Bibliothèque :

pako


ou

CompressionStream

11. Encodage Base64

Après Gzip :

buffer gzip
      ↓
base64


Stockage :

TEXT


dans Supabase.

12. Versionnage du format

Ajouter un champ :

{
  "version": 1,
  "content": "..."
}


Exemple futur :

{
  "version": 2,
  "content": "..."
}


Permettra de faire évoluer la stratégie sans casser les anciens contenus.

13. Outil de migration

Créer un script capable de :

Lire les contenus existants.
Les convertir au nouveau format.
Vérifier l'intégrité.
Réécrire les données.

Pour chaque ligne :

Lecture
 ↓
Compression
 ↓
Décompression
 ↓
Comparaison
 ↓
Sauvegarde


Si différence :

Erreur


Sinon :

Migration validée

14. Indicateurs de succès

Mesurer :

Taille JSON originale
Taille simplifiée
Taille gzip
Taille finale base64

Exemple :

Original : 100 Ko

Après simplification : 55 Ko

Après gzip : 12 Ko

Après base64 : 16 Ko

Gain final : 84%

Résultat attendu

Le système final devra :

✅ Reconstruire exactement le JSON BlockNote d'origine
 ✅ Être totalement transparent pour l'éditeur
 ✅ Éviter toute collision avec les données utilisateur
 ✅ Supporter plusieurs versions futures du format
 ✅ Réduire fortement le stockage Supabase
 ✅ Permettre une migration progressive sans interruption de service
 ✅ Produire des gains estimés entre 70 % et 90 % sur les contenus les plus répétitifs.
