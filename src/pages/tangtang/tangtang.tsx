
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Game from './components/Game';
import { GameState, InventoryItem, EquippedState, Rarity, EquipmentType, UserProfile, Character } from '../../types';
import { CHARACTERS } from './constants';
import { 
  Play, Trophy, Skull, User, Settings, ShoppingCart, 
  Zap, Gem, Coins, Home as HomeIcon, Package, 
  Sword, Shield, Footprints, Shirt, Box, Hammer, Trash2, Layers,
  Key, Clock, Scroll, FileText, Sparkles, X, ArrowRight, CheckCircle, Crown, Lock, LogIn, LogOut, Heart, Filter, Grid,
  Calculator, TrendingUp, DollarSign, Star
} from 'lucide-react';

const CharacterPreview = ({ characterId, size = "normal" }: { characterId: string, size?: "small" | "normal" | "large" }) => {
    const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    const visualType = character.visualType;
    
    const scale = size === "small" ? 0.3 : size === "large" ? 1.2 : 1;

    const RenderSkin = () => {
        switch (visualType) {
            case 'BLOOD': 
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-24 h-28 bg-[#450a0a] rounded-t-lg border-2 border-red-600"></div>
                        <div className="absolute w-20 h-20 bg-[#fecaca] rounded-full -top-4 border-2 border-red-900 overflow-hidden">
                            <div className="absolute w-full h-1/2 bg-[#991b1b] top-0"></div>
                        </div>
                    </div>
                );
            case 'GOLD': 
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-24 h-32 bg-[#1c1917] rounded-lg border-2 border-yellow-600"></div>
                        <div className="absolute w-20 h-20 bg-[#fef3c7] rounded-full -top-4 border-2 border-yellow-800 overflow-hidden">
                             <div className="absolute w-full h-1/2 bg-[#fbbf24] top-0 rotate-[-10deg] scale-125"></div>
                        </div>
                    </div>
                );
            case 'VOID': 
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-28 h-32 bg-white rounded-full border-4 border-black shadow-[0_0_20px_#7c3aed]"></div>
                        <div className="absolute w-28 h-32 bg-black rounded-full" style={{ clipPath: 'inset(0 50% 0 0)' }}></div>
                        <div className="absolute w-20 h-20 bg-[#ddd] rounded-full -top-6 border-2 border-gray-400"></div>
                    </div>
                );
            case 'ETERNAL': 
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-40 h-40 rounded-full bg-white opacity-20 blur-2xl animate-pulse"></div>
                        <div className="absolute w-24 h-32 bg-white rounded-2xl border-2 border-yellow-200 shadow-[0_0_50px_white]"></div>
                        <div className="absolute w-20 h-20 bg-[#fff] rounded-full -top-8 border-2 border-yellow-400"></div>
                    </div>
                );
            default: 
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-24 h-28 bg-[#1e293b] rounded-t-xl border-2 border-blue-500"></div>
                        <div className="absolute w-20 h-20 bg-[#f1f5f9] rounded-full -top-4 border-2 border-blue-900 overflow-hidden">
                             <div className="absolute w-full h-1/3 bg-[#0f172a] top-0"></div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`relative flex items-center justify-center transition-transform duration-300`} 
             style={{ width: size === "small" ? '48px' : '160px', height: size === "small" ? '48px' : '160px', transform: `scale(${scale})` }}>
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse`} 
                 style={{ backgroundColor: character.primaryColor }}></div>
            <div className="relative z-10 w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                <RenderSkin />
            </div>
        </div>
    );
};

const EquipmentSlot = ({ slotType, item, onUnequip }: { slotType: EquipmentType, item: InventoryItem | null, onUnequip: (slot: EquipmentType) => void }) => {
    let DefaultIcon = Box;
    if (slotType === 'WEAPON') DefaultIcon = Sword;
    if (slotType === 'NECKLACE') DefaultIcon = Gem;
    if (slotType === 'GLOVES') DefaultIcon = Box;
    if (slotType === 'SUIT') DefaultIcon = Shirt;
    if (slotType === 'BELT') DefaultIcon = Shield;
    if (slotType === 'BOOTS') DefaultIcon = Footprints;

    let ItemIcon = DefaultIcon;
    if (item) {
       if (item.type === 'WEAPON') ItemIcon = Sword;
       if (item.type === 'NECKLACE') ItemIcon = Gem;
       if (item.type === 'GLOVES') ItemIcon = Box;
       if (item.type === 'SUIT') ItemIcon = Shirt;
       if (item.type === 'BELT') ItemIcon = Shield;
       if (item.type === 'BOOTS') ItemIcon = Footprints;
    }

    return (
        <div 
          onClick={() => item && onUnequip(slotType)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center relative shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer bg-[#232a35] ${
          item ? (
            item.rarity === 'MYTHIC' ? 'border-fuchsia-500 bg-fuchsia-900/20 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
            item.rarity === 'LEGENDARY' ? 'border-red-500/50 bg-red-900/10' :
            item.rarity === 'EPIC' ? 'border-yellow-500/50 bg-yellow-900/10' :
            item.rarity === 'RARE' ? 'border-blue-500/50 bg-blue-900/10' :
            'border-gray-500'
          ) : 'border-gray-700 opacity-50'
        }`}>
          {item ? (
              <>
                <ItemIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    item.rarity === 'MYTHIC' ? 'text-fuchsia-400' :
                    item.rarity === 'LEGENDARY' ? 'text-red-500' :
                    item.rarity === 'EPIC' ? 'text-yellow-500' :
                    item.rarity === 'RARE' ? 'text-blue-500' :
                    'text-gray-300'
                }`} />
                <div className="absolute -bottom-2 -right-2 bg-black text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-600 z-10 text-white">
                    {item.level}
                </div>
              </>
          ) : (
             <DefaultIcon className="w-6 h-6 text-gray-600" />
          )}
        </div>
    );
};

const InventorySlot: React.FC<{ item: InventoryItem; onClick?: () => void; isSelected?: boolean }> = ({ item, onClick, isSelected }) => {
    let ItemIcon = Box;
    if (item.type === 'WEAPON') ItemIcon = Sword;
    if (item.type === 'NECKLACE') ItemIcon = Gem;
    if (item.type === 'GLOVES') ItemIcon = Box;
    if (item.type === 'SUIT') ItemIcon = Shirt;
    if (item.type === 'BELT') ItemIcon = Shield;
    if (item.type === 'BOOTS') ItemIcon = Footprints;

    return (
        <div 
            onClick={onClick}
            className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative cursor-pointer transition-all bg-[#232a35] ${
            isSelected ? 'border-red-500 bg-red-900/30' : (
                item.rarity === 'MYTHIC' ? 'border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.2)]' :
                item.rarity === 'LEGENDARY' ? 'border-red-500/50' :
                item.rarity === 'EPIC' ? 'border-yellow-500/50' :
                item.rarity === 'RARE' ? 'border-blue-500/50' :
                'border-gray-600 hover:border-gray-400'
            )
        }`}>
            <ItemIcon className={`w-5 h-5 ${
                item.rarity === 'MYTHIC' ? 'text-fuchsia-400' :
                item.rarity === 'LEGENDARY' ? 'text-red-500' :
                item.rarity === 'EPIC' ? 'text-yellow-500' :
                item.rarity === 'RARE' ? 'text-blue-500' :
                'text-gray-400'
            }`} />
            <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] px-1 rounded text-white font-bold">
                {item.level}
            </div>
        </div>
    );
};

