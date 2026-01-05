
import { WeaponType, Character } from '../../types';

export const CANVAS_WIDTH = window.innerWidth;
export const CANVAS_HEIGHT = window.innerHeight;

export const PLAYER_BASE_SPEED = 5; 
export const PLAYER_BASE_HP = 100;
export const PLAYER_SIZE = 15;

export const ENEMY_SPAWN_RATE = 50; 

export const COLORS = {
  PLAYER: '#3B82F6', 
  ZOMBIE: '#EF4444', 
  FAST: '#F59E0B',   
  TANK: '#7F1D1D',   
  BOSS: '#7e22ce',   
  GEM: '#10B981',    
  PROJECTILE: '#FFFFFF',
};

export const CHARACTERS: Character[] = [
  {
    id: 'char_survivor',
    name: '공통 특공대원',
    description: 'EDF의 훈련을 수료한 기본 요원입니다.',
    rarity: 'COMMON',
    visualType: 'DEFAULT',
    primaryColor: '#3B82F6',
    baseStats: { hpBonus: 0, atkBonus: 0, speedBonus: 0 },
    requiredShards: 0, // Free
    specialAbility: '없음 (기본 능력)'
  },
  {
    id: 'char_tsuki',
    name: '츠키요미',
    description: '달빛 아래 춤추는 검객. 공격력이 강화됩니다.',
    rarity: 'RARE',
    visualType: 'BLOOD',
    primaryColor: '#EF4444',
    baseStats: { hpBonus: 0, atkBonus: 0.15, speedBonus: 0.05 }, 
    requiredShards: 30,
    specialAbility: '달빛 베기: 주기적으로 전방에 강력한 검기를 날립니다.'
  },
  {
    id: 'char_king',
    name: '킹',
    description: '생존 본능이 극대화된 요원. 치명적인 위력을 가집니다.',
    rarity: 'EPIC',
    visualType: 'GOLD',
    primaryColor: '#F59E0B',
    baseStats: { hpBonus: 0.1, atkBonus: 0.25, speedBonus: 0 }, 
    requiredShards: 30,
    specialAbility: '생존 본능: 치명타 확률이 대폭 증가합니다.'
  },
  {
    id: 'char_worm',
    name: '웜',
    description: '정보전을 담당하는 해커. 시스템을 조작합니다.',
    rarity: 'LEGENDARY',
    visualType: 'PIXEL',
    primaryColor: '#22D3EE',
    baseStats: { hpBonus: 0.2, atkBonus: 0.1, speedBonus: 0.1 }, 
    requiredShards: 30,
    specialAbility: '도청 장치: 주변 적들의 이동속도를 30% 감소시킵니다.'
  },
  {
    id: 'char_master',
    name: '마스터 양',
    description: '기공을 다루는 무술의 달인. 공수 밸런스가 완벽합니다.',
    rarity: 'MYTHIC',
    visualType: 'VOID',
    primaryColor: '#7C3AED',
    baseStats: { hpBonus: 0.5, atkBonus: 0.4, speedBonus: 0.1 }, 
    requiredShards: 30,
    specialAbility: '음양 조화: 주변 적에게 지속 피해를 입히고 체력을 회복합니다.'
  },
  {
    id: 'char_metallia',
    name: '메탈리아',
    description: '우주의 힘을 받아들인 사이보그.',
    rarity: 'MYTHIC',
    visualType: 'GALAXY',
    primaryColor: '#8b5cf6',
    baseStats: { hpBonus: 0.6, atkBonus: 0.5, speedBonus: 0.2 }, 
    requiredShards: 30,
    specialAbility: '사이보그 아머: 받는 피해가 20% 감소하고 벼락을 내립니다.'
  },
  {
    id: 'char_vi',
    name: '바이',
    description: '용의 피를 이어받은 전사. 압도적인 파괴력.',
    rarity: 'MYTHIC',
    visualType: 'DRAGON',
    primaryColor: '#ef4444',
    baseStats: { hpBonus: 0.4, atkBonus: 0.8, speedBonus: 0 },
    requiredShards: 30,
    specialAbility: '용의 숨결: 공격 시 일정 확률로 전방에 화염을 내뿜습니다.'
  },
  {
    id: 'char_alucard',
    name: '아카드',
    description: '신에 근접한 존재. 모든 능력치가 초월적입니다.',
    rarity: 'MYTHIC',
    visualType: 'ETERNAL',
    primaryColor: '#ffffff',
    baseStats: { hpBonus: 1.0, atkBonus: 1.0, speedBonus: 0.3 }, 
    requiredShards: 30,
    specialAbility: '흡혈: 적 처치 시 체력을 1% 회복합니다.'
  }
];

export const UPGRADE_DEFINITIONS = [
  {
    id: 'kunai',
    name: '쿠나이',
    description: '가장 가까운 적에게 수리검을 던집니다.',
    icon: 'Sword',
    type: 'WEAPON',
    rarity: 'COMMON'
  },
  {
    id: 'shotgun',
    name: '샷건',
    description: '전방 부채꼴 범위에 강력한 탄환을 발사합니다.',
    icon: 'Zap',
    type: 'WEAPON',
    rarity: 'RARE'
  },
  {
    id: 'bat',
    name: '야구방망이',
    description: '근접한 적들을 밀어내고 피해를 줍니다.',
    icon: 'Activity', 
    type: 'WEAPON',
    rarity: 'COMMON'
  },
  {
    id: 'guardian',
    name: '수호자',
    description: '주변을 회전하는 칼날이 적을 밀어냅니다.',
    icon: 'Shield',
    type: 'WEAPON',
    rarity: 'EPIC'
  },
  {
    id: 'atk_up',
    name: '강력한 총알',
    description: '공격력이 20% 증가합니다.',
    icon: 'Sword',
    type: 'STAT',
    rarity: 'COMMON'
  },
  {
    id: 'spd_up',
    name: '신속의 장화',
    description: '이동 속도가 15% 증가합니다.',
    icon: 'Footprints',
    type: 'STAT',
    rarity: 'COMMON'
  },
  {
    id: 'atk_spd_up',
    name: '에너지 드링크',
    description: '공격 속도가 15% 빨라집니다.',
    icon: 'Zap',
    type: 'STAT',
    rarity: 'RARE'
  },
  {
    id: 'hp_up',
    name: '건강한 신체',
    description: '최대 체력이 30% 증가합니다.',
    icon: 'Heart',
    type: 'STAT',
    rarity: 'COMMON'
  }
];
