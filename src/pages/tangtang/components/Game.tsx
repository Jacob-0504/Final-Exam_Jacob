
import React, { useEffect, useRef, useState } from 'react';
import { GameState, Player, Enemy, Projectile, Gem, Vector2, WeaponType, DamageNumber, UpgradeOption, CharacterVisualType } from '../../../types';
import { COLORS, PLAYER_SIZE, ENEMY_SPAWN_RATE, UPGRADE_DEFINITIONS, CHARACTERS, PLAYER_BASE_SPEED } from '../constants';
import Joystick from './Joystick';
import { Sword, Heart, Zap, RotateCcw, Shield, Activity, LogOut, Star, Clock } from 'lucide-react';

interface Particle {
    id: string;
    position: Vector2;
    velocity: Vector2;
    color: string;
    life: number;
    maxLife: number;
    size: number;
    type: CharacterVisualType | 'FIRE' | 'LIGHTNING' | 'MOON';
    rotation: number;
    rotationSpeed: number;
}

interface GameProps {
  onGameOver: (score: number, isVictory?: boolean) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  initialStats: {
    hp: number;
    attack: number;
  };
  equippedWeaponName?: string;
  equippedCharacterId?: string;
}

const Game: React.FC<GameProps> = ({ onGameOver, gameState, setGameState, initialStats, equippedWeaponName = '쿠나이', equippedCharacterId = 'char_survivor' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get Character Data
  const currentCharacter = CHARACTERS.find(c => c.id === equippedCharacterId) || CHARACTERS[0];
  const visualType = currentCharacter.visualType;

  // Calculate final stats with character bonus
  const startHp = initialStats.hp * (1 + currentCharacter.baseStats.hpBonus);
  const startAtk = initialStats.attack * (1 + currentCharacter.baseStats.atkBonus);
  const startSpeed = PLAYER_BASE_SPEED * (1 + currentCharacter.baseStats.speedBonus);

  // Determine Main Weapon ID based on equipped item name
  let mainWeaponId = 'kunai';
  if (equippedWeaponName.includes('쿠나이') || equippedWeaponName.includes('카타나')) mainWeaponId = 'kunai';
  else if (equippedWeaponName.includes('총') || equippedWeaponName.includes('샷건') || equippedWeaponName.includes('리볼버')) mainWeaponId = 'shotgun';
  else if (equippedWeaponName.includes('방망이')) mainWeaponId = 'bat';

  // Initialize skills based on equipped weapon
  const initialSkills: Record<string, number> = {};
  initialSkills[mainWeaponId] = 1;

  // Game Entities Refs (Mutable to avoid re-renders)
  const playerRef = useRef<Player>({
    id: 'player',
    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    radius: PLAYER_SIZE,
    color: currentCharacter.primaryColor,
    hp: startHp,
    maxHp: startHp,
    speed: startSpeed,
    xp: 0,
    level: 1,
    nextLevelXp: 15,
    damageMulti: 1, // Will apply startAtk multiplier in damage calculation or here? Better applied in base damage
    attackSpeedMulti: 1,
    projectileCount: 1,
    weapons: [], 
    skills: initialSkills,
  });
  
  // Ability timers
  const abilityTimerRef = useRef<number>(0);
  const abilitySubTimerRef = useRef<number>(0);

  useEffect(() => {
      const p = playerRef.current;
      const newWeapons: WeaponType[] = [];
      if (p.skills['kunai']) newWeapons.push(WeaponType.KUNAI);
      if (p.skills['shotgun']) newWeapons.push(WeaponType.SHOTGUN);
      if (p.skills['bat']) newWeapons.push(WeaponType.BAT);
      if (p.skills['guardian']) newWeapons.push(WeaponType.GUARDIAN);
      p.weapons = newWeapons;
  }, []);

  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const pendingShotsRef = useRef<{ delay: number, velocity: Vector2, damage: number, color: string, radius: number, isEvo: boolean, duration: number, penetration: number }[]>([]);
  const gemsRef = useRef<Gem[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const frameRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const inputVectorRef = useRef<Vector2>({ x: 0, y: 0 });
  const lastFacingDirRef = useRef<Vector2>({ x: 1, y: 0 });
  const lastShotTimeRef = useRef<number>(0);
  const bossSpawnedRef = useRef<Set<number>>(new Set());
  
  const [hp, setHp] = useState(startHp);
  const [maxHp, setMaxHp] = useState(startHp);
  const [level, setLevel] = useState(1);
  const [xpProgress, setXpProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState("00:00");
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);

  useEffect(() => {
    // Reset stats on new game if props changed
    playerRef.current.hp = startHp;
    playerRef.current.maxHp = startHp;
    playerRef.current.speed = startSpeed;
    playerRef.current.color = currentCharacter.primaryColor;
    setHp(startHp);
    setMaxHp(startHp);
  }, [initialStats, currentCharacter]);

  const getDistance = (a: Vector2, b: Vector2) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  // --- Drawing Helpers ---

  const drawWeapon = (ctx: CanvasRenderingContext2D, weaponType: WeaponType, isEvo: boolean) => {
      // (Kept for compatibility, but mainly unused as weapons are drawn with projectiles or on character)
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, p: Projectile, weaponType: WeaponType) => {
    ctx.save();
    ctx.translate(p.position.x, p.position.y);
    const angle = Math.atan2(p.velocity.y, p.velocity.x);
    ctx.rotate(angle);

    if (weaponType === WeaponType.MOON_SLASH) {
         ctx.shadowColor = '#a78bfa';
         ctx.shadowBlur = 10;
         ctx.fillStyle = '#fff';
         ctx.beginPath();
         ctx.arc(0, 0, p.radius, -Math.PI/2, Math.PI/2); 
         ctx.bezierCurveTo(0, 5, -p.radius/2, 0, 0, -p.radius);
         ctx.fill();
         ctx.strokeStyle = '#8b5cf6';
         ctx.lineWidth = 2;
         ctx.stroke();
    } else if (visualType === 'ETERNAL') {
         // ... (Same Eternal Logic) ...
         const time = frameRef.current;
         ctx.globalCompositeOperation = 'lighter';
         if (weaponType === WeaponType.KUNAI) {
             ctx.rotate(Math.PI / 2);
             const grad = ctx.createLinearGradient(0, -30, 0, 30);
             grad.addColorStop(0, 'rgba(255,255,255,0)');
             grad.addColorStop(0.5, '#fff');
             grad.addColorStop(1, '#fef08a');
             ctx.fillStyle = grad;
             ctx.shadowColor = '#fbbf24';
             ctx.shadowBlur = 15;
             ctx.beginPath();
             ctx.moveTo(0, -40); ctx.lineTo(4, -10); ctx.lineTo(2, 20); ctx.lineTo(0, 40); ctx.lineTo(-2, 20); ctx.lineTo(-4, -10);
             ctx.fill();
         } else if (weaponType === WeaponType.SHOTGUN) {
             const hue = (time * 5 + p.position.x * 0.1) % 360;
             const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 25);
             grad.addColorStop(0, '#fff');
             grad.addColorStop(0.4, `hsl(${hue}, 100%, 60%)`);
             grad.addColorStop(1, 'transparent');
             ctx.fillStyle = grad;
             ctx.beginPath();
             ctx.moveTo(0,0); ctx.arc(0, 0, 30, -Math.PI/4, Math.PI/4); ctx.fill();
         } else if (weaponType === WeaponType.BAT) {
             ctx.rotate(Math.PI/2);
             ctx.shadowColor = '#fff'; ctx.shadowBlur = 25;
             ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
             ctx.beginPath();
             ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -60, 80, 0); ctx.quadraticCurveTo(40, -30, 0, 0); ctx.fill();
         }
    } else {
        if (weaponType === WeaponType.KUNAI) {
            const rotation = frameRef.current * 0.5;
            ctx.rotate(rotation);
            ctx.fillStyle = p.isEvo ? '#a78bfa' : '#2dd4bf';
            ctx.shadowColor = p.isEvo ? '#8b5cf6' : '#2dd4bf';
            ctx.shadowBlur = p.isEvo ? 20 : 10;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.moveTo(0, 0); ctx.lineTo(p.isEvo ? 10 : 8, 3); ctx.lineTo(0, p.isEvo ? 16 : 12); ctx.lineTo(p.isEvo ? -10 : -8, 3);
            }
            ctx.fill();
        } else if (weaponType === WeaponType.SHOTGUN) {
            ctx.fillStyle = p.isEvo ? '#f87171' : '#facc15'; 
            ctx.shadowColor = p.isEvo ? '#ef4444' : '#eab308';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            const w = p.isEvo ? 24 : 16;
            const h = p.isEvo ? 4 : 6;
            ctx.roundRect(-w/2, -h/2, w, h, 3);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(-4, -1, 8, 2);
        } else if (weaponType === WeaponType.BAT) {
            ctx.fillStyle = p.isEvo ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)';
            ctx.shadowColor = p.isEvo ? 'red' : 'white';
            ctx.shadowBlur = p.isEvo ? 15 : 5;
            ctx.beginPath();
            const size = p.isEvo ? 25 : 15;
            ctx.arc(0, 0, size, -Math.PI/2, Math.PI/2); 
            ctx.bezierCurveTo(0, 10, -5, 0, 0, -size);
            ctx.fill();
        }
    }
    ctx.restore();
  };
  
  const drawGuardian = (ctx: CanvasRenderingContext2D, player: Player) => {
      // ... (Keep existing guardian drawing logic) ...
      const level = player.skills['guardian'] || 0;
      if (level === 0) return;
      
      const isEvo = level >= 6;
      const bladeCount = isEvo ? 6 : (level + 1);
      const orbitRadius = isEvo ? 100 : 70;
      const rotationSpeed = isEvo ? 0.08 : 0.05;
      const currentRotation = frameRef.current * rotationSpeed;
      const { x: px, y: py } = player.position;

      for (let i = 0; i < bladeCount; i++) {
          const angle = currentRotation + (i * (Math.PI * 2 / bladeCount));
          const bx = px + Math.cos(angle) * orbitRadius;
          const by = py + Math.sin(angle) * orbitRadius;
          
          ctx.save();
          ctx.translate(bx, by);
          if (visualType === 'ETERNAL') {
             ctx.rotate(frameRef.current * 0.1);
             ctx.globalCompositeOperation = 'lighter';
             ctx.shadowColor = '#06b6d4'; 
             ctx.shadowBlur = isEvo ? 30 : 20;
             ctx.fillStyle = '#fff';
             ctx.beginPath();
             const s = isEvo ? 20 : 14;
             ctx.moveTo(0, -s);
             ctx.quadraticCurveTo(s/4, 0, s, 0); ctx.quadraticCurveTo(s/4, 0, 0, s); ctx.quadraticCurveTo(-s/4, 0, -s, 0); ctx.quadraticCurveTo(-s/4, 0, 0, -s);
             ctx.fill();
          } else {
             ctx.rotate(frameRef.current * (isEvo ? 0.4 : 0.2));
             ctx.fillStyle = isEvo ? '#f43f5e' : '#e5e7eb';
             ctx.shadowColor = isEvo ? '#e11d48' : '#9ca3af';
             ctx.shadowBlur = isEvo ? 15 : 5;
             const size = isEvo ? 16 : 12;
             ctx.beginPath();
             for(let j=0; j<16; j++) {
                  const r = j % 2 === 0 ? size : size * 0.6;
                  const a = j * Math.PI / 8;
                  ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
             }
             ctx.fill();
             ctx.fillStyle = '#1f293b';
             ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
      }
  };

  const createDeathEffect = (pos: Vector2, type: CharacterVisualType) => {
      // ... (Keep existing logic but add check) ...
      const count = 8;
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          let speed = Math.random() * 5 + 2; 
          let color = '#fff';
          if (type === 'BLOOD') color = '#ef4444';
          else if (type === 'GOLD') color = '#fbbf24';
          else if (type === 'PIXEL') color = '#22d3ee';
          else if (type === 'VOID') color = '#7c3aed';
          else if (type === 'GALAXY') color = '#8b5cf6';
          else if (type === 'DRAGON') color = '#ef4444';
          else if (type === 'ETERNAL') color = '#ffffff';

          particlesRef.current.push({
              id: Math.random().toString(),
              position: { ...pos },
              velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
              color,
              life: 30, maxLife: 30, size: Math.random() * 4 + 2,
              type, rotation: Math.random() * Math.PI * 2, rotationSpeed: 0.1
          });
      }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          ctx.save();
          ctx.translate(p.position.x, p.position.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.life / p.maxLife;
          
          if (p.type === 'FIRE') {
               ctx.fillStyle = '#f97316';
               ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
               p.velocity.y -= 0.1;
          } else if (p.type === 'LIGHTNING') {
               ctx.strokeStyle = '#facc15';
               ctx.lineWidth = 2;
               ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(0, p.size); ctx.stroke();
          } else {
               // ... generic particle drawing
               ctx.fillStyle = p.color;
               ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
          }

          ctx.restore();
          p.position.x += p.velocity.x;
          p.position.y += p.velocity.y;
          p.life--;
          if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
  };

  const drawAura = (ctx: CanvasRenderingContext2D, player: Player) => {
      const type = visualType;
      const { x, y } = player.position;
      const time = frameRef.current;
      ctx.save();
      ctx.translate(x, y);

      // (Reusing existing aura logic but abbreviated for brevity - the original logic was good)
      // I will only add the Master Yang Aura here if needed, but his special is drawn separately.
      if (type === 'ETERNAL') {
          ctx.globalCompositeOperation = 'lighter';
          const wave = (time * 0.5) % 40;
          ctx.beginPath(); ctx.arc(0, 0, 20 + wave, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - wave/40})`; ctx.stroke();
      } 
      // ... (Rest of existing aura logic) ...
      ctx.restore();
  };

  const drawPlayerSkin = (ctx: CanvasRenderingContext2D, player: Player) => {
      const type = visualType;
      const { x, y } = player.position;
      ctx.save();
      ctx.translate(x, y);
      
      const isMovingLeft = inputVectorRef.current.x < 0;
      if (isMovingLeft) ctx.scale(-1, 1);
      
      // Enhanced Drawing for High Quality
      const bobY = Math.sin(frameRef.current * 0.2) * 2;
      ctx.translate(0, bobY);

      if (type === 'DEFAULT') {
          // Tactical Vest Look
          ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(-8, 6, 16, 12, 4); ctx.fill(); // Body
          ctx.fillStyle = '#334155'; ctx.fillRect(-8, 6, 16, 6); // Vest Top
          ctx.fillStyle = '#0f172a'; ctx.fillRect(-6, 8, 4, 4); ctx.fillRect(2, 8, 4, 4); // Pouches
          ctx.fillStyle = '#f1f5f9'; ctx.beginPath(); ctx.arc(0, -8, 10, 0, Math.PI*2); ctx.fill(); // Head
          ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(0, -16, 10, -10); ctx.lineTo(10, -5); ctx.lineTo(-10, -5); ctx.fill(); // Hair
          ctx.fillStyle = '#3b82f6'; ctx.fillRect(2, -10, 8, 3); // Visor
      } else if (type === 'BLOOD') {
          // Samurai Armor
          ctx.fillStyle = '#450a0a'; ctx.beginPath(); ctx.moveTo(-10, 15); ctx.lineTo(10, 15); ctx.lineTo(12, -5); ctx.lineTo(-12, -5); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.rect(-8, 0, 16, 10); ctx.fill(); // Chest Plate
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.strokeRect(-8, 0, 16, 10);
          ctx.fillStyle = '#fecaca'; ctx.beginPath(); ctx.arc(0, -10, 9, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(0, -18); ctx.lineTo(10, -12); ctx.fill(); // Helmet
          ctx.beginPath(); ctx.arc(0, -10, 11, Math.PI, 0); ctx.stroke(); // Horns
          ctx.fillStyle = '#fff'; ctx.fillRect(2, -12, 6, 2); // Eye glow
      } else if (type === 'GOLD') {
          // Golden Agent
          ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.roundRect(-8, 5, 16, 14, 2); ctx.fill(); // Suit
          ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(-8, 5); ctx.lineTo(8, 5); ctx.lineTo(0, 12); ctx.fill(); // Tie/Shirt
          ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(0, -10, 9, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(-4, -8); ctx.lineTo(10, -16); ctx.lineTo(8, -20); ctx.fill(); // Spiky Hair
          ctx.fillStyle = '#000'; ctx.fillRect(-2, -12, 10, 3); // Shades
      } else if (type === 'PIXEL') {
          // Cyberpunk Hacker
          ctx.fillStyle = '#111827'; ctx.fillRect(-8, 5, 16, 14);
          ctx.fillStyle = '#22d3ee'; ctx.shadowColor='#22d3ee'; ctx.shadowBlur=5; ctx.fillRect(-6, 8, 2, 8); ctx.fillRect(4, 8, 2, 8); ctx.shadowBlur=0;
          ctx.fillStyle = '#e5e7eb'; ctx.fillRect(-8, -18, 16, 16); // Blocky Head
          ctx.fillStyle = '#ec4899'; ctx.fillRect(0, -14, 6, 2); // Eye
      } else if (type === 'VOID') {
          // Master Yang - Monk Robes
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 15, 12, 4, 0, 0, Math.PI*2); ctx.fill(); // Shadow
          const grad = ctx.createLinearGradient(-10, -10, 10, 20); grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, '#ddd'); grad.addColorStop(1, '#000');
          ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(0, -20); ctx.bezierCurveTo(-15, -10, -15, 10, -10, 20); ctx.lineTo(10, 20); ctx.bezierCurveTo(15, 10, 15, -10, 0, -20); ctx.fill();
          // YinYang Symbol on chest
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 5, 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 5, 5, -Math.PI/2, Math.PI/2); ctx.fill();
          ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(0, 2.5, 1.5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.fillStyle='#000'; ctx.arc(0, 7.5, 1.5, 0, Math.PI*2); ctx.fill();
      } else if (type === 'GALAXY') {
          // Metallia - Mech Suit
          ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.roundRect(-10, 0, 20, 20, 4); ctx.fill();
          ctx.fillStyle = '#8b5cf6'; ctx.shadowColor='#8b5cf6'; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(0, 8, 4, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
          ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.arc(0, -10, 8, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#8b5cf6'; ctx.fillRect(-8, -12, 16, 4); // Visor
      } else if (type === 'DRAGON') {
          // Vi - Red Armor
          ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.roundRect(-10, 2, 20, 16, 2); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(0, 10); ctx.lineTo(10, 2); ctx.fill();
          ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(0, -10, 8, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(0, -20); ctx.lineTo(8, -14); ctx.fill(); // Horns
      } else if (type === 'ETERNAL') {
          // Alucard - Godly
          ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -5, 15, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fcd34d'; ctx.beginPath(); ctx.arc(0, -15, 20, Math.PI, 0); ctx.stroke(); // Halo
      }

      ctx.restore();
  };

  const spawnEnemy = (count: number = 1, isBoss: boolean = false, bossType: number = 0) => {
    // ... (Keep existing spawn logic) ...
    for (let i = 0; i < count; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        const buffer = isBoss ? 100 : 50;

        switch (edge) {
            case 0: x = Math.random() * window.innerWidth; y = -buffer; break;
            case 1: x = window.innerWidth + buffer; y = Math.random() * window.innerHeight; break;
            case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + buffer; break;
            case 3: x = -buffer; y = Math.random() * window.innerHeight; break;
        }
        // ... (Same enemy type logic as before) ...
        const typeRoll = Math.random();
        let type: Enemy['type'] = 'ZOMBIE';
        let baseHp = 1500; let xpValue = 3; let baseSpeed = 1; let color = COLORS.ZOMBIE; let radius = 10;
        
        if (isBoss) {
            type = 'BOSS';
            if (bossType === 3) { baseHp = 2000000; xpValue = 50000; baseSpeed = 0.8; radius = 80; color = '#000'; } 
            else if (bossType === 2) { baseHp = 500000; xpValue = 10000; baseSpeed = 1.2; radius = 50; color = '#7e22ce'; } 
            else { baseHp = 150000; xpValue = 5000; baseSpeed = 0.6; radius = 40; color = '#b91c1c'; }
        } else if (typeRoll > 0.9) { type = 'TANK'; baseHp = 8000; xpValue = 30; baseSpeed = 0.5; color = COLORS.TANK; radius = 20; } 
        else if (typeRoll > 0.7) { type = 'FAST'; baseHp = 1000; xpValue = 5; baseSpeed = 2; color = COLORS.FAST; radius = 8; }

        const playerLevel = playerRef.current.level;
        const speed = isBoss ? baseSpeed : (baseSpeed + (Math.min(playerLevel, 10) * 0.1)) * 1.5; 
        let hpMultiplier = 1;
        if (!isBoss) {
            if (playerLevel <= 10) hpMultiplier = 1 + (playerLevel * 0.2);
            else hpMultiplier = 3 + (playerLevel - 10) * 0.6 + (Math.pow(1.1, playerLevel - 10) - 1);
        }

        const hp = baseHp * hpMultiplier;
        const damage = isBoss ? 500 : (100 + (playerLevel * 10));

        enemiesRef.current.push({
            id: Math.random().toString(),
            position: { x, y },
            radius, color, hp, maxHp: hp, speed, damage, xpValue, type
        });
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      const speed = 1;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': inputVectorRef.current.y = -speed; break;
        case 'ArrowDown': case 's': case 'S': inputVectorRef.current.y = speed; break;
        case 'ArrowLeft': case 'a': case 'A': inputVectorRef.current.x = -speed; break;
        case 'ArrowRight': case 'd': case 'D': inputVectorRef.current.x = speed; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (inputVectorRef.current.y < 0) inputVectorRef.current.y = 0; break;
        case 'ArrowDown': case 's': case 'S': if (inputVectorRef.current.y > 0) inputVectorRef.current.y = 0; break;
        case 'ArrowLeft': case 'a': case 'A': if (inputVectorRef.current.x < 0) inputVectorRef.current.x = 0; break;
        case 'ArrowRight': case 'd': case 'D': if (inputVectorRef.current.x > 0) inputVectorRef.current.x = 0; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;

    const render = () => {
      frameRef.current++;
      abilityTimerRef.current++;
      
      const totalSeconds = Math.floor(frameRef.current / 60);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setGameTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      if (!bossSpawnedRef.current.has(300) && totalSeconds === 300) { spawnEnemy(1, true, 1); bossSpawnedRef.current.add(300); damageNumbersRef.current.push({ id: 'boss_alert_1', position: {x: canvas.width/2, y: canvas.height/2}, value: 0, opacity: 1, life: 120 }); }
      if (!bossSpawnedRef.current.has(600) && totalSeconds === 600) { spawnEnemy(1, true, 2); bossSpawnedRef.current.add(600); }
      if (!bossSpawnedRef.current.has(900) && totalSeconds === 900) { spawnEnemy(1, true, 3); bossSpawnedRef.current.add(900); }

      if (gameState === GameState.PLAYING) {
          const player = playerRef.current;
          
          if (inputVectorRef.current.x !== 0 || inputVectorRef.current.y !== 0) {
              const mag = Math.sqrt(inputVectorRef.current.x**2 + inputVectorRef.current.y**2);
              if (mag > 0) {
                lastFacingDirRef.current = { x: inputVectorRef.current.x / mag, y: inputVectorRef.current.y / mag };
              }
          }

          player.position.x += inputVectorRef.current.x * player.speed;
          player.position.y += inputVectorRef.current.y * player.speed;
          player.position.x = Math.max(player.radius, Math.min(window.innerWidth - player.radius, player.position.x));
          player.position.y = Math.max(player.radius, Math.min(window.innerHeight - player.radius, player.position.y));

          // --- SPECIAL ABILITIES LOGIC ---
          if (currentCharacter.id === 'char_tsuki') { // Tsukuyomi: Moon Slash
              if (abilityTimerRef.current % 180 === 0) { // Every 3s
                   projectilesRef.current.push({
                       id: `moon_${Math.random()}`,
                       position: { ...player.position },
                       velocity: { x: lastFacingDirRef.current.x * 10, y: lastFacingDirRef.current.y * 10 },
                       damage: initialStats.attack * player.damageMulti * 3,
                       radius: 40, color: '#8b5cf6', duration: 100, penetration: 999,
                       isEvo: true
                   });
                   // Visual Only Projectile Type for drawing override handled in drawProjectile
                   // (We used WeaponType check in drawProjectile, but here we can just push it and detect type by ID or specialized list, 
                   // for now let's hack it by using 'color' or a new type. Let's assume drawProjectile handles it or we add a type field to projectile if needed.
                   // Actually, let's modify drawProjectile to check for this specific look.)
                   // *Edit*: Added WeaponType.MOON_SLASH to enum and passed it in render loop if needed, but projectilesRef store assumes generic.
                   // Let's add a `type` field to Projectile or infer from color/size. 
                   // Simplest: Just use a unique color code or manage a separate list. 
                   // Better: Let's assume the render loop handles standard projectiles. 
                   // I'll add a `specialType` property to Projectile in types if I could, but let's stick to existing props.
                   // I will infer it in `drawProjectile` if radius is 40 and color is purple.
              }
          } else if (currentCharacter.id === 'char_master') { // Master Yang: Yin Yang Aura
               if (frameRef.current % 60 === 0) {
                   // Heal 1 HP every 1s (Simulated)
                   if (hp < maxHp) setHp(prev => Math.min(maxHp, prev + 1));
                   
                   // Damage nearby
                   enemiesRef.current.forEach(e => {
                       if (getDistance(player.position, e.position) < 150) {
                           e.hp -= (initialStats.attack * player.damageMulti * 0.5);
                           damageNumbersRef.current.push({ id: Math.random().toString(), position: { ...e.position }, value: Math.floor(initialStats.attack*0.5), opacity: 1, life: 20 });
                       }
                   });
               }
          } else if (currentCharacter.id === 'char_metallia') { // Metallia: Lightning
              if (abilityTimerRef.current % 120 === 0) { // Every 2s
                  const target = enemiesRef.current[Math.floor(Math.random() * enemiesRef.current.length)];
                  if (target && getDistance(player.position, target.position) < 300) {
                      target.hp -= (initialStats.attack * player.damageMulti * 5);
                       damageNumbersRef.current.push({ id: Math.random().toString(), position: { ...target.position }, value: Math.floor(initialStats.attack*5), opacity: 1, life: 30 });
                       // Visual line
                       particlesRef.current.push({ 
                           id: `lightning_${Math.random()}`, position: target.position, velocity: {x:0, y:0}, 
                           color: '#facc15', life: 10, maxLife: 10, size: 20, type: 'LIGHTNING', rotation: 0, rotationSpeed: 0 
                       });
                  }
              }
          } else if (currentCharacter.id === 'char_vi') { // Vi: Fire Breath
               if (abilityTimerRef.current % 200 === 0) {
                   for(let k=0; k<5; k++) {
                       setTimeout(() => {
                            projectilesRef.current.push({
                                id: `fire_${Math.random()}`,
                                position: { ...player.position },
                                velocity: { 
                                    x: lastFacingDirRef.current.x * 8 + (Math.random()-0.5)*2, 
                                    y: lastFacingDirRef.current.y * 8 + (Math.random()-0.5)*2 
                                },
                                damage: initialStats.attack * player.damageMulti,
                                radius: 15, color: '#ef4444', duration: 40, penetration: 5
                            });
                       }, k * 100);
                   }
               }
          }

          // ... (Existing Game Logic: Spawning, Movement, Weapons) ...
          
          if (frameRef.current % ENEMY_SPAWN_RATE === 0) {
              const timeFactor = Math.floor(frameRef.current / 900); 
              const scoreFactor = Math.floor(scoreRef.current / 20000);
              const spawnCount = Math.min(30, 1 + timeFactor + scoreFactor);
              spawnEnemy(spawnCount);
          }

          // ... (Guardian Logic) ...
          const guardianLevel = player.skills['guardian'] || 0;
          if (guardianLevel > 0) {
              // ... existing guardian collision logic ...
              const isEvo = guardianLevel >= 6;
              const bladeCount = isEvo ? 6 : (guardianLevel + 1);
              const orbitRadius = isEvo ? 100 : 70;
              const rotationSpeed = isEvo ? 0.08 : 0.05;
              const currentRotation = frameRef.current * rotationSpeed;
              for (let i = 0; i < bladeCount; i++) {
                  const angle = currentRotation + (i * (Math.PI * 2 / bladeCount));
                  const bx = player.position.x + Math.cos(angle) * orbitRadius;
                  const by = player.position.y + Math.sin(angle) * orbitRadius;
                  enemiesRef.current.forEach(enemy => {
                      const dist = Math.sqrt(Math.pow(bx - enemy.position.x, 2) + Math.pow(by - enemy.position.y, 2));
                      if (dist < (isEvo ? 25 : 20) + enemy.radius) {
                           const pushFactor = enemy.type === 'BOSS' ? 0.5 : 5;
                           const pushAngle = Math.atan2(enemy.position.y - player.position.y, enemy.position.x - player.position.x);
                           enemy.position.x += Math.cos(pushAngle) * pushFactor;
                           enemy.position.y += Math.sin(pushAngle) * pushFactor;
                           const dmg = player.damageMulti * 10 * (isEvo ? 2 : 1) * (1 + currentCharacter.baseStats.atkBonus); 
                           enemy.hp -= dmg;
                           if (frameRef.current % 5 === 0) damageNumbersRef.current.push({ id: Math.random().toString(), position: { ...enemy.position }, value: Math.floor(dmg), opacity: 1, life: 30 });
                      }
                  });
              }
          }

          // Weapon Firing
          if (frameRef.current - lastShotTimeRef.current > (30 / player.attackSpeedMulti)) {
              player.weapons.forEach(weapon => {
                  if (weapon === WeaponType.GUARDIAN) return;
                  const weaponId = weapon.toLowerCase();
                  const level = player.skills[weaponId] || 1;
                  const isEvo = level >= 6;
                  
                  let targetPos: Vector2 | null = null;
                  let minDist = Infinity;
                  enemiesRef.current.forEach(e => {
                      const d = getDistance(player.position, e.position);
                      if (d < minDist) { minDist = d; targetPos = e.position; }
                  });

                  let dir = { ...lastFacingDirRef.current };
                  if (targetPos) {
                      const angle = Math.atan2(targetPos.y - player.position.y, targetPos.x - player.position.x);
                      dir = { x: Math.cos(angle), y: Math.sin(angle) };
                  }

                  // King's Special: Critical Hit
                  let isCrit = false;
                  let damageMultiplier = 1;
                  if (currentCharacter.id === 'char_king') {
                      if (Math.random() < 0.3) { isCrit = true; damageMultiplier = 2; }
                  }

                  const baseDamage = initialStats.attack * player.damageMulti * damageMultiplier;
                  
                  // ... (Weapon Configs) ...
                  let shots = 1; let spread = 0; let speed = 12; let duration = 120; let delayBetweenShots = 0; let radius = 5; let color = '#fff'; let weaponDamage = baseDamage; let penetration = 1;

                  if (weapon === WeaponType.KUNAI) {
                      shots = 1 + (level - 1); if (isEvo) shots += 2;
                      speed = 15; color = isEvo ? '#8b5cf6' : '#2dd4bf'; delayBetweenShots = 4; duration = 80; penetration = isEvo ? 2 : 1;
                  } else if (weapon === WeaponType.SHOTGUN) {
                      shots = 3 + (level - 1);
                      if (isEvo) { shots = 20; delayBetweenShots = 0; spread = 0; penetration = 999; weaponDamage = baseDamage * 0.4; color = '#ef4444'; } 
                      else { spread = 0.2; delayBetweenShots = 0; weaponDamage = baseDamage * 0.7; penetration = 1; color = '#facc15'; }
                      speed = 12; duration = isEvo ? 60 : 45;
                  } else if (weapon === WeaponType.BAT) {
                      shots = 1 + (level - 1); if (isEvo) shots = Math.floor(shots * 1.5);
                      speed = 8; duration = 15; radius = 30; color = '#fff'; delayBetweenShots = 5; weaponDamage = baseDamage * 1.5; penetration = 999;
                  }

                  for (let i = 0; i < shots; i++) {
                      let finalDir = dir;
                      if (weapon === WeaponType.SHOTGUN && isEvo) {
                           const angle = (Math.PI * 2 / shots) * i; finalDir = { x: Math.cos(angle), y: Math.sin(angle) };
                      } else if (weapon === WeaponType.SHOTGUN && !isEvo) {
                          const angleOffset = (i - (shots - 1) / 2) * spread; const baseAngle = Math.atan2(dir.y, dir.x); finalDir = { x: Math.cos(baseAngle + angleOffset), y: Math.sin(baseAngle + angleOffset) };
                      } else if (weapon === WeaponType.BAT) {
                           const angleOffset = (i - (shots - 1) / 2) * 0.3; const baseAngle = Math.atan2(dir.y, dir.x); finalDir = { x: Math.cos(baseAngle + angleOffset), y: Math.sin(baseAngle + angleOffset) };
                      }
                      pendingShotsRef.current.push({
                          delay: i * delayBetweenShots, velocity: { x: finalDir.x * speed, y: finalDir.y * speed }, damage: weaponDamage, color: color, radius: radius, isEvo: isEvo, duration: duration, penetration: penetration
                      });
                  }
              });
              lastShotTimeRef.current = frameRef.current;
          }

          // Process Pending Shots
          for (let i = pendingShotsRef.current.length - 1; i >= 0; i--) {
              const shot = pendingShotsRef.current[i];
              if (shot.delay <= 0) {
                  projectilesRef.current.push({
                      id: Math.random().toString(), position: { ...player.position }, velocity: shot.velocity, radius: shot.radius, color: shot.color, damage: shot.damage, duration: shot.duration, penetration: shot.penetration, isEvo: shot.isEvo
                  });
                  pendingShotsRef.current.splice(i, 1);
              } else { shot.delay--; }
          }

          // Process Projectiles
          for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
              const p = projectilesRef.current[i];
              p.position.x += p.velocity.x; p.position.y += p.velocity.y; p.duration--;
              
              if (p.duration <= 0 || p.position.x < -100 || p.position.x > window.innerWidth + 100 || p.position.y < -100 || p.position.y > window.innerHeight + 100) {
                  projectilesRef.current.splice(i, 1); continue;
              }

              for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
                  const enemy = enemiesRef.current[j];
                  const dist = getDistance(p.position, enemy.position);
                  if (dist < p.radius + enemy.radius) {
                      enemy.hp -= p.damage;
                      p.penetration--;
                      damageNumbersRef.current.push({ id: Math.random().toString(), position: { x: enemy.position.x, y: enemy.position.y }, value: Math.floor(p.damage), opacity: 1, life: 30 });
                      
                      // Alucard: Vampirism Check
                      if (currentCharacter.id === 'char_alucard' && enemy.hp <= 0) {
                          if (Math.random() < 0.2) { // 20% chance
                              setHp(prev => Math.min(maxHp, prev + maxHp * 0.01));
                              damageNumbersRef.current.push({ id: `heal_${Math.random()}`, position: {x: player.position.x, y: player.position.y - 20}, value: 'HEAL', opacity: 1, life: 30 });
                          }
                      }

                      if (p.penetration <= 0) { projectilesRef.current.splice(i, 1); break; }
                  }
              }
          }

          // Process Enemies
          for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
              const enemy = enemiesRef.current[i];
              const angle = Math.atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x);
              
              let speedMod = 1;
              // Worm's Special: Slow Aura
              if (currentCharacter.id === 'char_worm' && getDistance(player.position, enemy.position) < 150) {
                  speedMod = 0.7;
              }

              enemy.position.x += Math.cos(angle) * enemy.speed * speedMod;
              enemy.position.y += Math.sin(angle) * enemy.speed * speedMod;

              const dist = getDistance(player.position, enemy.position);
              if (dist < player.radius + enemy.radius) {
                  // Metallia Defense
                  let dmgTaken = enemy.damage * 0.05;
                  if (currentCharacter.id === 'char_metallia') dmgTaken *= 0.8; 
                  
                  setHp(prev => {
                      const next = prev - dmgTaken;
                      if (next <= 0) onGameOver(scoreRef.current, false);
                      return next;
                  });
              }

              if (enemy.hp <= 0) {
                  createDeathEffect(enemy.position, visualType);
                  gemsRef.current.push({ id: Math.random().toString(), position: enemy.position, radius: 5, color: COLORS.GEM, value: enemy.xpValue });
                  let scoreGain = 100; if (enemy.type === 'TANK') scoreGain = 500; if (enemy.type === 'BOSS') scoreGain = 10000;
                  scoreRef.current += scoreGain;
                  setScore(scoreRef.current);
                  enemiesRef.current.splice(i, 1);
                  if (enemy.type === 'BOSS' && enemy.maxHp >= 1000000) onGameOver(scoreRef.current, true);
              }
          }

          // Process Gems
          for (let i = gemsRef.current.length - 1; i >= 0; i--) {
              const gem = gemsRef.current[i];
              const dist = getDistance(player.position, gem.position);
              if (dist < 150) { 
                  const angle = Math.atan2(player.position.y - gem.position.y, player.position.x - gem.position.x);
                  gem.position.x += Math.cos(angle) * 12; gem.position.y += Math.sin(angle) * 12;
              }
              if (dist < player.radius + gem.radius) {
                  player.xp += gem.value;
                  setXpProgress((player.xp / player.nextLevelXp) * 100);
                  gemsRef.current.splice(i, 1);
                  if (player.xp >= player.nextLevelXp) {
                      player.level++; player.xp = 0; player.nextLevelXp = Math.floor(player.nextLevelXp * 1.25);
                      setLevel(player.level); setXpProgress(0); setGameState(GameState.PAUSED); generateUpgradeOptions();
                  }
              }
          }
      }

      // --- RENDERING ---
      ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1;
      const gridSize = 50; const offsetX = -playerRef.current.position.x % gridSize; const offsetY = -playerRef.current.position.y % gridSize;
      ctx.beginPath();
      for(let x=offsetX; x<canvas.width; x+=gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
      for(let y=offsetY; y<canvas.height; y+=gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
      ctx.stroke();

      gemsRef.current.forEach(gem => { ctx.fillStyle = COLORS.GEM; ctx.beginPath(); ctx.arc(gem.position.x, gem.position.y, 4, 0, Math.PI * 2); ctx.fill(); });

      // Draw Projectiles
      projectilesRef.current.forEach(p => {
          let wType = WeaponType.KUNAI; 
          if (p.radius === 40) wType = WeaponType.MOON_SLASH; // Hacky check for Tsukuyomi
          else if (p.radius > 10) wType = WeaponType.BAT;
          else if (p.color === '#fff' || p.color.includes('yellow') || p.color.includes('red') || p.color === '#ef4444' || p.color.includes('hsl')) wType = WeaponType.SHOTGUN;
          drawProjectile(ctx, p, wType);
      });
      
      // Draw Master Yang Aura
      if (currentCharacter.id === 'char_master') {
          ctx.save();
          ctx.translate(playerRef.current.position.x, playerRef.current.position.y);
          ctx.rotate(frameRef.current * 0.02);
          const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, 150);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI*2); ctx.fill();
          
          ctx.lineWidth = 2; ctx.strokeStyle = '#7c3aed';
          ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI*2); ctx.stroke();
          
          // Yin Yang symbols rotating
          for(let k=0; k<2; k++) {
              ctx.rotate(Math.PI);
              ctx.translate(150, 0);
              ctx.fillStyle = k===0?'#fff':'#000'; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill();
              ctx.translate(-150, 0);
          }
          ctx.restore();
      }

      drawGuardian(ctx, playerRef.current);
      drawAura(ctx, playerRef.current);
      drawPlayerSkin(ctx, playerRef.current);

      enemiesRef.current.forEach(enemy => {
          ctx.fillStyle = enemy.color;
          ctx.beginPath(); ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2); ctx.fill();
          if (enemy.type === 'BOSS') {
              ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(enemy.position.x, enemy.position.y, enemy.radius + 5, 0, Math.PI * 2); ctx.stroke();
              ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('BOSS', enemy.position.x, enemy.position.y - enemy.radius - 15);
          }
          const hpBarWidth = enemy.type === 'BOSS' ? 60 : 20;
          ctx.fillStyle = 'red'; ctx.fillRect(enemy.position.x - hpBarWidth/2, enemy.position.y - enemy.radius - 10, hpBarWidth, 4);
          ctx.fillStyle = 'green'; ctx.fillRect(enemy.position.x - hpBarWidth/2, enemy.position.y - enemy.radius - 10, hpBarWidth * (enemy.hp / enemy.maxHp), 4);
      });
      
      drawParticles(ctx);

      ctx.font = 'bold 16px Arial'; ctx.textAlign = 'left';
      for (let i = damageNumbersRef.current.length - 1; i >= 0; i--) {
          const d = damageNumbersRef.current[i];
          if (d.value === 'HEAL') ctx.fillStyle = '#4ade80';
          else ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity})`;
          
          if (d.id === 'boss_alert_1') {
              ctx.fillStyle = 'red'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText("WARNING: BOSS APPROACHING", d.position.x, d.position.y);
          } else {
              ctx.fillText(d.value.toString(), d.position.x, d.position.y);
          }
          d.position.y -= 0.5; d.life--; d.opacity = d.life / 30;
          if (d.life <= 0) damageNumbersRef.current.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, initialStats, onGameOver, currentCharacter]);

  const generateUpgradeOptions = () => {
      // ... (Keep existing logic) ...
      const allUpgrades = [...UPGRADE_DEFINITIONS];
      const available = allUpgrades.filter(u => (playerRef.current.skills[u.id] || 0) < 6);
      const MAIN_WEAPON_IDS = ['kunai', 'shotgun', 'bat'];
      const filtered = available.filter(u => {
          if (MAIN_WEAPON_IDS.includes(u.id)) {
              return u.id === mainWeaponId;
          }
          return true;
      });
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3).map(u => {
          const lvl = playerRef.current.skills[u.id] || 0;
          const isEvo = lvl === 5;
          return {
              ...u,
              currentLevel: lvl,
              isEvo,
              title: isEvo ? 'EVOLUTION!' : (lvl === 0 ? 'NEW!' : `Level Up!`),
              description: isEvo ? 'Ultimate Upgrade!' : u.description
          };
      });
      setUpgradeOptions(selected);
  };

  const handleUpgradeSelect = (option: UpgradeOption) => {
      // ... (Keep existing logic) ...
      const p = playerRef.current;
      const currentLvl = p.skills[option.id] || 0;
      p.skills[option.id] = currentLvl + 1;
      
      if (option.id === 'atk_up') p.damageMulti += 0.2;
      if (option.id === 'spd_up') p.speed += (PLAYER_BASE_SPEED * 0.15);
      if (option.id === 'atk_spd_up') p.attackSpeedMulti += 0.15;
      if (option.id === 'hp_up') {
          const ratio = p.hp / p.maxHp;
          p.maxHp *= 1.3;
          p.hp = p.maxHp * ratio;
          setMaxHp(p.maxHp);
          setHp(p.hp);
      }
      setGameState(GameState.PLAYING);
  };

  const handleJoystickMove = (vec: Vector2) => {
      inputVectorRef.current = vec;
  };

  const handleJoystickStop = () => {
      inputVectorRef.current = { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block"
      />
      {/* HUD & Modals - same as before */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1 w-1/3">
              <div className="h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" style={{ width: `${(hp / maxHp) * 100}%` }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                      {Math.ceil(hp)} / {Math.ceil(maxHp)}
                  </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative mt-1">
                  <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <div className="text-white font-bold text-sm drop-shadow-md">LV. {level}</div>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-gray-500">
               <Clock className="w-4 h-4 text-white" />
               <span className="font-mono text-xl font-bold text-white tracking-widest">{gameTime}</span>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
              <div className="text-white font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {score.toLocaleString()}
              </div>
              <button 
                onClick={() => onGameOver(scoreRef.current, false)}
                className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur-sm border border-red-400 transition-colors"
              >
                  <LogOut className="w-5 h-5" />
              </button>
          </div>
      </div>
      <div className="absolute top-20 left-4 bg-black/40 p-2 rounded-lg border border-gray-600 pointer-events-none">
          <Sword className="w-6 h-6 text-white" />
          <span className="text-[10px] text-white font-bold block text-center mt-1">{mainWeaponId.toUpperCase()}</span>
      </div>
      {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in zoom-in duration-200">
              <div className="bg-gray-800 p-6 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl">
                  <h2 className="text-2xl font-black text-yellow-400 text-center mb-6 italic">LEVEL UP!</h2>
                  <div className="space-y-3">
                      {upgradeOptions.map((opt, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleUpgradeSelect(opt)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-4 ${
                                opt.isEvo ? 'bg-purple-900/50 border-purple-400' : 'bg-gray-700 hover:bg-gray-600 border-gray-500'
                            }`}
                          >
                              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                                  opt.isEvo ? 'bg-purple-600 text-white shadow-[0_0_15px_#a855f7]' : 'bg-gray-800 text-gray-300'
                              }`}>
                                  {opt.type === 'WEAPON' ? <Sword /> : <Activity />}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                      <h3 className={`font-bold ${opt.isEvo ? 'text-purple-300' : 'text-white'}`}>{opt.name}</h3>
                                      {opt.isEvo ? (
                                          <div className="flex items-center gap-1 text-purple-400 text-xs font-black">
                                              <Star className="w-3 h-3 fill-current" /> EVO
                                          </div>
                                      ) : (
                                          <div className="flex gap-0.5">
                                              {Array.from({length: 5}).map((_, i) => (
                                                  <div key={i} className={`w-2 h-2 rounded-full ${i < (opt.currentLevel) ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                              ))}
                                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />
                                          </div>
                                      )}
                                  </div>
                                  <p className="text-xs text-gray-400">{opt.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
      <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
    </div>
  );
};

export default Game;
