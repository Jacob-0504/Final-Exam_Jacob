
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants ---
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 500;
const ROAD_WIDTH = 2400; 
const SEGMENT_LENGTH = 200;
const RUMBLE_LENGTH = 3;
const LANES = 4;
const BASE_FOV = 100;
const CAMERA_HEIGHT = 1200;
const DRAW_DISTANCE = 300;

const MAX_SPEED = 28000; 
const ACCEL = 10000; 
const BREAKING = -25000;
const DECEL = -5000;

// --- Types ---
interface Sprite {
  offset: number;
  type: 'tower' | 'lamp' | 'billboard';
  color: string;
}

interface Segment {
  index: number;
  p1: { 
    world: { x: number, y: number, z: number }, 
    screen: { x: number, y: number, w: number },
    camera: { x: number, y: number, z: number } 
  };
  p2: { 
    world: { x: number, y: number, z: number }, 
    screen: { x: number, y: number, w: number },
    camera: { x: number, y: number, z: number } 
  };
  curve: number;
  y: number;
  color: { road: string, grass: string, rumble: string, lane?: string };
  cars: any[];
  sprites: Sprite[];
}

const COLORS = {
  LIGHT: { road: '#15151a', grass: '#050510', rumble: '#333', lane: '#00ffff' },
  DARK:  { road: '#101015', grass: '#020208', rumble: '#111' },
  TUNNEL: { road: '#000', grass: '#000', rumble: '#444', lane: '#ff00ff' }
};

