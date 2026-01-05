import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GRAVITY, FRICTION, MOVE_SPEED, MAX_SPEED, JUMP_FORCE,
  PLAYER_SIZE, WORLD_WIDTH, WORLD_HEIGHT, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAX_FOCUS,
  FOCUS_DRAIN_PASSIVE, FOCUS_DRAIN_MOVE, FOCUS_REGEN_STILL, FOCUS_REGEN_STUNNED,
  LEVEL_1_PLATFORMS, LEVEL_2_PLATFORMS, INITIAL_MONSTERS_L1, INITIAL_MONSTERS_L2,
  SWORD_RANGE, SWORD_COOLDOWN, HAMMER_COOLDOWN, HAMMER_RANGE, BOW_COOLDOWN,
  ARROW_SPEED, ARROW_SIZE, SWORD_DAMAGE, HAMMER_DAMAGE, BOW_DAMAGE, DRILL_COOLDOWN,
  MONSTER_DETECT_RANGE, MONSTER_ATTACK_RANGE, MONSTER_PREPARE_TIME,
  MONSTER_ATTACK_DURATION, MONSTER_COOLDOWN_TIME, PLAYER_MAX_HP, PLAYER_INVINCIBLE_TIME,
  WATER_GRAVITY, WATER_FRICTION, WATER_JUMP_FORCE, GLIDE_GRAVITY, GLIDE_MAX_FALL,
  GACHA_ITEMS
} from '../constants';
import { Vector2, Platform, PlayerState, PlatformType, Monster, WeaponType, Projectile, MonsterState, GachaItem, ItemType, Rarity, ProjectileType, VisualEffect } from '../types';
import { audioService } from '../services/audioService';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Icons
import { AlertTriangle, Eye, Activity, Skull, Sword, Crosshair, Hammer, Zap, AlertCircle, Heart, BatteryWarning, DoorOpen, Droplets, FastForward, Wind, Gift, Sparkles, X, Briefcase, Check, Star, Crown, Shield, Hexagon, Layers, Flame, Drill, MousePointerClick, MessageSquareWarning, ScanLine, Terminal, Cpu, Radio, ShieldAlert } from 'lucide-react';

// Gacha Animation Phases
type GachaPhase = 'IDLE' | 'ANIMATING' | 'FLASH' | 'REVEAL';
type GachaMode = 'NONE' | 'CHARACTER' | 'WEAPON';
type BannerId = 'IGNIS' | 'ZEPHYR' | null;

// AI Override Types
type OverrideType = 'HEAL' | 'GRAVITY' | 'SPEED' | 'SHIELD' | 'NONE';
interface OverrideState {
  type: OverrideType;
  active: boolean;
  timer: number;
  message: string;
}

