export type WebsiteCategory = 'Game' | 'Music';


export interface Website {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: Date;
  category: WebsiteCategory;
  path : string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED', // For level up selection
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export interface Entity {
  id: string;
  position: Vector2;
  radius: number;
  color: string;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  // Stats
  damageMulti: number;
  attackSpeedMulti: number;
  projectileCount: number;
  weapons: WeaponType[];
  skills: Record<string, number>; // Track level of each skill (id -> level)
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  type: 'ZOMBIE' | 'FAST' | 'TANK' | 'BOSS';
}

export interface Projectile extends Entity {
  velocity: Vector2;
  damage: number;
  duration: number; // frames or time to live
  penetration: number;
  isEvo?: boolean; // Visual flag for evo projectiles
}

export interface Gem extends Entity {
  value: number;
}

export interface DamageNumber {
  id: string;
  position: Vector2;
  value: number;
  opacity: number;
  life: number;
}

export enum WeaponType {
  KUNAI = 'KUNAI',
  SHOTGUN = 'SHOTGUN',
  GUARDIAN = 'GUARDIAN',
  BAT = 'BAT',
  MOON_SLASH = 'MOON_SLASH', // Tsukuyomi Special
  YANG_AURA = 'YANG_AURA', // Master Yang Special
}

export interface UpgradeOption {
  id: string;
  title: string; // Dynamic title based on level
  name: string; // Base name
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type: 'WEAPON' | 'STAT';
  currentLevel: number;
  isEvo: boolean;
}

// --- Equipment & Inventory Types ---

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type EquipmentType = 'WEAPON' | 'NECKLACE' | 'GLOVES' | 'SUIT' | 'BELT' | 'BOOTS';

export interface InventoryItem {
  id: string;
  type: EquipmentType;
  rarity: Rarity;
  level: number;
  name: string; // e.g. "Kunai", "Metal Suit"
  plus?: number; // For Mythic+ enhancements (e.g. +1, +2)
  isDismantled?: boolean; // For auto-dismantle result display
}

export interface EquippedState {
  WEAPON: InventoryItem | null;
  NECKLACE: InventoryItem | null;
  GLOVES: InventoryItem | null;
  SUIT: InventoryItem | null;
  BELT: InventoryItem | null;
  BOOTS: InventoryItem | null;
}

// --- Character System Types ---

export type CharacterVisualType = 'DEFAULT' | 'BLOOD' | 'GOLD' | 'PIXEL' | 'VOID' | 'GALAXY' | 'DRAGON' | 'ETERNAL';

export interface CharacterStats {
    hpBonus: number; // Percentage (e.g., 0.1 for 10%)
    atkBonus: number;
    speedBonus: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  visualType: CharacterVisualType;
  primaryColor: string;
  baseStats: CharacterStats;
  requiredShards: number; // usually 30
  specialAbility: string;
}

// --- User Profile & Auth ---

export interface UserProfile {
  username: string;
  password?: string;
  highScore: number;
  gold: number;
  gems: number;
  keys: number;
  inventory: InventoryItem[];
  equipped: EquippedState;
  
  // Character System
  characterShards: Record<string, number>; // characterId -> count
  unlockedCharacters: string[]; // List of unlocked character IDs
  equippedCharacterId: string;
  
  purchasedDaily: string[];
}



export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  category: 'work' | 'personal' | 'important' | 'other';
}

export type ViewType = 'month' | 'week' | 'day';

export interface AISuggestion {
  title: string;
  date: string;
  time?: string;
  description?: string;
  category: 'work' | 'personal' | 'important' | 'other';
}