const asphalt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover'>('menu');
  const [speed, setSpeed] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [health, setHealth] = useState(100);
  const [distance, setDistance] = useState(0);

  const segmentsRef = useRef<Segment[]>([]);
  const playerRef = useRef({ 
    x: 0, z: 0, speed: 0, nitroActive: false, shake: 0, health: 100, 
    sparks: [] as any[], tilt: 0 
  });
  const trackLengthRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const resetTrack = useCallback(() => {
    const segments: Segment[] = [];
    let lastY = 0;
    for (let i = 0; i < 5000; i++) {
      const y = Math.sin(i / 25) * 1000 + Math.cos(i / 60) * 800;
      const isTunnel = i > 2500 && i < 3000;
      
      const seg: Segment = {
        index: i,
        p1: { world: { x: 0, y: lastY, z: i * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 }, camera: { x: 0, y: 0, z: 0 } },
        p2: { world: { x: 0, y: y, z: (i + 1) * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 }, camera: { x: 0, y: 0, z: 0 } },
        curve: (i > 300 && i < 600) ? 1.5 : (i > 1000 && i < 1400) ? -2 : (i > 3500 && i < 4000) ? 3 : 0,
        y: y,
        color: isTunnel ? COLORS.TUNNEL : (Math.floor(i / RUMBLE_LENGTH) % 2 ? COLORS.LIGHT : COLORS.DARK),
        cars: [],
        sprites: []
      };

      if (i % 20 === 0) {
        seg.sprites.push({ 
          offset: i % 40 === 0 ? -2.2 : 2.2, 
          type: 'tower', 
          color: `hsl(${200 + Math.sin(i/15)*50}, 100%, 60%)` 
        });
      }
      if (i % 60 === 0) {
          seg.sprites.push({
              offset: (i / 60) % 2 === 0 ? -3.0 : 3.0,
              type: 'billboard',
              color: '#ff00ff'
          });
      }

      segments.push(seg);
      lastY = y;
    }
    segmentsRef.current = segments;
    trackLengthRef.current = segments.length * SEGMENT_LENGTH;
  }, []);

  useEffect(() => {
    resetTrack();
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [resetTrack]);

  const project = (p: any, cameraX: number, cameraY: number, cameraZ: number, currentDepth: number) => {
    p.camera = {
      x: (p.world.x || 0) - cameraX,
      y: (p.world.y || 0) - cameraY,
      z: (p.world.z || 0) - cameraZ
    };
    const z = Math.max(1, p.camera.z);
    const scale = currentDepth / z;
    p.screen = {
      x: Math.round((SCREEN_WIDTH / 2) + (scale * p.camera.x * SCREEN_WIDTH / 2)),
      y: Math.round((SCREEN_HEIGHT / 2) - (scale * p.camera.y * SCREEN_HEIGHT / 2)),
      w: Math.round(scale * ROAD_WIDTH * SCREEN_WIDTH / 2)
    };
  };

  const drawHQCar = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, isPlayer: boolean) => {
    if (!isFinite(w) || !isFinite(h) || w < 1 || h < 1) return;
    ctx.save();
    ctx.translate(x, y);
    const p = playerRef.current;
    if (isPlayer) ctx.rotate(p.tilt * 0.06); 
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.1, w * 0.7, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createLinearGradient(0, -h, 0, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-w/2, 0);
    ctx.lineTo(-w/2 * 0.8, -h * 0.5);
    ctx.quadraticCurveTo(0, -h * 1.2, w/2 * 0.8, -h * 0.5);
    ctx.lineTo(w/2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#050510';
    ctx.fillRect(-w/3, -h * 0.9, (w/3)*2, h * 0.4);
    const isBraking = keysRef.current['ArrowDown'];
    ctx.shadowBlur = isPlayer ? 15 : 5;
    const lightColor = isPlayer ? (p.speed > 0 && !isBraking ? '#ff0055' : '#ffffff') : '#ffee00';
    ctx.fillStyle = lightColor;
    ctx.shadowColor = lightColor;
    ctx.fillRect(-w/2 * 0.75, -h * 0.4, w * 0.25, h * 0.15);
    ctx.fillRect(w/2 * 0.5, -h * 0.4, w * 0.25, h * 0.15);
    ctx.restore();
    ctx.shadowBlur = 0;
  };

  const drawSprite = (ctx: CanvasRenderingContext2D, sprite: Sprite, scale: number, destX: number, destY: number) => {
    if (!isFinite(scale) || scale <= 0) return;
    const w = scale * (sprite.type === 'tower' ? 800 : 1200);
    const h = scale * (sprite.type === 'tower' ? 3000 : 1500);
    if (!isFinite(w) || !isFinite(h)) return;
    ctx.save();
    ctx.translate(destX, destY);
    if (sprite.type === 'tower') {
        const grad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
        grad.addColorStop(0, '#000');
        grad.addColorStop(0.5, sprite.color);
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = sprite.color;
        ctx.fillRect(-w/2, -h, w, h);
    } else if (sprite.type === 'billboard') {
        ctx.fillStyle = '#111';
        ctx.fillRect(-w/2, -h, w, h);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(-w/2, -h, w, h);
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  };

  const update = (time: number) => {
    const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;
    const p = playerRef.current;
    const currentState = gameStateRef.current;

    if (currentState === 'playing') {
      const steerLimit = 2.5 * (p.speed / MAX_SPEED + 0.4);
      if (keysRef.current['ArrowLeft']) {
          p.x -= dt * steerLimit;
          p.tilt = Math.max(-0.8, p.tilt - dt * 4);
      } else if (keysRef.current['ArrowRight']) {
          p.x += dt * steerLimit;
          p.tilt = Math.min(0.8, p.tilt + dt * 4);
      } else {
          p.tilt *= 0.85;
      }

      if (Math.abs(p.x) > 1.05) {
          p.health = 0;
          setHealth(0);
          p.speed *= 0.2;
          p.shake = 50;
          for(let i=0; i<30; i++) p.sparks.push({ x: Math.random()*100-50, y: Math.random()*50-25, vx: Math.random()*40-20, vy: Math.random()*40-20, life: 1 });
          endGame();
          return;
      }

      p.nitroActive = (keysRef.current[' '] || keysRef.current['Shift']) && nitro > 0 && p.speed > 100;
      const currentAccel = p.nitroActive ? ACCEL * 2.5 : ACCEL;
      
      if (keysRef.current['ArrowUp']) p.speed += currentAccel * dt;
      else if (keysRef.current['ArrowDown']) p.speed += BREAKING * dt;
      else p.speed += DECEL * dt;

      if (p.nitroActive) {
          setNitro(n => Math.max(0, n - dt * 35));
          p.shake = Math.random() * 8 - 4;
      } else {
          setNitro(n => Math.min(100, n + dt * 10));
          p.shake = p.speed > MAX_SPEED * 0.9 ? Math.random() * 2 - 1 : 0;
      }

      p.speed = Math.max(0, Math.min(p.speed, p.nitroActive ? MAX_SPEED * 1.5 : MAX_SPEED));
      p.z += p.speed * dt;

      setSpeed(Math.floor(p.speed / 100));
      setDistance(Math.floor(p.z / 100));

      if (p.z >= trackLengthRef.current) {
          endGame();
          return;
      }

      const segIdx = Math.floor(p.z / SEGMENT_LENGTH);
      const currentSegment = segmentsRef.current[segIdx % segmentsRef.current.length];
      if (currentSegment) {
        p.x -= (dt * 1.8 * (p.speed / MAX_SPEED) * currentSegment.curve);
      }
    }

    p.sparks = p.sparks.filter(s => {
        s.x += s.vx; s.y += s.vy; s.life -= 0.05;
        return s.life > 0;
    });

    render();
    requestRef.current = requestAnimationFrame(update);
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || segmentsRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const p = playerRef.current;
    const baseIdx = Math.floor(p.z / SEGMENT_LENGTH);
    const baseSegment = segmentsRef.current[baseIdx % segmentsRef.current.length];
    const speedRatio = p.speed / (MAX_SPEED * 1.5);
    const dynamicFov = BASE_FOV + (speedRatio * 35);
    const currentDepth = 1 / Math.tan((dynamicFov / 2) * Math.PI / 180);

    ctx.save();
    if (p.tilt !== 0) ctx.translate(SCREEN_WIDTH/2, SCREEN_HEIGHT/2), ctx.rotate(p.tilt * 0.01), ctx.translate(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2);
    if (p.shake !== 0) ctx.translate(p.shake, Math.random() * p.shake);
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    skyGrad.addColorStop(0, '#000010');
    skyGrad.addColorStop(1, '#a000a0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let maxy = SCREEN_HEIGHT;
    let x = 0;
    let dx = -(baseSegment.curve * (p.z % SEGMENT_LENGTH / SEGMENT_LENGTH));
    let camH = CAMERA_HEIGHT + baseSegment.p1.world.y;

    for (let i = 0; i < DRAW_DISTANCE; i++) {
      const segment = segmentsRef.current[(baseIdx + i) % segmentsRef.current.length];
      const looped = (baseIdx + i) >= segmentsRef.current.length;
      project(segment.p1, p.x * ROAD_WIDTH - x, camH, p.z - (looped ? trackLengthRef.current : 0), currentDepth);
      project(segment.p2, p.x * ROAD_WIDTH - x - dx, camH, p.z - (looped ? trackLengthRef.current : 0), currentDepth);
      x += dx; dx += segment.curve;
      if (segment.p1.camera.z <= 1 || segment.p2.screen.y >= maxy) continue;
      const s1 = segment.p1.screen; const s2 = segment.p2.screen; const col = segment.color;
      ctx.fillStyle = col.grass; ctx.fillRect(0, s2.y, SCREEN_WIDTH, s1.y - s2.y);
      ctx.fillStyle = col.rumble;
      ctx.beginPath(); ctx.moveTo(s1.x - s1.w * 1.15, s1.y); ctx.lineTo(s1.x - s1.w, s1.y); ctx.lineTo(s2.x - s2.w, s2.y); ctx.lineTo(s2.x - s2.w * 1.15, s2.y); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s1.x + s1.w * 1.15, s1.y); ctx.lineTo(s1.x + s1.w, s1.y); ctx.lineTo(s2.x + s2.w, s2.y); ctx.lineTo(s2.x + s2.w * 1.15, s2.y); ctx.fill();
      ctx.fillStyle = col.road; ctx.beginPath(); ctx.moveTo(s1.x - s1.w, s1.y); ctx.lineTo(s1.x + s1.w, s1.y); ctx.lineTo(s2.x + s2.w, s2.y); ctx.lineTo(s2.x - s2.w, s2.y); ctx.fill();
      if (col.lane) {
          ctx.fillStyle = col.lane; const laneW = s1.w * 2 / LANES;
          for(let j=1; j<LANES; j++) ctx.fillRect(s1.x - s1.w + laneW * j - 3, s2.y, 6, s1.y - s2.y);
      }
      maxy = s2.y;
    }

    for (let i = DRAW_DISTANCE - 1; i >= 0; i--) {
        const segment = segmentsRef.current[(baseIdx + i) % segmentsRef.current.length];
        const looped = (baseIdx + i) >= segmentsRef.current.length;
        const zDiff = segment.p1.world.z - p.z - (looped ? trackLengthRef.current : 0);
        const safeScale = currentDepth / Math.max(1, zDiff);
        if (isFinite(safeScale) && safeScale > 0) {
            segment.sprites.forEach(sprite => {
                const spriteX = (SCREEN_WIDTH / 2) + (safeScale * (sprite.offset * ROAD_WIDTH - p.x * ROAD_WIDTH) * SCREEN_WIDTH / 2);
                const spriteY = (SCREEN_HEIGHT / 2) - (safeScale * (camH - segment.p1.world.y) * SCREEN_HEIGHT / 2);
                drawSprite(ctx, sprite, safeScale, spriteX, spriteY);
            });
        }
    }
    drawHQCar(ctx, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 90, 150, 75, '#ff00ff', true);
    p.sparks.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 100, ${s.life})`;
        ctx.fillRect(SCREEN_WIDTH/2 + s.x, SCREEN_HEIGHT-110 + s.y, 5, 5);
    });
    ctx.restore();
  };

  const startGame = () => {
    gameStateRef.current = 'playing';
    setGameState('playing');
    playerRef.current = { x: 0, z: 0, speed: 0, nitroActive: false, shake: 0, health: 100, sparks: [], tilt: 0 };
    setHealth(100);
    setNitro(100);
  };

  const endGame = () => {
    gameStateRef.current = 'gameover';
    setGameState('gameover');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, val: boolean) => {
        keysRef.current[e.key] = val;
        if(val && e.key === 'Enter' && gameStateRef.current !== 'playing') startGame();
    };
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));
    return () => {
        window.removeEventListener('keydown', (e) => handleKey(e, true));
        window.removeEventListener('keyup', (e) => handleKey(e, false));
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-4 font-mono select-none overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-3 items-end mb-4 px-10 py-5 bg-black/50 border border-white/10 backdrop-blur-xl rounded-t-xl">
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${health > 30 ? 'bg-cyan-400' : 'bg-red-500 animate-ping'}`} />
                <span className="text-[10px] text-gray-400 font-black tracking-widest">SYSTEM_ACTIVE</span>
            </div>
            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${health > 30 ? 'bg-cyan-400' : 'bg-red-600'}`} style={{ width: `${health}%` }} />
            </div>
            <div className="text-5xl font-black italic mt-1 leading-none tracking-tighter">{speed}<span className="text-base text-cyan-900 ml-1">KM/H</span></div>
        </div>
        
        <div className="text-center pb-3">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-red-500 to-fuchsia-600 animate-pulse">
                DEATH_RUN.CORE
            </h1>
        </div>

        <div className="flex flex-col items-end">
            <span className="text-[10px] text-fuchsia-500 font-black mb-2 tracking-widest">DISTANCE</span>
            <div className="text-3xl font-black tracking-tighter">{distance} <span className="text-xs text-gray-600">/ 10000M</span></div>
            <div className="w-48 h-1 bg-gray-900 mt-1 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fuchsia-600 to-red-500" style={{ width: `${(distance/10000)*100}%` }} />
            </div>
        </div>
      </div>

      <div className="relative border-x border-b border-white/10 rounded-b-xl overflow-hidden shadow-[0_30px_100px_rgba(255,0,0,0.1)]">
        <canvas ref={canvasRef} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} className="bg-black" />

        <div className="absolute inset-0 pointer-events-none">
            {gameState === 'menu' && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-md">
                    <h2 className="text-8xl font-black italic text-white tracking-tighter mb-4">NEON</h2>
                    <p className="text-red-500 font-black mb-10 tracking-[0.5em] text-xs uppercase">Stay on the asphalt to survive</p>
                    <button onClick={startGame} className="px-24 py-8 bg-white text-black font-black text-2xl skew-x-[-10deg] hover:bg-red-500 hover:text-white transition-all">
                        INITIATE ENGINE
                    </button>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center pointer-events-auto">
                    <h2 className={`text-7xl font-black italic mb-8 tracking-tighter ${health <= 0 ? 'text-red-600' : 'text-cyan-400'}`}>
                        {health <= 0 ? 'OFF_ROAD_TERMINATED' : 'CONQUERED'}
                    </h2>
                    <div className="text-center mb-10">
                        <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">TOTAL_DISTANCE</p>
                        <p className="text-4xl font-black">{distance}M</p>
                    </div>
                    <button onClick={startGame} className="px-20 py-6 bg-red-600 text-white font-black hover:bg-white hover:text-black transition-all transform hover:-rotate-1 active:scale-95">
                        REBOOT RACE
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default asphalt;