export const GameEngine: React.FC = () => {
  // --- Refs for Game Loop ---
  const requestRef = useRef<number>(0);
  const gameStartedRef = useRef<boolean>(false); 

  // Level State
  const currentLevelRef = useRef<number>(1);

  // Game Logic Refs
  const monstersRef = useRef<Monster[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const effectsRef = useRef<VisualEffect[]>([]); 

  // Player Refs
  const posRef = useRef<Vector2>({ x: 50, y: 0 }); 
  const velRef = useRef<Vector2>({ x: 0, y: 0 });
  const cameraRef = useRef<Vector2>({ x: 0, y: 0 });
  const focusRef = useRef<number>(MAX_FOCUS);
  const hpRef = useRef<number>(PLAYER_MAX_HP);
  const invincibleTimerRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(false);
  const isInWaterRef = useRef<boolean>(false);
  const isStunnedRef = useRef<boolean>(false);
  const isGlidingRef = useRef<boolean>(false);
  const facingRightRef = useRef<boolean>(true);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<Vector2>({ x: 0, y: 0 });
  const canGlideRef = useRef<boolean>(false);

  // Ability Refs
  const jumpCountRef = useRef<number>(0); 

  // Combat Refs
  const isAttackingRef = useRef<boolean>(false);
  const lastAttackTimeRef = useRef<number>(0);
  const currentWeaponRef = useRef<WeaponType>(WeaponType.SWORD);

  // Inventory & Gacha Refs
  const inventoryRef = useRef<GachaItem[]>([]);
  const equippedCharRef = useRef<GachaItem | null>(null);
  const equippedWeaponRef = useRef<GachaItem | null>(null);

  // --- React State for Rendering ONLY ---
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [camera, setCamera] = useState<Vector2>({ x: 0, y: 0 });

  const [playerState, setPlayerState] = useState<PlayerState>({
    position: { x: 50, y: 0 },
    velocity: { x: 0, y: 0 },
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    isGrounded: false,
    isGliding: false,
    focus: MAX_FOCUS,
    isStunned: false,
    facingRight: true,
    isAttacking: false,
    currentWeapon: WeaponType.SWORD,
    invincibleTimer: 0,
    currentLevel: 1,
    equippedCharacter: null,
    equippedWeaponSkin: null,
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); 
  const [deathReason, setDeathReason] = useState("");

  // AI State
  const [aiHint, setAiHint] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [levelIntro, setLevelIntro] = useState<string | null>(null);
  const [typingText, setTypingText] = useState(""); 

  // NEW: AI Override State
  const [overrideState, setOverrideState] = useState<OverrideState>({ type: 'NONE', active: false, timer: 0, message: '' });
  const [isOverrideLoading, setIsOverrideLoading] = useState(false);
  const overrideRef = useRef<OverrideType>('NONE'); 

  // UI States
  const [activeGachaMode, setActiveGachaMode] = useState<GachaMode>('NONE');
  const [selectedBanner, setSelectedBanner] = useState<BannerId>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [gachaPhase, setGachaPhase] = useState<GachaPhase>('IDLE');
  const [gachaResults, setGachaResults] = useState<GachaItem[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Typewriter Effect Hook
  useEffect(() => {
    if (aiHint) {
      let i = 0;
      setTypingText("");
      const timer = setInterval(() => {
        setTypingText((prev) => prev + aiHint.charAt(i));
        i++;
        if (i >= aiHint.length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [aiHint]);

  // [FIXED] AI: Fetch Level Atmosphere
  const fetchLevelIntro = async (level: number) => {
    setLevelIntro(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
            You are the system narrator of a dark, sci-fi action game.
            Describe the atmosphere of Level ${level} in one short, mysterious sentence.
            Keywords: Void, Darkness, Silence, Danger.
            Language: Korean.
          `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        setLevelIntro(text);
        setTimeout(() => setLevelIntro(null), 4000);
      }
    } catch (e) {
      console.error("Intro AI Error:", e);
    }
  };

  // [FIXED] AI: System Override (Cheat)
  const triggerSystemOverride = async () => {
    if (isOverrideLoading || overrideState.active) return;

    setIsOverrideLoading(true);
    audioService.playGachaRoll();

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing API Key");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
             System Protocol: VOID_OS_V9
             Status: HP ${hpRef.current}, Focus ${Math.floor(focusRef.current)}%, Level ${currentLevelRef.current}
             Task: Analyze status and choose ONE cheat protocol.
             Rules: HP < 2 ? 'HEAL' : Focus < 30 ? 'SPEED' : 'SHIELD'.
             Output JSON ONLY: { "type": "HEAL" | "GRAVITY" | "SPEED" | "SHIELD", "message": "Short system log message in Korean" }
          `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultParsed = JSON.parse(response.text());

      if (resultParsed.type === 'HEAL') {
        hpRef.current = Math.min(hpRef.current + 1, playerState.maxHp);
        audioService.playHeal();
      } else if (resultParsed.type === 'SHIELD') {
        invincibleTimerRef.current = 600; 
        audioService.playImpact();
      } else {
        audioService.playPortal();
      }

      overrideRef.current = resultParsed.type;
      setOverrideState({
        type: resultParsed.type,
        active: true,
        timer: 600,
        message: resultParsed.message
      });

    } catch (e) {
      console.error("Override Failed", e);
    } finally {
      setIsOverrideLoading(false);
    }
  };

  // [FIXED] AI: Death Insight
  const fetchDeathInsight = async (reason: string, characterName: string, level: number) => {
    setIsAiLoading(true);
    setAiHint("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

      const prompt = `
        You are the 'Void System', a cynical AI.
        Player died. Character: ${characterName}, Level: ${level}, Cause: ${reason}.
        Generate a system log style death message in Korean. 
        Format: [SYSTEM FAILURE] <Message>
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiHint(response.text() || "DATA CORRUPTED");
    } catch (error) {
      console.error("AI Error:", error);
      setAiHint("[CONNECTION LOST] SYSTEM OFFLINE...");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
      const isOverlayOpen = activeGachaMode !== 'NONE' || isInventoryOpen;

      if (!gameStartedRef.current && (e.code === 'Space' || e.code === 'Enter') && !isOverlayOpen) {
        loadLevel(1);
      }
      if (isGameOver && e.code === 'KeyR' && !isOverlayOpen) {
        loadLevel(currentLevelRef.current);
      }
      if (gameStartedRef.current && !isGameOver && !isOverlayOpen && e.code === 'KeyF') {
        triggerSystemOverride();
      }

      if (!isGameOver && gameStartedRef.current && !isOverlayOpen) {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          if (isGroundedRef.current) {
            let jumpBonus = equippedCharRef.current?.jumpBonus || 0;
            velRef.current.y = isInWaterRef.current ? WATER_JUMP_FORCE : (JUMP_FORCE + jumpBonus);
            isGroundedRef.current = false;
            canGlideRef.current = true;
            jumpCountRef.current = 1;
            if (isInWaterRef.current) audioService.playSplash();
            else audioService.playJump();
          } else if (isInWaterRef.current) {
            if (velRef.current.y > 0) { velRef.current.y = WATER_JUMP_FORCE; audioService.playSplash(); }
          } else if (equippedCharRef.current?.id === 'limit_2' && jumpCountRef.current < 2 && !isStunnedRef.current) {
            velRef.current.y = JUMP_FORCE * 0.8;
            jumpCountRef.current++;
            audioService.playDoubleJump();
            effectsRef.current.push({ id: Date.now(), x: posRef.current.x, y: posRef.current.y + PLAYER_SIZE, type: 'DOUBLE_JUMP', timer: 20 });
          } else if (canGlideRef.current && !isGlidingRef.current && !isStunnedRef.current) {
            isGlidingRef.current = true;
          } else if (isGlidingRef.current) {
            isGlidingRef.current = false;
          }
        }
        if (e.key === '1') currentWeaponRef.current = WeaponType.SWORD;
        if (e.key === '2') currentWeaponRef.current = WeaponType.BOW;
        if (e.key === '3') currentWeaponRef.current = WeaponType.HAMMER;
        if (e.key === '4') currentWeaponRef.current = WeaponType.DRILL;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
    const handleMouseDown = () => { if (gameStartedRef.current && !isGameOver && activeGachaMode === 'NONE' && !isInventoryOpen) performAttack(); };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('game-viewport')?.getBoundingClientRect();
      if (rect) { mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isGameOver, activeGachaMode, isInventoryOpen]);

  const loadLevel = (level: number) => {
    currentLevelRef.current = level;
    posRef.current = (level === 3) ? { x: 50, y: 450 } : { x: 50, y: 0 };
    velRef.current = { x: 0, y: 0 };
    let bonusHP = (equippedCharRef.current?.rarity && equippedCharRef.current.rarity >= 5) ? 2 : 0;
    hpRef.current = PLAYER_MAX_HP + bonusHP;
    focusRef.current = MAX_FOCUS;
    isStunnedRef.current = false;
    invincibleTimerRef.current = 0;
    isGroundedRef.current = false;
    isInWaterRef.current = false;
    isGlidingRef.current = false;
    canGlideRef.current = false;
    jumpCountRef.current = 0;
    isAttackingRef.current = false;
    facingRightRef.current = true;
    currentWeaponRef.current = WeaponType.SWORD;
    overrideRef.current = 'NONE';
    setOverrideState({ type: 'NONE', active: false, timer: 0, message: '' });

    if (level === 1) {
      platformsRef.current = JSON.parse(JSON.stringify(LEVEL_1_PLATFORMS));
      monstersRef.current = JSON.parse(JSON.stringify(INITIAL_MONSTERS_L1));
    } else if (level === 2) {
      platformsRef.current = JSON.parse(JSON.stringify(LEVEL_2_PLATFORMS));
      monstersRef.current = JSON.parse(JSON.stringify(INITIAL_MONSTERS_L2));
    }

    projectilesRef.current = [];
    effectsRef.current = [];
    setPlatforms([...platformsRef.current]);
    setMonsters([...monstersRef.current]);
    setProjectiles([]);
    setEffects([]);

    cameraRef.current = {
      x: Math.max(0, Math.min(posRef.current.x - VIEWPORT_WIDTH / 2, WORLD_WIDTH - VIEWPORT_WIDTH)),
      y: Math.max(0, Math.min(posRef.current.y - VIEWPORT_HEIGHT / 2, WORLD_HEIGHT - VIEWPORT_HEIGHT))
    };
    setCamera({ ...cameraRef.current });
    setIsGameOver(false);
    setGameStarted(true);
    gameStartedRef.current = true;
    setDeathReason("");
    setAiHint("");
    fetchLevelIntro(level);

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  const die = useCallback((reason: string) => {
    if (isGameOver) return;
    setIsGameOver(true);
    setDeathReason(reason);
    audioService.playDeath();
    gameStartedRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const charName = equippedCharRef.current?.name || "Unknown Soul";
    fetchDeathInsight(reason, charName, currentLevelRef.current);
  }, [isGameOver]);

  const performAttack = () => {
    if (isStunnedRef.current || isGlidingRef.current) return;
    const now = Date.now();
    const weapon = currentWeaponRef.current;
    let cooldown = (weapon === WeaponType.BOW) ? BOW_COOLDOWN : (weapon === WeaponType.HAMMER ? HAMMER_COOLDOWN : (weapon === WeaponType.DRILL ? DRILL_COOLDOWN : SWORD_COOLDOWN));
    if (overrideRef.current === 'SPEED') cooldown *= 0.5;
    if (now - lastAttackTimeRef.current < cooldown) return;

    lastAttackTimeRef.current = now;
    isAttackingRef.current = true;

    if (weapon === WeaponType.DRILL) {
      audioService.playDrill();
      const playerCenter = posRef.current.x + PLAYER_SIZE / 2;
      const playerBottom = posRef.current.y + PLAYER_SIZE;
      const drillHoleSize = PLAYER_SIZE + 10;
      let newPlatforms = [...platformsRef.current];
      let drilled = false;
      for (let i = newPlatforms.length - 1; i >= 0; i--) {
        const p = newPlatforms[i];
        if ((p.type === PlatformType.NORMAL || p.type === PlatformType.CRUMBLING) && playerCenter >= p.x && playerCenter <= p.x + p.width && Math.abs(p.y - playerBottom) < 5) {
          const leftWidth = (playerCenter - drillHoleSize / 2) - p.x;
          const rightWidth = (p.x + p.width) - (playerCenter + drillHoleSize / 2);
          if (leftWidth > 10) newPlatforms.push({ ...p, id: Date.now() + Math.random(), width: leftWidth });
          if (rightWidth > 10) newPlatforms.push({ ...p, id: Date.now() + Math.random() + 1, x: playerCenter + drillHoleSize / 2, width: rightWidth });
          newPlatforms.splice(i, 1);
          drilled = true; break;
        }
      }
      if (drilled) { platformsRef.current = newPlatforms; posRef.current.y += 2; }
      setTimeout(() => { isAttackingRef.current = false; }, 500);
      return;
    }

    setTimeout(() => { isAttackingRef.current = false; }, 300);
    const mouseWorldX = mousePosRef.current.x + cameraRef.current.x;
    const mouseWorldY = mousePosRef.current.y + cameraRef.current.y;

    if (weapon === WeaponType.BOW) {
      audioService.playShoot();
      const dx = mouseWorldX - (posRef.current.x + PLAYER_SIZE / 2);
      const dy = mouseWorldY - (posRef.current.y + PLAYER_SIZE / 2);
      const angle = Math.atan2(dy, dx);
      let pColor = '#00ffcc', pType: ProjectileType = 'ARROW', pSpeed = ARROW_SPEED;
      if (equippedCharRef.current?.id === 'limit_1') { pColor = '#FF4500'; pType = 'FIREBALL'; }
      else if (equippedCharRef.current?.id === 'limit_2') { pColor = '#00FF7F'; pType = 'WIND_BLADE'; pSpeed *= 1.2; }
      projectilesRef.current.push({ id: now, x: posRef.current.x + PLAYER_SIZE / 2, y: posRef.current.y + PLAYER_SIZE / 2, vx: Math.cos(angle) * pSpeed, vy: Math.sin(angle) * pSpeed, angle: angle, width: ARROW_SIZE, height: 4, active: true, color: pColor, type: pType });
    } else {
      const range = (weapon === WeaponType.HAMMER) ? HAMMER_RANGE : SWORD_RANGE;
      if (weapon === WeaponType.HAMMER) audioService.playHammer(); else audioService.playAttack();
      const attackX = posRef.current.x + (facingRightRef.current ? PLAYER_SIZE : -range);
      checkAttackCollision({ x: attackX, y: posRef.current.y, width: range, height: PLAYER_SIZE }, weapon);
    }
  };

  const checkAttackCollision = (rect: { x: number, y: number, width: number, height: number }, weapon: WeaponType) => {
    if (weapon !== WeaponType.HAMMER) {
      let damage = SWORD_DAMAGE + (equippedCharRef.current?.id === 'limit_1' ? 1 : 0);
      let killedSomething = false;
      const targetsToHit: Monster[] = [];
      monstersRef.current.forEach(m => { if (rect.x < m.x + m.width && rect.x + rect.width > m.x && rect.y < m.y + m.height && rect.y + rect.height > m.y) targetsToHit.push(m); });
      targetsToHit.forEach(m => {
        audioService.playImpact(); m.hp -= damage; m.x += (rect.x < m.x ? 5 : -5); if (m.hp <= 0) killedSomething = true;
      });
      if (killedSomething) focusRef.current = Math.min(focusRef.current + 20, MAX_FOCUS);
      monstersRef.current = monstersRef.current.filter(m => m.hp > 0);
    }
    platformsRef.current = platformsRef.current.filter(p => {
      if (p.type === PlatformType.BREAKABLE && rect.x < p.x + p.width && rect.x + rect.width > p.x && rect.y < p.y + p.height && rect.y + rect.height > p.y) {
        if (weapon === WeaponType.HAMMER) { audioService.playImpact(); return false; }
      }
      return true;
    });
  };

  const updatePhysics = () => {
    if (isGameOver || !gameStartedRef.current || activeGachaMode !== 'NONE' || isInventoryOpen) return;
    if (invincibleTimerRef.current > 0) invincibleTimerRef.current--;

    let inWaterThisFrame = false;
    const playerRect = { x: posRef.current.x, y: posRef.current.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
    for (let platform of platformsRef.current) {
      if (playerRect.x < platform.x + platform.width && playerRect.x + playerRect.width > platform.x && playerRect.y < platform.y + platform.height && playerRect.y + playerRect.height > platform.y) {
        if (platform.type === PlatformType.EXIT) { audioService.playPortal(); loadLevel(currentLevelRef.current + 1); return; }
        if (platform.type === PlatformType.WATER) inWaterThisFrame = true;
      }
    }
    if (inWaterThisFrame && !isInWaterRef.current) isGlidingRef.current = false;
    isInWaterRef.current = inWaterThisFrame;

    if (isStunnedRef.current) {
      focusRef.current += FOCUS_REGEN_STUNNED;
      velRef.current.x = 0; velRef.current.y += (isInWaterRef.current ? WATER_GRAVITY : GRAVITY);
      if (focusRef.current >= MAX_FOCUS) isStunnedRef.current = false;
    } else {
      let speedBonus = (equippedCharRef.current?.speedBonus || 0) + (overrideRef.current === 'SPEED' ? 4.0 : 0);
      let finalSpeed = MOVE_SPEED + (speedBonus * 0.1);
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) velRef.current.x += finalSpeed;
      else if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) velRef.current.x -= finalSpeed;

      let gravity = (overrideRef.current === 'GRAVITY' ? GRAVITY * 0.3 : GRAVITY);
      let friction = FRICTION;
      if (isInWaterRef.current) { gravity = WATER_GRAVITY; friction = WATER_FRICTION; }
      else if (isGlidingRef.current) { gravity = GLIDE_GRAVITY; if (velRef.current.y > GLIDE_MAX_FALL) velRef.current.y = GLIDE_MAX_FALL; }

      velRef.current.x *= friction;
      velRef.current.x = Math.max(Math.min(velRef.current.x, MAX_SPEED + speedBonus), -(MAX_SPEED + speedBonus));
      velRef.current.y += gravity;

      const isMoving = Math.abs(velRef.current.x) > 0.1 || !isGroundedRef.current;
      focusRef.current -= (isMoving ? FOCUS_DRAIN_MOVE : -FOCUS_REGEN_STILL) + FOCUS_DRAIN_PASSIVE;
      focusRef.current = Math.min(Math.max(focusRef.current, 0), MAX_FOCUS);
      if (focusRef.current <= 0) { isStunnedRef.current = true; isGlidingRef.current = false; }
    }

    let nextX = posRef.current.x + velRef.current.x;
    nextX = Math.max(0, Math.min(nextX, WORLD_WIDTH - PLAYER_SIZE));
    let colX = platformsRef.current.find(p => p.type !== PlatformType.WATER && p.type !== PlatformType.EXIT && nextX < p.x + p.width && nextX + PLAYER_SIZE > p.x && posRef.current.y < p.y + p.height && posRef.current.y + PLAYER_SIZE > p.y);
    if (colX) { if (colX.type === PlatformType.SPIKE) die("Trap hit"); velRef.current.x = 0; } else posRef.current.x = nextX;

    let nextY = posRef.current.y + velRef.current.y;
    let colY = platformsRef.current.find(p => p.type !== PlatformType.WATER && p.type !== PlatformType.EXIT && posRef.current.x < p.x + p.width && posRef.current.x + PLAYER_SIZE > p.x && nextY < p.y + p.height && nextY + PLAYER_SIZE > p.y);
    if (colY) {
      if (velRef.current.y > 0) {
        isGroundedRef.current = true; isGlidingRef.current = false; canGlideRef.current = false; jumpCountRef.current = 0;
        if (colY.type === PlatformType.SPIKE) die("Spike hit");
        posRef.current.y = colY.y - PLAYER_SIZE;
      } else { if (colY.type === PlatformType.SPIKE) die("Spike hit"); velRef.current.y = 0; }
      velRef.current.y = 0;
    } else { isGroundedRef.current = false; posRef.current.y = nextY; }

    if (posRef.current.y > WORLD_HEIGHT) die("Fell into void");

    cameraRef.current.x += (posRef.current.x + PLAYER_SIZE / 2 - VIEWPORT_WIDTH / 2 - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (posRef.current.y + PLAYER_SIZE / 2 - VIEWPORT_HEIGHT / 2 - cameraRef.current.y) * 0.1;
    cameraRef.current.x = Math.max(0, Math.min(cameraRef.current.x, WORLD_WIDTH - VIEWPORT_WIDTH));
    cameraRef.current.y = Math.max(0, Math.min(cameraRef.current.y, WORLD_HEIGHT - VIEWPORT_HEIGHT));

    projectilesRef.current.forEach(p => { p.x += p.vx; p.y += p.vy; });
    projectilesRef.current = projectilesRef.current.filter(p => {
      if (p.x < 0 || p.x > WORLD_WIDTH || p.y < 0 || p.y > WORLD_HEIGHT) return false;
      let hit = false;
      monstersRef.current.forEach(m => { if (!hit && p.x < m.x + m.width && p.x + p.width > m.x && p.y < m.y + m.height && p.y + p.height > m.y) { hit = true; m.hp -= BOW_DAMAGE; } });
      return !hit;
    });
    monstersRef.current = monstersRef.current.filter(m => m.hp > 0);
  };

  const animate = () => {
    updatePhysics();
    if (!isGameOver) {
      setMonsters([...monstersRef.current]);
      setProjectiles([...projectilesRef.current]);
      setPlatforms([...platformsRef.current]);
      setEffects([...effectsRef.current]);
      setCamera({ ...cameraRef.current });
      setOverrideState(prev => (prev.active && prev.timer > 0) ? { ...prev, timer: prev.timer - 1, active: prev.timer > 1 } : prev);
      if (overrideState.timer === 1) overrideRef.current = 'NONE';

      setPlayerState({
        position: { ...posRef.current }, velocity: { ...velRef.current }, hp: hpRef.current, maxHp: PLAYER_MAX_HP,
        isGrounded: isGroundedRef.current, isGliding: isGlidingRef.current, focus: focusRef.current,
        isStunned: isStunnedRef.current, facingRight: facingRightRef.current, isAttacking: isAttackingRef.current,
        currentWeapon: currentWeaponRef.current, invincibleTimer: invincibleTimerRef.current,
        currentLevel: currentLevelRef.current, equippedCharacter: equippedCharRef.current, equippedWeaponSkin: equippedWeaponRef.current,
      });
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const renderPlayerVisuals = (charItem: GachaItem | null, isStunned: boolean, facingRight: boolean, velocity: Vector2) => {
    const isMoving = Math.abs(velocity.x) > 0.1;
    const directionScale = facingRight ? 'scale-x-100' : '-scale-x-100';
    return (
      <div className={`relative w-full h-full ${isStunned ? 'opacity-50' : ''} ${directionScale} transition-transform`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-800 rounded-sm"></div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-4 bg-blue-600"></div>
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 flex gap-1 ${isMoving ? 'animate-bounce' : ''}`}>
           <div className="w-2 h-3 bg-gray-800"></div><div className="w-2 h-3 bg-gray-800"></div>
        </div>
      </div>
    );
  };

  const renderWeaponVisuals = (weaponItem: GachaItem | null, weaponType: WeaponType, facingRight: boolean, isAttacking: boolean, angle: number) => {
    const rot = isAttacking ? 'rotate-45' : 'rotate-0';
    return <div className={`absolute transition-transform ${rot}`} style={{ left: 20, top: 10 }}><Sword size={20} /></div>;
  };

  return (
    <div id="game-area" className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono overflow-hidden">
      {gameStarted && !isGameOver && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-96 z-20 flex flex-col gap-2">
          <div className="flex justify-center gap-2">
            {Array.from({ length: playerState.maxHp }).map((_, i) => <Heart key={i} size={24} className={i < playerState.hp ? 'text-red-500 fill-red-500' : 'text-gray-700'} />)}
          </div>
          <div className="h-4 w-full bg-gray-900 border border-gray-700 rounded-sm overflow-hidden">
            <div className={`h-full transition-all bg-cyan-500`} style={{ width: `${playerState.focus}%` }} />
          </div>
        </div>
      )}

      {overrideState.active && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 border-2 border-purple-500 p-4 rounded-lg">
          <div className="text-purple-400 font-bold mb-1">SYSTEM OVERRIDE: {overrideState.type}</div>
          <div className="text-sm">"{overrideState.message}"</div>
        </div>
      )}

      {levelIntro && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 text-center bg-black/60 p-4 rounded">
          <p className="text-gray-200 italic text-lg">{levelIntro}</p>
        </div>
      )}

      <div id="game-viewport" className="relative bg-gray-900 border-2 border-gray-800 overflow-hidden" style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}>
        <div style={{ transform: `translate3d(${-camera.x}px, ${-camera.y}px, 0)` }}>
          {platforms.map(p => (
            <div key={p.id} className="absolute border bg-gray-700" style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
              {p.type === PlatformType.EXIT && <DoorOpen className="text-green-500 m-auto" />}
            </div>
          ))}
          {monsters.map(m => (
            <div key={m.id} className="absolute bg-red-600" style={{ left: m.x, top: m.y, width: m.width, height: m.height }}>
               <Skull size={16} className="m-auto" />
            </div>
          ))}
          {gameStarted && !isGameOver && (
            <div className="absolute" style={{ left: playerState.position.x, top: playerState.position.y, width: PLAYER_SIZE, height: PLAYER_SIZE }}>
              {renderPlayerVisuals(null, playerState.isStunned, playerState.facingRight, playerState.velocity)}
              {renderWeaponVisuals(null, playerState.currentWeapon, playerState.facingRight, playerState.isAttacking, 0)}
            </div>
          )}
        </div>
      </div>

      {!gameStarted && !isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black">
          <h1 className="text-7xl font-black mb-8">VOID GAME</h1>
          <button onClick={() => loadLevel(1)} className="px-12 py-4 bg-white text-black font-bold text-2xl hover:bg-gray-200">START</button>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/95">
          <Skull size={80} className="text-red-500 mb-6" />
          <h2 className="text-5xl font-black text-red-600 mb-4">FATAL ERROR</h2>
          <div className="bg-gray-900 p-6 rounded border border-green-500 w-full max-w-xl font-mono text-green-400">
             {isAiLoading ? "ACCESSING SYSTEM LOGS..." : typingText}
          </div>
          <button onClick={() => loadLevel(1)} className="mt-8 px-8 py-3 bg-red-600 text-white font-bold">REBOOT (R)</button>
        </div>
      )}

      <div className="mt-4 text-gray-500 text-xs">
        Move: Arrows / Jump: Space / Attack: Click / Weapon: 1-4 / AI Hack: F
      </div>
    </div>
  );
};