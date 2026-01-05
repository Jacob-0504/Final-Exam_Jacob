import { GachaItem, ItemType, Rarity, WeaponType } from './types';

export const GRAVITY = 0.6;
export const FRICTION = 0.8;
// Speed Increased
export const MOVE_SPEED = 0.9; // Was 0.5
export const MAX_SPEED = 8; // Was 5
export const JUMP_FORCE = -14; 

// Gliding Physics
export const GLIDE_GRAVITY = 0.1; 
export const GLIDE_MAX_FALL = 2;  

// Water Physics
export const WATER_GRAVITY = 0.2; 
export const WATER_FRICTION = 0.9; 
export const WATER_JUMP_FORCE = -8; 

export const PLAYER_SIZE = 32;
export const PLAYER_MAX_HP = 3; 
export const PLAYER_INVINCIBLE_TIME = 60; 

// Weapon Stats
export const SWORD_RANGE = 60; 
export const SWORD_COOLDOWN = 300; 
export const SWORD_DAMAGE = 1; 

export const HAMMER_RANGE = 45;
export const HAMMER_COOLDOWN = 800; 
export const HAMMER_DAMAGE = 0; 

export const BOW_COOLDOWN = 600;
export const ARROW_SPEED = 12; 
export const ARROW_SIZE = 20;
export const BOW_DAMAGE = 1; 

export const DRILL_COOLDOWN = 1000;

// Monster Stats
export const MONSTER_MAX_HP = 3; 
export const MONSTER_DETECT_RANGE = 250; 
export const MONSTER_ATTACK_RANGE = 50; 
export const MONSTER_PREPARE_TIME = 40; 
export const MONSTER_ATTACK_DURATION = 15; 
export const MONSTER_COOLDOWN_TIME = 60; 

// Map Dimensions
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 1000; 
export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 600;

export const MAX_FOCUS = 100;
export const FOCUS_DRAIN_PASSIVE = 0.05;
export const FOCUS_DRAIN_MOVE = 0.1;
export const FOCUS_REGEN_STILL = 0.4;
export const FOCUS_REGEN_STUNNED = 0.8; 
export const FOCUS_DAMAGE_PENALTY = 20;