const tangtang: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [activeTab, setActiveTab] = useState<'SHOP' | 'EQUIPMENT' | 'HOME' | 'RANKING'>('HOME');
  const [activeModal, setActiveModal] = useState<'NONE' | 'CHARACTER_SELECT' | 'GACHA_RESULT'>('NONE');
  
  const [gold, setGold] = useState(0);
  const [gems, setGems] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipped, setEquipped] = useState<EquippedState>({
    WEAPON: null, NECKLACE: null, GLOVES: null, SUIT: null, BELT: null, BOOTS: null,
  });
  const [equippedCharacterId, setEquippedCharacterId] = useState<string>('char_survivor');
  
  const [gachaResults, setGachaResults] = useState<{items: InventoryItem[], summary?: Record<string, number>, goldGained?: number} | null>(null);
  const [autoDismantleRarity, setAutoDismantleRarity] = useState<Rarity | 'NONE'>('NONE');
  const [isGachaAnimating, setIsGachaAnimating] = useState(false);
  const [customMoneyInput, setCustomMoneyInput] = useState<string>('');

  // 1. Initial Data Load
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('survivor_users') || '{}');
    const defaultUsername = 'Player';
    let user = storedUsers[defaultUsername];

    if (!user) {
        user = {
            username: defaultUsername,
            highScore: 0,
            gold: 5000,
            gems: 1000,
            keys: 5,
            inventory: [{ id: 'init_w', type: 'WEAPON', rarity: 'COMMON', level: 1, name: '낡은 쿠나이' }],
            equipped: { WEAPON: null, NECKLACE: null, GLOVES: null, SUIT: null, BELT: null, BOOTS: null },
            characterShards: {},
            unlockedCharacters: ['char_survivor'],
            equippedCharacterId: 'char_survivor',
            purchasedDaily: []
        };
        storedUsers[defaultUsername] = user;
        localStorage.setItem('survivor_users', JSON.stringify(storedUsers));
    }
    
    setCurrentUser(user);
    setGold(user.gold);
    setGems(user.gems);
    setInventory(user.inventory || []);
    setEquipped(user.equipped);
    setEquippedCharacterId(user.equippedCharacterId || 'char_survivor');
  }, []);

  // 2. State Persistence (Save whenever key values change)
  useEffect(() => {
    if (!currentUser) return;
    const storedUsers = JSON.parse(localStorage.getItem('survivor_users') || '{}');
    const updatedUser: UserProfile = {
        ...currentUser,
        gold, gems, inventory, equipped, equippedCharacterId
    };
    storedUsers[currentUser.username] = updatedUser;
    localStorage.setItem('survivor_users', JSON.stringify(storedUsers));
  }, [gold, gems, inventory, equipped, equippedCharacterId]);

  const generateRandomItem = useCallback((): InventoryItem => {
      const types: EquipmentType[] = ['WEAPON', 'NECKLACE', 'GLOVES', 'SUIT', 'BELT', 'BOOTS'];
      const type = types[Math.floor(Math.random() * types.length)];
      let rarity: Rarity = 'COMMON';
      const roll = Math.random();
      if (roll > 0.998) rarity = 'LEGENDARY';
      else if (roll > 0.95) rarity = 'EPIC';
      else if (roll > 0.8) rarity = 'RARE';
      
      const names: Record<EquipmentType, string[]> = {
        WEAPON: ['쿠나이', '야구방망이', '카타나', '리볼버', '샷건'],
        NECKLACE: ['메탈 목걸이', '에메랄드 목걸이', '가시 목걸이'],
        GLOVES: ['가죽 장갑', '전술 장갑', '빛나는 장갑'],
        SUIT: ['방탄 조끼', '풀 메탈 슈트', '여행자 망토'],
        BELT: ['가죽 벨트', '전술 벨트', '넓은 허리띠'],
        BOOTS: ['가죽 신발', '군용 부츠', '하이테크 신발']
      };
      const name = names[type][Math.floor(Math.random() * names[type].length)];
      return { id: Math.random().toString(36).substring(2, 11), type, rarity, level: 1, name };
  }, []);

  const getRarityValue = (r: Rarity | 'NONE'): number => {
      if (r === 'NONE') return 0;
      if (r === 'COMMON') return 1;
      if (r === 'RARE') return 2;
      if (r === 'EPIC') return 3;
      if (r === 'LEGENDARY') return 4;
      if (r === 'MYTHIC') return 5;
      return 0;
  };

  const handleSupplyOpen = (count: number) => {
    const cost = 300 * count;
    if (gems < cost) { alert("보석이 부족합니다!"); return; }
    
    setGems(prev => prev - cost);
    setIsGachaAnimating(true);

    setTimeout(() => {
        const itemsToKeep: InventoryItem[] = [];
        let goldFromDismantle = 0;
        const summary: Record<string, number> = { 'COMMON': 0, 'RARE': 0, 'EPIC': 0, 'LEGENDARY': 0 };
        const threshold = getRarityValue(autoDismantleRarity);

        for (let i = 0; i < count; i++) {
            const item = generateRandomItem();
            summary[item.rarity]++;
            if (threshold > 0 && getRarityValue(item.rarity) <= threshold) {
                goldFromDismantle += (item.rarity === 'RARE' ? 500 : 100);
            } else {
                itemsToKeep.push(item);
            }
        }

        setInventory(prev => [...itemsToKeep, ...prev]);
        setGold(prev => prev + goldFromDismantle);
        setGachaResults({
            items: count > 30 ? [] : itemsToKeep,
            summary: count > 30 ? summary : undefined,
            goldGained: goldFromDismantle
        });
        setIsGachaAnimating(false);
        setActiveModal('GACHA_RESULT');
    }, 500);
  };

  const handleChargeCustom = () => {
    const amount = parseInt(customMoneyInput);
    if (isNaN(amount) || amount <= 0) { alert('충전할 금액(숫자)을 입력해주세요.'); return; }
    const gemGain = Math.floor(amount / 10);
    if (confirm(`${amount.toLocaleString()}원을 결제하여 보석 ${gemGain.toLocaleString()}개를 충전하시겠습니까?`)) {
        setGems(prev => prev + gemGain);
        setCustomMoneyInput('');
        alert(`${gemGain.toLocaleString()} 보석 충전 완료!`);
    }
  };

  const handleEquipItem = (item: InventoryItem) => {
    const slot = item.type;
    const prevEquipped = equipped[slot];
    
    setEquipped(prev => ({ ...prev, [slot]: item }));
    setInventory(prev => {
        const filtered = prev.filter(i => i.id !== item.id);
        if (prevEquipped) return [prevEquipped, ...filtered];
        return filtered;
    });
  };

  const handleUnequipItem = (slot: EquipmentType) => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped(prev => ({ ...prev, [slot]: null }));
    setInventory(prev => [item, ...prev]);
  };

  const handleDismantleAll = () => {
    if (!confirm('일반 및 레어 등급의 장비를 모두 분해하시겠습니까?')) return;
    let gainedGold = 0;
    const keptItems = inventory.filter(item => {
        if (item.rarity === 'COMMON' || item.rarity === 'RARE') {
            gainedGold += (item.rarity === 'RARE' ? 500 : 100);
            return false;
        }
        return true;
    });
    setInventory(keptItems);
    setGold(prev => prev + gainedGold);
    alert(`${gainedGold.toLocaleString()} 골드를 획득했습니다.`);
  };

  const calculateTotalStats = () => {
      let atk = 1000;
      let hp = 5000;
      (Object.values(equipped) as (InventoryItem | null)[]).forEach(item => {
          if (!item) return;
          atk += (item.level * 25);
          hp += (item.level * 120);
          if (item.rarity === 'LEGENDARY') { atk += 1000; hp += 5000; }
          if (item.rarity === 'EPIC') { atk += 500; hp += 2000; }
          if (item.rarity === 'MYTHIC') { atk += 3000; hp += 15000; }
      });
      const char = CHARACTERS.find(c => c.id === equippedCharacterId);
      if (char) {
          atk = Math.floor(atk * (1 + char.baseStats.atkBonus));
          hp = Math.floor(hp * (1 + char.baseStats.hpBonus));
      }
      return { atk, hp };
  };

  const stats = calculateTotalStats();

  if (gameState === GameState.PLAYING) {
    return (
      <Game 
        onGameOver={(s) => { setGold(prev => prev + Math.floor(s/10)); setGameState(GameState.MENU); }} 
        gameState={gameState} 
        setGameState={setGameState} 
        initialStats={{ hp: stats.hp, attack: stats.atk }} 
        equippedWeaponName={equipped.WEAPON?.name || '쿠나이'} 
        equippedCharacterId={equippedCharacterId} 
      />
    );
  }

  return (
    <div className="w-full h-full bg-gray-950 text-white flex flex-col overflow-hidden select-none font-sans">
      {/* Top HUD */}
      <div className="p-4 bg-[#1F2937] border-b border-gray-800 flex justify-between items-center shadow-2xl z-20">
        <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden border border-indigo-400">
                <CharacterPreview characterId={equippedCharacterId} size="small" />
             </div>
             <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Survivor</div>
                <div className="text-sm font-black italic text-white tracking-tighter">CMD. {CHARACTERS.find(c => c.id === equippedCharacterId)?.name}</div>
             </div>
        </div>
        <div className="flex gap-2">
            <div className="bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-700/50">
                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-black">{gold.toLocaleString()}</span>
            </div>
            <div className="bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-700/50">
                <Gem className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-black">{gems.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#0f172a]">
        {activeTab === 'HOME' && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="relative mb-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveModal('CHARACTER_SELECT')}>
                    <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full"></div>
                    <CharacterPreview characterId={equippedCharacterId} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] px-3 py-1 rounded-full font-black italic flex items-center gap-1">
                        <User className="w-3 h-3" /> SKIN CHANGE
                    </div>
                </div>
                
                <div className="mb-10 bg-black/60 backdrop-blur-xl p-5 rounded-[2rem] border-2 border-gray-800 flex gap-10 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 font-black uppercase mb-1">ATK</div>
                        <div className="flex items-center gap-2 text-2xl font-black text-red-500 italic"><Sword className="w-5 h-5"/>{stats.atk.toLocaleString()}</div>
                    </div>
                    <div className="w-px bg-gray-800 h-10 self-center"></div>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 font-black uppercase mb-1">HP</div>
                        <div className="flex items-center gap-2 text-2xl font-black text-green-500 italic"><Heart className="w-5 h-5"/>{stats.hp.toLocaleString()}</div>
                    </div>
                </div>

                <button onClick={() => setGameState(GameState.PLAYING)} className="relative group active:scale-95 transition-all">
                    <div className="absolute -inset-1 bg-blue-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative bg-gradient-to-b from-blue-500 to-indigo-700 w-72 h-24 rounded-[2.5rem] shadow-2xl border-t-4 border-blue-300 flex items-center justify-center gap-4">
                        <span className="text-3xl font-black italic tracking-widest text-white">BATTLE START</span>
                        <Play className="w-10 h-10 fill-white text-white" />
                    </div>
                </button>
            </div>
        )}

        {activeTab === 'SHOP' && (
            <div className="h-full overflow-y-auto p-4 pb-32 space-y-6 custom-scrollbar">
                {/* SUPPLY BOX */}
                <div className="bg-gradient-to-br from-blue-900/80 to-slate-950 p-6 rounded-[2.5rem] border-2 border-blue-400 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-black italic text-white uppercase">EDF Supply Box</h2>
                        <div className="flex bg-black/60 p-1 rounded-xl border border-blue-800/50">
                            {(['NONE', 'COMMON', 'RARE'] as const).map(opt => (
                                <button key={opt} onClick={() => setAutoDismantleRarity(opt)} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${autoDismantleRarity === opt ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{opt === 'NONE' ? 'OFF' : opt}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleSupplyOpen(1)} className="bg-black/40 hover:bg-black/60 p-4 rounded-3xl border border-blue-500/30 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <Box className="w-10 h-10 text-blue-400 mb-1" /><div className="text-xs font-black">OPEN 1</div>
                            <div className="text-xs font-black text-blue-300 flex items-center gap-1"><Gem className="w-3 h-3"/> 300</div>
                        </button>
                        <button onClick={() => handleSupplyOpen(10)} className="bg-blue-800/20 hover:bg-blue-800/30 p-4 rounded-3xl border-2 border-blue-400 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <Layers className="w-10 h-10 text-white mb-1" /><div className="text-xs font-black">OPEN 10</div>
                            <div className="text-xs font-black text-blue-200 flex items-center gap-1"><Gem className="w-3 h-3"/> 3,000</div>
                        </button>
                    </div>
                </div>

                {/* CUSTOM RECHARGE */}
                <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border-2 border-emerald-500/30 shadow-xl">
                    <h3 className="text-lg font-black italic text-white uppercase mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-emerald-400" /> Custom Recharge</h3>
                    <div className="flex gap-3">
                        <input type="number" value={customMoneyInput} onChange={(e) => setCustomMoneyInput(e.target.value)} placeholder="충전 금액(원)" className="flex-1 bg-black border border-gray-700 rounded-2xl px-4 py-3 text-white font-black italic focus:outline-none focus:border-emerald-500" />
                        <button onClick={handleChargeCustom} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-2xl font-black italic transition-all active:scale-95">충전</button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'EQUIPMENT' && (
            <div className="h-full flex flex-col">
                <div className="relative h-[300px] flex items-center justify-center my-4">
                    <div className="absolute left-6 space-y-5">
                        <EquipmentSlot slotType="WEAPON" item={equipped.WEAPON} onUnequip={handleUnequipItem} />
                        <EquipmentSlot slotType="NECKLACE" item={equipped.NECKLACE} onUnequip={handleUnequipItem} />
                        <EquipmentSlot slotType="GLOVES" item={equipped.GLOVES} onUnequip={handleUnequipItem} />
                    </div>
                    <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveModal('CHARACTER_SELECT')}>
                        <CharacterPreview characterId={equippedCharacterId} />
                    </div>
                    <div className="absolute right-6 space-y-5">
                        <EquipmentSlot slotType="SUIT" item={equipped.SUIT} onUnequip={handleUnequipItem} />
                        <EquipmentSlot slotType="BELT" item={equipped.BELT} onUnequip={handleUnequipItem} />
                        <EquipmentSlot slotType="BOOTS" item={equipped.BOOTS} onUnequip={handleUnequipItem} />
                    </div>
                </div>
                
                <div className="px-6 flex gap-4 mb-4">
                    <button onClick={handleDismantleAll} className="flex-1 bg-red-900/30 border-2 border-red-500/40 p-3 rounded-2xl flex items-center justify-center gap-2 font-black italic text-red-400 active:scale-95"><Trash2 className="w-5 h-5"/>모두 분해</button>
                    <button onClick={() => setActiveModal('CHARACTER_SELECT')} className="flex-1 bg-indigo-900/30 border-2 border-indigo-500/40 p-3 rounded-2xl flex items-center justify-center gap-2 font-black italic text-indigo-400 active:scale-95"><User className="w-5 h-5"/>스킨 변경</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    <div className="grid grid-cols-5 gap-3">
                        {inventory.map(item => (
                            <InventorySlot key={item.id} item={item} onClick={() => handleEquipItem(item)} />
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-[#1F2937] border-t border-gray-800 p-4 pb-10 flex justify-around items-center z-30 shadow-2xl">
        <button onClick={() => setActiveTab('SHOP')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'SHOP' ? 'text-yellow-400 scale-110' : 'text-gray-500'}`}><ShoppingCart className="w-6 h-6"/><span className="text-[10px] font-black italic">SHOP</span></button>
        <button onClick={() => setActiveTab('EQUIPMENT')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'EQUIPMENT' ? 'text-blue-400 scale-110' : 'text-gray-500'}`}><Shirt className="w-6 h-6"/><span className="text-[10px] font-black italic">EQUIP</span></button>
        <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'HOME' ? 'text-white scale-110' : 'text-gray-500'}`}><HomeIcon className="w-6 h-6"/><span className="text-[10px] font-black italic">HOME</span></button>
        <button onClick={() => setActiveTab('RANKING')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'RANKING' ? 'text-purple-400 scale-110' : 'text-gray-500'}`}><Trophy className="w-6 h-6"/><span className="text-[10px] font-black italic">RANK</span></button>
      </div>

      {/* Character Select Modal */}
      {activeModal === 'CHARACTER_SELECT' && (
          <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-gray-900 w-full max-w-md rounded-[3rem] border-2 border-gray-800 p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black italic">CHOOSE SURVIVOR</h2>
                      <button onClick={() => setActiveModal('NONE')} className="p-2 bg-gray-800 rounded-full"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                      {CHARACTERS.map(char => {
                          const isLocked = !currentUser?.unlockedCharacters.includes(char.id) && char.requiredShards > 0;
                          return (
                              <div key={char.id} 
                                   onClick={() => {
                                       if (!isLocked) { setEquippedCharacterId(char.id); setActiveModal('NONE'); }
                                   }}
                                   className={`p-4 rounded-3xl border-2 flex items-center gap-6 cursor-pointer transition-all ${equippedCharacterId === char.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 bg-gray-800/40'} ${isLocked ? 'opacity-50 grayscale' : 'hover:scale-102'}`}>
                                  <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden">
                                      <CharacterPreview characterId={char.id} size="small" />
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                          <h3 className="font-black italic text-lg">{char.name}</h3>
                                          {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
                                      </div>
                                      <p className="text-[10px] text-gray-400 font-bold mb-1">{char.specialAbility}</p>
                                      <div className="flex gap-4">
                                          <div className="text-[9px] font-black text-red-500 uppercase">ATK +{char.baseStats.atkBonus*100}%</div>
                                          <div className="text-[9px] font-black text-green-500 uppercase">HP +{char.baseStats.hpBonus*100}%</div>
                                      </div>
                                  </div>
                                  {equippedCharacterId === char.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Gacha Result Modal */}
      {activeModal === 'GACHA_RESULT' && gachaResults && (
          <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-in zoom-in duration-300">
              <div className="w-full max-w-sm flex flex-col items-center">
                  <h2 className="text-3xl font-black italic mb-8 tracking-tighter">SUPPLY RESULT</h2>
                  {gachaResults.summary ? (
                      <div className="w-full grid grid-cols-2 gap-3 mb-8">
                          {Object.entries(gachaResults.summary).map(([rarity, count]) => (
                              <div key={rarity} className="bg-gray-800/80 p-3.5 rounded-2xl flex justify-between items-center px-5 border border-gray-700">
                                  <span className={`text-[10px] font-black ${rarity === 'LEGENDARY' ? 'text-red-400' : rarity === 'EPIC' ? 'text-yellow-400' : rarity === 'RARE' ? 'text-blue-400' : 'text-gray-400'}`}>{rarity}</span>
                                  <span className="font-black text-lg">{count.toLocaleString()}</span>
                              </div>
                          ))}
                          {gachaResults.goldGained ? (
                              <div className="col-span-2 text-center text-yellow-400 text-sm font-black mt-2">+{gachaResults.goldGained.toLocaleString()} GOLD (AUTO-DISMANTLED)</div>
                          ) : null}
                      </div>
                  ) : (
                      <div className="grid grid-cols-5 gap-3 mb-10 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                          {gachaResults.items.map((item, idx) => <InventorySlot key={idx} item={item} />)}
                      </div>
                  )}
                  <button onClick={() => { setGachaResults(null); setActiveModal('NONE'); }} className="bg-blue-600 hover:bg-blue-500 w-full py-5 rounded-3xl font-black italic text-xl shadow-lg active:scale-95 transition-transform">CONFIRM</button>
              </div>
          </div>
      )}

      {/* Gacha Animation */}
      {isGachaAnimating && (
        <div className="absolute inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-8 text-2xl font-black italic text-blue-400 animate-pulse tracking-widest">EDF SUPPLY DROPPING...</div>
        </div>
      )}
    </div>
  );
};

export default tangtang;
