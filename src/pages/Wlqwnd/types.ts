
export interface Vector2 {
  x: number;
  y: number;
}

export enum PlatformType {
  NORMAL = 'NORMAL',
  CRUMBLING = 'CRUMBLING', 
  SPIKE = 'SPIKE', 
  BREAKABLE = 'BREAKABLE',
  EXIT = 'EXIT',   // 다음 스테이지 문
  WATER = 'WATER', // 물 (물리 효과 변경)
}

export enum WeaponType {
  SWORD = 'SWORD',
  BOW = 'BOW',
  HAMMER = 'HAMMER',
  DRILL = 'DRILL', // New Weapon
}

export enum MonsterState {
  PATROL = 'PATROL',
  PREPARE = 'PREPARE', // 공격 전조 (Telegraphing)
  ATTACK = 'ATTACK',   // 실제 타격
  COOLDOWN = 'COOLDOWN'
}

export enum Rarity {
  THREE_STAR = 3,
  FOUR_STAR = 4,
  FIVE_STAR = 5,
  LIMITED = 6, // 한정판 등급 추가
}

export enum ItemType {
  CHARACTER = 'CHARACTER',
  WEAPON = 'WEAPON',
}

export interface GachaItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  statBonus: number; // HP or Damage
  speedBonus?: number; // 이동 속도 보너스 (캐릭터 고유 능력)
  jumpBonus?: number;  // 점프력 보너스 (캐릭터 고유 능력)
  color: string; // 테마 색상
  weaponType?: WeaponType; 
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  triggered?: boolean;
}

export interface Monster {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  patrolStart: number;
  patrolEnd: number;
  speed: number;
  direction: number; // 1 or -1
  hp: number;
  maxHp: number;
  state: MonsterState;
  stateTimer: number; // 상태 지속 시간 체크용
}

export type ProjectileType = 'ARROW' | 'FIREBALL' | 'WIND_BLADE' | 'VOID_ORB' | 'SHURIKEN' | 'HOLY_BOLT';

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number; 
  angle: number; 
  width: number;
  height: number;
  active: boolean;
  color: string;     // 투사체 색상
  type: ProjectileType; // 투사체 모양 결정
}

export type EffectType = 'EXPLOSION' | 'HEAL' | 'DOUBLE_JUMP' | 'HIT';

export interface VisualEffect {
  id: number;
  x: number;
  y: number;
  type: EffectType;
  timer: number; // 수명
}

export interface PlayerState {
  position: Vector2;
  velocity: Vector2;
  hp: number; 
  maxHp: number;
  isGrounded: boolean;
  isGliding: boolean; 
  focus: number; 
  isStunned: boolean; 
  facingRight: boolean;
  isAttacking: boolean; 
  currentWeapon: WeaponType; 
  invincibleTimer: number; 
  currentLevel: number; 
  
  // Equipment
  equippedCharacter: GachaItem | null;
  equippedWeaponSkin: GachaItem | null;
}