// Gacha Items Database - LIMITED CHARACTERS ADDED
export const GACHA_ITEMS: GachaItem[] = [
  // --- LIMITED CHARACTERS (PICKUP) ---
  { 
    id: 'limit_1', name: '불꽃의 기사 Ignis', type: ItemType.CHARACTER, rarity: Rarity.LIMITED, 
    description: '공격력이 높고 열정적입니다.', statBonus: 1, speedBonus: 1.0, jumpBonus: 0, color: '#FF4500' 
  },
  { 
    id: 'limit_2', name: '바람의 순찰자 Zephyr', type: ItemType.CHARACTER, rarity: Rarity.LIMITED, 
    description: '바람을 타고 높이 점프합니다.', statBonus: 0, speedBonus: 0.5, jumpBonus: -2, color: '#00FF7F' 
  },

  // 3 Star Characters
  { id: 'c3_1', name: '견습 탐험가', type: ItemType.CHARACTER, rarity: Rarity.THREE_STAR, description: '이제 막 모험을 시작했습니다.', statBonus: 0, speedBonus: 0, jumpBonus: 0, color: '#A0AEC0' },
  { id: 'c3_2', name: '마을 경비병', type: ItemType.CHARACTER, rarity: Rarity.THREE_STAR, description: '튼튼한 체력을 가졌습니다.', statBonus: 0, speedBonus: -0.5, jumpBonus: 0, color: '#718096' },
  
  // 4 Star Characters
  { id: 'c4_1', name: '그림자 닌자', type: ItemType.CHARACTER, rarity: Rarity.FOUR_STAR, description: '어둠 속에서 집중력이 빛납니다.', statBonus: 0, speedBonus: 1.5, jumpBonus: 0, color: '#9F7AEA' }, 
  { id: 'c4_2', name: '숲의 감시자', type: ItemType.CHARACTER, rarity: Rarity.FOUR_STAR, description: '자연의 힘으로 생명력이 넘칩니다.', statBonus: 1, speedBonus: 0.2, jumpBonus: 0, color: '#48BB78' },
  
  // 5 Star Characters
  { id: 'c5_1', name: '공허의 지배자', type: ItemType.CHARACTER, rarity: Rarity.FIVE_STAR, description: '차원을 넘나드는 절대적 존재.', statBonus: 2, speedBonus: 0.5, jumpBonus: -1, color: '#805AD5' }, 
  { id: 'c5_2', name: '태양의 성기사', type: ItemType.CHARACTER, rarity: Rarity.FIVE_STAR, description: '불굴의 의지로 모든 것을 견딥니다.', statBonus: 3, speedBonus: -0.5, jumpBonus: 0, color: '#ECC94B' },

  // --- WEAPONS ---
  
  // NEW LIMITED WEAPONS (Signature)
  { id: 'limit_w1', name: '인페르노 블레이드', type: ItemType.WEAPON, rarity: Rarity.LIMITED, description: '이그니스의 전용 대검. 불타오릅니다.', statBonus: 2.5, color: '#FF4500', weaponType: WeaponType.SWORD },
  { id: 'limit_w2', name: '폭풍의 시', type: ItemType.WEAPON, rarity: Rarity.LIMITED, description: '제피로스의 전용 활. 바람을 가릅니다.', statBonus: 2.5, color: '#00FF7F', weaponType: WeaponType.BOW },

  // 3 Star Weapons
  { id: 'w3_1', name: '녹슨 검', type: ItemType.WEAPON, rarity: Rarity.THREE_STAR, description: '관리가 필요한 검.', statBonus: 0, color: '#A0AEC0', weaponType: WeaponType.SWORD },
  { id: 'w3_2', name: '수련용 활', type: ItemType.WEAPON, rarity: Rarity.THREE_STAR, description: '가볍지만 약합니다.', statBonus: 0, color: '#A0AEC0', weaponType: WeaponType.BOW },
  { id: 'w3_3', name: '돌 망치', type: ItemType.WEAPON, rarity: Rarity.THREE_STAR, description: '단단한 돌덩이입니다.', statBonus: 0, color: '#A0AEC0', weaponType: WeaponType.HAMMER },

  // 4 Star Weapons
  { id: 'w4_drill', name: '채광용 드릴', type: ItemType.WEAPON, rarity: Rarity.FOUR_STAR, description: '지형을 뚫어 길을 만듭니다.', statBonus: 0, color: '#E2E8F0', weaponType: WeaponType.DRILL }, 
  { id: 'w4_1', name: '카타나', type: ItemType.WEAPON, rarity: Rarity.FOUR_STAR, description: '매우 날카로운 검.', statBonus: 0.5, color: '#9F7AEA', weaponType: WeaponType.SWORD },
  { id: 'w4_2', name: '컴파운드 보우', type: ItemType.WEAPON, rarity: Rarity.FOUR_STAR, description: '기계식 장치로 강화된 활.', statBonus: 0.5, color: '#9F7AEA', weaponType: WeaponType.BOW },
  { id: 'w4_3', name: '워해머', type: ItemType.WEAPON, rarity: Rarity.FOUR_STAR, description: '갑옷을 뚫는 파괴력.', statBonus: 0.5, color: '#9F7AEA', weaponType: WeaponType.HAMMER },

  // 5 Star Weapons
  { id: 'w5_1', name: '빛의 인도자', type: ItemType.WEAPON, rarity: Rarity.FIVE_STAR, description: '어둠을 가르는 전설의 검.', statBonus: 1.5, color: '#F6E05E', weaponType: WeaponType.SWORD },
  { id: 'w5_2', name: '용의 숨결', type: ItemType.WEAPON, rarity: Rarity.FIVE_STAR, description: '화살 끝에서 폭발이 일어납니다.', statBonus: 1.5, color: '#F6E05E', weaponType: WeaponType.BOW },
  { id: 'w5_3', name: '티탄의 철퇴', type: ItemType.WEAPON, rarity: Rarity.FIVE_STAR, description: '대지를 뒤흔드는 힘.', statBonus: 1.5, color: '#F6E05E', weaponType: WeaponType.HAMMER },
];


