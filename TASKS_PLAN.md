# Plan d'Implémentation — Hero Realms Campaign Tracker

> **Note :** Ce document ne contient que les tâches **restantes**. Les Phases 1 à 7, 9 à 12 sont terminées.
> Dernière mise à jour : Mars 2026

---

## Tâches restantes

### 1. Ecran récapitulatif pré-combat (Phase 8.3)

**Priorité : Moyenne**
**Dépend de :** Table des effets Capacité/Compétence par classe et par rang (Point en suspens #2)

- [ ] Créer une page ou un écran intermédiaire entre le setup et le combat
- [ ] Pour chaque héros participant, afficher :
  - Nom du joueur + classe du héros
  - Effet actuel de la **Capacité** (selon rang 1→5)
  - Effet actuel de la **Compétence** (selon rang 1→3)
- [ ] Bouton "Commencer le combat" → redirection vers `/game/[gameId]/combat`

**Fichiers concernés :**
- `app/game/[gameId]/combat/page.tsx` ou nouvelle route intermédiaire
- `lib/constants.ts` (ajouter les textes d'effets par rang et par classe)

---

### 2. UI de remplacement de loot (inventaire plein) (Phase 9.4)

**Priorité : Moyenne**

- [ ] Quand un loot est déclenché et que l'inventaire est plein (4/4 slots) :
  - Afficher les 4 trésors actuels
  - Permettre au joueur de choisir lequel défausser
  - Appeler `replaceLoot(adventureId, slotIndex, newLootName)` au lieu de `assignLoot`
- [ ] Intégrer dans le flux existant de `components/game/end-game-content.tsx`

**Fichiers concernés :**
- `components/game/end-game-content.tsx` (modifier le dialog de loot)
- `app/actions/loot.ts` (`replaceLoot` existe déjà)

---

### 3. Historique des aventures (UI) (Phase 10.1)

**Priorité : Faible**

- [ ] Afficher sur la page profil l'historique des aventures :
  - Classe du héros
  - Date de début / fin
  - Niveau atteint
- [ ] Les données sont déjà calculées dans `app/actions/stats.ts`

**Fichiers concernés :**
- `app/profiles/[profileId]/page.tsx`
- `app/actions/stats.ts` (données déjà disponibles)

---

### 4. Suppression d'une aventure

**Priorité : Faible**

- [ ] Créer un Server Action `deleteAdventure(adventureId: string)` dans `app/actions/adventures.ts`
- [ ] Ajouter un bouton "Supprimer" sur la page détail aventure avec dialog de confirmation
- [ ] Gérer la suppression en cascade (gameParticipants liés)

**Fichiers concernés :**
- `app/actions/adventures.ts`
- `app/adventures/[adventureId]/page.tsx` ou `components/adventures/adventure-controls.tsx`

---

## Points en suspens

| #   | Sujet                | Détail                                                                 | Tâche impactée |
| --- | -------------------- | ---------------------------------------------------------------------- | -------------- |
| 1   | Résultat solo        | Victoire automatique ou choix libre ?                                  | —              |
| 2   | Textes des capacités | Table des effets par rang (Capacité 1→5, Compétence 1→3) par classe   | Tâche 1        |
