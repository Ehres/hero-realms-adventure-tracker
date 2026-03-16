# Spécifications Fonctionnelles — Reste à implémenter

> Les fonctionnalités déjà implémentées sont documentées dans [docs/functional-guide.md](./docs/functional-guide.md).
> Dernière mise à jour : Mars 2026

---

## 1. Ecran récapitulatif pré-combat

**Référence :** Règles Hero Realms — rappel des pouvoirs avant le combat

Avant le début du combat, un écran intermédiaire doit afficher pour chaque héros participant :
- L'effet actuel de sa **Capacité** (selon son rang 1→5)
- L'effet actuel de sa **Compétence** (selon son rang 1→3)

Cet aide-mémoire est consultatif uniquement.

> **Prérequis :** Nécessite la table des effets par rang et par classe (Point en suspens #2).

---

## 2. Remplacement de loot (inventaire plein)

**Référence :** Règles Hero Realms — gestion d'inventaire à 4 slots

Quand l'inventaire est plein (4/4) et qu'un nouveau trésor est gagné, le joueur doit pouvoir choisir lequel des 4 trésors existants **défausser** pour faire de la place.

- Le Server Action `replaceLoot()` existe déjà
- **Manquant :** L'interface de choix dans le dialog de loot

---

## 3. Historique des aventures (affichage)

**Référence :** Vue profil — suivi de progression long terme

Afficher sur la page profil un historique des aventures avec :
- Classe du héros
- Date de début / fin
- Niveau atteint

Les données sont déjà calculées côté serveur (`app/actions/stats.ts`).

---

## 4. Suppression d'une aventure

Permettre la suppression d'une aventure depuis sa page détail, avec confirmation.

---

## Points en suspens

| #   | Sujet                | Détail                                                                    |
| --- | -------------------- | ------------------------------------------------------------------------- |
| 1   | Résultat solo        | Victoire automatique ou choix libre (victoire / égalité / défaite) ?      |
| 2   | Textes des capacités | Table des effets par rang (Capacité : rangs 1→5, Compétence : rangs 1→3) |