// Level 1: The Descent (EASIER VERSION - NO SPIKES)
export const LEVEL_1_PLATFORMS = [
  // Start Platform (Top Left)
  { id: 1, x: 0, y: 80, width: 350, height: 30, type: 'NORMAL' },
  
  // High Floating Platforms (Wider, Closer)
  { id: 2, x: 400, y: 150, width: 200, height: 20, type: 'CRUMBLING' },
  { id: 3, x: 650, y: 150, width: 250, height: 20, type: 'NORMAL' },
  
  // Middle Layer (Connected more safely)
  { id: 4, x: 250, y: 350, width: 600, height: 20, type: 'NORMAL' },
  { id: 5, x: 0, y: 300, width: 200, height: 20, type: 'NORMAL' },
  { id: 6, x: 880, y: 400, width: 120, height: 20, type: 'NORMAL' },

  // Trap Layer (WAS SPIKE, NOW NORMAL)
  { id: 7, x: 200, y: 600, width: 600, height: 20, type: 'NORMAL' }, 
  { id: 71, x: 400, y: 500, width: 200, height: 20, type: 'NORMAL' }, // Safety platform above
  
  // Safe Platforms near bottom
  { id: 8, x: 50, y: 550, width: 150, height: 20, type: 'NORMAL' },
  { id: 9, x: 800, y: 550, width: 150, height: 20, type: 'NORMAL' },

  // Lower Descent
  { id: 10, x: 300, y: 750, width: 400, height: 20, type: 'CRUMBLING' },
  { id: 11, x: 50, y: 850, width: 200, height: 20, type: 'NORMAL' },
  
  // Bottom Floor
  { id: 12, x: 0, y: 950, width: 1000, height: 50, type: 'NORMAL' },

  // Walls
  { id: 13, x: 0, y: 0, width: 20, height: 1000, type: 'NORMAL' },
  { id: 14, x: 980, y: 0, width: 20, height: 1000, type: 'NORMAL' },

  // Exit at Bottom Right
  { id: 99, x: 900, y: 890, width: 40, height: 60, type: 'EXIT' },
] as const;

export const INITIAL_MONSTERS_L1 = [
  { id: 1, x: 300, y: 320, width: 30, height: 30, patrolStart: 250, patrolEnd: 750, speed: 1.0, direction: 1, hp: MONSTER_MAX_HP, maxHp: MONSTER_MAX_HP, state: 'PATROL', stateTimer: 0 },
  { id: 2, x: 700, y: 120, width: 30, height: 30, patrolStart: 650, patrolEnd: 850, speed: 1.2, direction: -1, hp: MONSTER_MAX_HP, maxHp: MONSTER_MAX_HP, state: 'PATROL', stateTimer: 0 },
] as const;

// Level 2 (EASIER VERSION - NO SPIKES)
export const LEVEL_2_PLATFORMS = [
  { id: 1, x: 20, y: 80, width: 300, height: 20, type: 'NORMAL' },
  { id: 2, x: 350, y: 200, width: 200, height: 20, type: 'CRUMBLING' }, 
  { id: 3, x: 600, y: 350, width: 200, height: 20, type: 'NORMAL' },
  { id: 4, x: 0, y: 500, width: 1000, height: 450, type: 'WATER' },
  { id: 5, x: 50, y: 650, width: 300, height: 20, type: 'NORMAL' }, // Safer landing
  { id: 6, x: 400, y: 800, width: 500, height: 20, type: 'NORMAL' }, // WAS SPIKE, NOW NORMAL
  { id: 7, x: 450, y: 700, width: 100, height: 20, type: 'NORMAL' }, 
  { id: 99, x: 900, y: 600, width: 40, height: 60, type: 'EXIT' },
] as const;

export const INITIAL_MONSTERS_L2 = [
  { id: 1, x: 620, y: 320, width: 30, height: 30, patrolStart: 600, patrolEnd: 750, speed: 0.8, direction: 1, hp: MONSTER_MAX_HP, maxHp: MONSTER_MAX_HP, state: 'PATROL', stateTimer: 0 },
] as const;