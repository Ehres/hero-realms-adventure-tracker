# Spécifications Fonctionnelles : Hero Realms Campaign Tracker

## Glossaire

| Terme        | Définition                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Profil**   | Un joueur réel (ex: Alice, Bob). Possède plusieurs aventures et des statistiques globales.        |
| **Héros**    | Un personnage d'une classe donnée (Archer, Clerc, Guerrier, Sorcier, Voleur).                     |
| **Aventure** | La progression d'un profil avec un héros spécifique. Peut être mise en pause et reprise.          |
| **Partie**   | Une session de jeu unique datée, impliquant un ou plusieurs joueurs. S'inscrit dans une aventure. |

---

## 1. Gestion des Profils

### 1.1 Vue d'accueil
L'écran par défaut affiche la **liste de tous les profils joueurs**. On peut consulter chaque profil pour voir ses aventures, ses parties et ses statistiques.

### 1.2 Création d'un profil
- Champ requis : **Nom du joueur**
- Nombre de profils : illimité

### 1.3 Persistance des données
L'état de l'application est sauvegardé après chaque action majeure (fin de partie, level-up, choix de loot).

---

## 2. Aventures & Héros

### 2.1 Création d'une aventure
- Une aventure lie **un profil joueur** à **une classe de héros**
- Initialisation : XP = 0, Niveau = 1, Compteur de Batailles = 0, PV = Max (selon la classe)
- Classes disponibles : Archer, Clerc, Guerrier, Sorcier, Voleur
- Rangs de Capacité et Compétence initialisés à 1

### 2.2 Gestion des aventures
- Un profil peut avoir **plusieurs aventures simultanées** (une par héros joué)
- Une aventure peut être **mise en pause** et **reprise** à tout moment
- Les aventures sont identifiées par : Classe du héros + Date de début

### 2.3 PV Max par classe
*(À compléter — valeurs connues : Guerrier = 50, Clerc = 55)*

---

## 3. Lancement d'une Partie

- Un bouton **"Nouvelle Partie"** est accessible depuis n'importe quelle vue, tant qu'aucune partie n'est en cours
- Au lancement :
  1. Sélection des **profils joueurs** participants (1 à N)
  2. Chaque joueur choisit son héros : reprendre une aventure existante (en pause) ou créer une nouvelle aventure
- La partie est **datée automatiquement**
- Les **PV de chaque héros sont remis à leur maximum** en début de partie
- Un **écran récapitulatif** s'affiche avant le début du combat, rappelant pour chaque héros participant :
  - L'effet actuel de sa **Capacité** (selon son rang)
  - L'effet actuel de sa **Compétence** (selon son rang)

  Cet aide-mémoire est consultatif uniquement. Une fois la partie lancée, aucun suivi de pouvoir n'est assuré par l'application.

---

## 4. Interface de Combat (Life Tracker)

### 4.1 Compteur de PV
- Affichage proéminent des PV actuels de chaque héros
- Boutons d'ajustement : **+1 / -1** et **+5 / -5**
- Les PV ne peuvent pas descendre en dessous de **0**
- Les PV peuvent dépasser le maximum (soin surplus) — affichés dans une **couleur distincte**

---

## 5. Fin de Partie & Progression

### 5.1 Désignation du gagnant
- À la fin de la partie, on désigne **un seul gagnant** parmi les participants
- **Gagnant** : +30 XP
- **Tous les autres joueurs** : +10 XP
- *(Cas solo : à définir)*

### 5.2 Moteur d'XP
- Seuil de level-up : **100 XP**
- **Mécanique de rollover** : l'XP excédentaire au passage de niveau est conservé (ex : 90 XP + 30 XP = Niveau suivant avec 20/100 XP)

### 5.3 Level-Up
- Tant que le joueur n'a pas choisi son amélioration, il **ne peut pas lancer une nouvelle partie**
- À chaque niveau gagné, le joueur choisit **1 amélioration parmi 3 catégories** :

| Catégorie                            | Effet                                                         | Limite                   |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------ |
| **Capacité** (Action Or)             | Rang actuel +1 — affiché via une barre de 5 étoiles           | Rang 5 maximum           |
| **Compétence** (Une fois par partie) | Rang actuel +1                                                | Rang 3 maximum           |
| **Santé**                            | Palier 1 : +5 PV Max / Palier 2 : +10 PV Max supplémentaires | 2 améliorations maximum  |

---

## 6. Système de Loot

### 6.1 Déclencheur
Le loot est basé sur le **compteur de batailles de l'aventure en cours** :

| Bataille      | Type de Loot |
| ------------- | ------------ |
| 3 et 6        | Loot Mineur  |
| 9 et 12       | Loot Majeur  |
| Au-delà de 12 | Aucun loot   |

### 6.2 Inventaire
- **4 emplacements** visuels (nom/type du trésor, sans effet mécanique)
- Si l'inventaire est plein et qu'un nouveau trésor est gagné : le joueur choisit lequel des 4 trésors existants **défausser**

---

## 7. Statistiques (Vue Profil)

Pour chaque profil joueur :
- Nombre total de parties jouées (tous héros confondus)
- Nombre de victoires et défaites
- Classe de héros la plus jouée
- Niveau maximum atteint (tous héros confondus)
- Historique des aventures (classe, dates, niveau atteint)
- Total d'XP gagné sur toutes les aventures

---

## 8. Design & Expérience Utilisateur

### 8.1 Code couleur par classe
| Classe   | Couleur       |
| -------- | ------------- |
| Archer   | Vert          |
| Clerc    | Blanc / Jaune |
| Guerrier | Rouge         |
| Sorcier  | Bleu          |
| Voleur   | Noir / Gris   |

### 8.2 Feedback visuel
- Animation de confettis ou écran doré lors d'un **Level-Up**
- Animation de confettis ou écran doré lors d'un **Loot de trésor**

### 8.3 Responsive
- L'application fonctionne sur **mobile et desktop**

---

## Points en suspens

| #   | Sujet                | Détail                                                                    |
| --- | -------------------- | ------------------------------------------------------------------------- |
| 1   | PV Max               | Valeurs à définir pour Archer, Sorcier et Voleur                          |
| 2   | Résultat solo        | Victoire automatique ou choix libre (victoire / égalité / défaite) ?      |
| 3   | Textes des capacités | Table des effets par rang (Capacité : rangs 1→5, Compétence : rangs 1→3)  |
