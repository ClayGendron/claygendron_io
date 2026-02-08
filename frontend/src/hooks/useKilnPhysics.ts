import { useEffect, useRef, useCallback } from "react";

// ---- Constants ----
const R = 5; // ball radius (px)
const SLING_SCALE = 0.5; // drag px → velocity
const MAX_VEL = 32;
const SCAN_STEP = 1; // px between bitmap scans

const GRAVITY = 1.0; // downward acceleration (px/frame²)
const RESTITUTION = 0.85; // energy kept per bounce
const BOUNCE_MIN = 0.9; // if |v·n| is below this, disable bounce
const AIR_FRICTION = 0.999; // per-frame velocity multiplier
const STATIC_FRICTION = 0.22;
const KINETIC_FRICTION = 0.06;
const STATIC_LOCK_SPEED = 0.35;
const STOP_SPEED = 0.02; // snap-to-zero threshold
const SUB_STEPS_MIN = 8;
const MAX_SUB_STEPS = 48;
const MAX_STEP_DISP = R * 0.75; // target max displacement per sub-step
const HASH_CELL = 24; // spatial hash cell size (px)
const IDLE_LIMIT = 60;

interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface CollisionResult {
  nx: number;
  ny: number;
  pen: number;
}

interface SpatialHash {
  cells: Record<string, number[]>;
  cellSize: number;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  frozen: boolean;
}

interface PhysicsRefs {
  frameRef: React.RefObject<HTMLDivElement | null>;
  arenaRef: React.RefObject<HTMLDivElement | null>;
  ballRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  line1Ref: React.RefObject<HTMLSpanElement | null>;
  line2Ref: React.RefObject<HTMLSpanElement | null>;
  markRef: React.RefObject<HTMLSpanElement | null>;
  aimLineRef: React.RefObject<SVGLineElement | null>;
  aimDirRef: React.RefObject<SVGLineElement | null>;
  labelRef: React.RefObject<HTMLSpanElement | null>;
}

export function useKilnPhysics(refs: PhysicsRefs) {
  const ballState = useRef<BallState>({ x: 0, y: 0, vx: 0, vy: 0, frozen: true });
  const rectsRef = useRef<Rect[]>([]);
  const allRectsRef = useRef<Rect[]>([]);
  const hashRef = useRef<SpatialHash | null>(null);
  const aWRef = useRef(0);
  const aHRef = useRef(0);
  const isActiveRef = useRef(false);
  const isDraggingRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const idleFramesRef = useRef(0);
  const hadContactRef = useRef(false);

  // ---- Spatial hash ----
  const createSpatialHash = useCallback((rectList: Rect[], cellSize: number): SpatialHash => {
    const cells: Record<string, number[]> = {};
    for (let i = 0; i < rectList.length; i++) {
      const r = rectList[i];
      const c1 = Math.floor(r.x1 / cellSize);
      const r1 = Math.floor(r.y1 / cellSize);
      const c2 = Math.floor(r.x2 / cellSize);
      const r2 = Math.floor(r.y2 / cellSize);
      for (let row = r1; row <= r2; row++) {
        for (let col = c1; col <= c2; col++) {
          const key = col + "," + row;
          if (!cells[key]) cells[key] = [];
          cells[key].push(i);
        }
      }
    }
    return { cells, cellSize };
  }, []);

  const queryHash = useCallback((h: SpatialHash, cx: number, cy: number, r: number): number[] => {
    const cs = h.cellSize;
    const c1 = Math.floor((cx - r) / cs);
    const r1 = Math.floor((cy - r) / cs);
    const c2 = Math.floor((cx + r) / cs);
    const r2 = Math.floor((cy + r) / cs);
    const seen = new Set<number>();
    const result: number[] = [];
    for (let row = r1; row <= r2; row++) {
      for (let col = c1; col <= c2; col++) {
        const bucket = h.cells[col + "," + row];
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const idx = bucket[i];
          if (!seen.has(idx)) {
            seen.add(idx);
            result.push(idx);
          }
        }
      }
    }
    return result;
  }, []);

  // ---- Circle vs AABB collision ----
  const circleVsAABB = useCallback((cx: number, cy: number, r: number, rect: Rect): CollisionResult | null => {
    const nearX = Math.max(rect.x1, Math.min(cx, rect.x2));
    const nearY = Math.max(rect.y1, Math.min(cy, rect.y2));
    const dx = cx - nearX;
    const dy = cy - nearY;
    const distSq = dx * dx + dy * dy;

    if (distSq === 0) {
      const toLeft = cx - rect.x1;
      const toRight = rect.x2 - cx;
      const toTop = cy - rect.y1;
      const toBottom = rect.y2 - cy;
      const minDist = Math.min(toLeft, toRight, toTop, toBottom);

      if (minDist === toLeft) return { nx: -1, ny: 0, pen: toLeft + r };
      else if (minDist === toRight) return { nx: 1, ny: 0, pen: toRight + r };
      else if (minDist === toTop) return { nx: 0, ny: -1, pen: toTop + r };
      else return { nx: 0, ny: 1, pen: toBottom + r };
    }

    if (distSq >= r * r) return null;

    const dist = Math.sqrt(distSq);
    return { nx: dx / dist, ny: dy / dist, pen: r - dist };
  }, []);

  // ---- Physics step ----
  const physicsStep = useCallback((dt: number) => {
    const ball = ballState.current;
    if (ball.frozen || isDraggingRef.current) return;

    ball.vy += GRAVITY * dt;

    const airMul = Math.pow(AIR_FRICTION, dt);
    ball.vx *= airMul;
    ball.vy *= airMul;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const hash = hashRef.current;
    if (!hash) return;

    const candidates = queryHash(hash, ball.x, ball.y, R);

    hadContactRef.current = false;
    for (let i = 0; i < candidates.length; i++) {
      const rect = allRectsRef.current[candidates[i]];
      const hit = circleVsAABB(ball.x, ball.y, R, rect);
      if (!hit) continue;

      hadContactRef.current = true;

      ball.x += hit.nx * hit.pen;
      ball.y += hit.ny * hit.pen;

      const vDotN = ball.vx * hit.nx + ball.vy * hit.ny;
      if (vDotN < 0) {
        const e = Math.abs(vDotN) < BOUNCE_MIN ? 0 : RESTITUTION;
        const jn = -(1 + e) * vDotN;
        ball.vx += jn * hit.nx;
        ball.vy += jn * hit.ny;
      }

      const tx = -hit.ny;
      const ty = hit.nx;
      const vDotT = ball.vx * tx + ball.vy * ty;
      if (Math.abs(vDotT) > 1e-5) {
        const normalApproach = Math.max(0, -vDotN);
        const restingLoad = GRAVITY * dt * Math.max(0, hit.ny);
        const normalBudget = Math.max(normalApproach, restingLoad);
        if (normalBudget > 0) {
          const maxStatic = STATIC_FRICTION * normalBudget;
          const canStaticLock = Math.abs(vDotN) < BOUNCE_MIN && Math.abs(vDotT) < STATIC_LOCK_SPEED;
          if (canStaticLock && Math.abs(vDotT) <= maxStatic) {
            ball.vx -= vDotT * tx;
            ball.vy -= vDotT * ty;
          } else {
            const maxKinetic = KINETIC_FRICTION * normalBudget;
            const jt = Math.max(-maxKinetic, Math.min(maxKinetic, -vDotT));
            ball.vx += jt * tx;
            ball.vy += jt * ty;
          }
        }
      }
    }

    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (hadContactRef.current && speed < STOP_SPEED) {
      ball.vx = 0;
      ball.vy = 0;
    }
  }, [queryHash, circleVsAABB]);

  // ---- Layout arena ----
  const layoutArena = useCallback(() => {
    const arenaEl = refs.arenaRef.current;
    if (!arenaEl) return;
    const arenaRect = arenaEl.getBoundingClientRect();
    aWRef.current = arenaRect.width;
    aHRef.current = arenaRect.height;
  }, [refs.arenaRef]);

  // ---- Build collision bitmap ----
  const getCollisionBitmap = useCallback(() => {
    const arenaEl = refs.arenaRef.current;
    const titleEl = refs.titleRef.current;
    const line1 = refs.line1Ref.current;
    const line2 = refs.line2Ref.current;
    if (!arenaEl || !titleEl || !line1 || !line2) return null;

    const aW = aWRef.current;
    const aH = aHRef.current;
    const dpr = window.devicePixelRatio || 1;
    const mW = Math.round(aW * dpr);
    const mH = Math.round(aH * dpr);

    const c = document.createElement("canvas");
    c.width = mW;
    c.height = mH;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.scale(dpr, dpr);

    const style = getComputedStyle(titleEl);
    const fontSize = parseFloat(style.fontSize);
    ctx.font = "300 " + fontSize + "px Newsreader Variable, Newsreader, serif";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "top";
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = style.letterSpacing;
    }

    const arenaRect = arenaEl.getBoundingClientRect();
    const r1 = line1.getBoundingClientRect();
    const r2 = line2.getBoundingClientRect();

    const x1 = r1.left - arenaRect.left;
    const y1 = r1.top - arenaRect.top;
    const x2 = r2.left - arenaRect.left;
    const y2 = r2.top - arenaRect.top;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    const text1 = line1.textContent || "";
    const text2 = line2.textContent || "";
    ctx.fillText(text1, x1, y1);
    ctx.strokeText(text1, x1, y1);
    ctx.fillText(text2, x2, y2);
    ctx.strokeText(text2, x2, y2);

    return { data: ctx.getImageData(0, 0, mW, mH).data, w: mW, h: mH, dpr };
  }, [refs.arenaRef, refs.titleRef, refs.line1Ref, refs.line2Ref]);

  // ---- Convert bitmap → AABBs ----
  const buildLetterRects = useCallback((bitmap: { data: Uint8ClampedArray; w: number; h: number; dpr: number }): Rect[] => {
    const { data, w, h, dpr } = bitmap;
    const out: Rect[] = [];
    const step = Math.round(SCAN_STEP * dpr);
    const rowH = SCAN_STEP + 1;

    for (let py = 0; py < h; py += step) {
      let inText = false;
      let startX = 0;

      for (let px = 0; px < w; px++) {
        const idx = (py * w + px) * 4 + 3;
        const hit = data[idx] > 80;

        if (hit && !inText) {
          startX = px / dpr;
          inText = true;
        } else if (!hit && inText) {
          const endX = px / dpr;
          if (endX - startX > 1) {
            const cy = py / dpr;
            out.push({ x1: startX, y1: cy, x2: endX, y2: cy + rowH });
          }
          inText = false;
        }
      }
      if (inText) {
        const endX = w / dpr;
        if (endX - startX > 1) {
          const cy = py / dpr;
          out.push({ x1: startX, y1: cy, x2: endX, y2: cy + rowH });
        }
      }
    }
    return out;
  }, []);

  // ---- Build walls ----
  const buildWalls = useCallback((): Rect[] => {
    const aW = aWRef.current;
    const aH = aHRef.current;
    const thick = 20;
    return [
      { x1: -thick, y1: -thick, x2: aW + thick, y2: 0 },
      { x1: -thick, y1: aH, x2: aW + thick, y2: aH + thick },
      { x1: -thick, y1: -thick, x2: 0, y2: aH + thick },
      { x1: aW, y1: -thick, x2: aW + thick, y2: aH + thick },
    ];
  }, []);

  // ---- Render loop ----
  const render = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const frameDt = Math.min(timestamp - lastTimeRef.current, 33.33);
    lastTimeRef.current = timestamp;
    const frameNormDt = frameDt / 16.67;

    const ball = ballState.current;
    const speedForStep = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const motionSteps = Math.ceil((speedForStep * frameNormDt) / MAX_STEP_DISP);
    const stepCount = Math.min(MAX_SUB_STEPS, Math.max(SUB_STEPS_MIN, motionSteps || 1));
    const subDt = frameNormDt / stepCount;

    for (let i = 0; i < stepCount; i++) {
      physicsStep(subDt);
    }

    const ballEl = refs.ballRef.current;
    if (ballEl) {
      ballEl.style.left = ball.x + "px";
      ballEl.style.top = ball.y + "px";

      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > 0.8) {
        const stretch = Math.min(speed / 14, 0.32);
        const angle = Math.atan2(ball.vy, ball.vx) * (180 / Math.PI);
        ballEl.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${1 + stretch},${1 - stretch * 0.5})`;
      } else {
        ballEl.style.transform = "translate(-50%,-50%)";
      }

      if (!isDraggingRef.current && speed < STOP_SPEED && hadContactRef.current) {
        idleFramesRef.current++;
      } else {
        idleFramesRef.current = 0;
      }

      if (idleFramesRef.current >= IDLE_LIMIT) {
        rafRef.current = null;
        return;
      }
    }

    rafRef.current = requestAnimationFrame(render);
  }, [physicsStep, refs.ballRef]);

  // ---- Initialize physics ----
  const initPhysics = useCallback((startX: number, startY: number, preserveVx?: number, preserveVy?: number) => {
    ballState.current = { x: startX, y: startY, vx: preserveVx || 0, vy: preserveVy || 0, frozen: false };
    hadContactRef.current = false;

    const bitmap = getCollisionBitmap();
    if (!bitmap) return;

    rectsRef.current = buildLetterRects(bitmap);
    const wallRects = buildWalls();
    allRectsRef.current = rectsRef.current.concat(wallRects);
    hashRef.current = createSpatialHash(allRectsRef.current, HASH_CELL);

    lastTimeRef.current = 0;
    idleFramesRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
  }, [getCollisionBitmap, buildLetterRects, buildWalls, createSpatialHash, render]);

  // ---- Wake without rebuilding colliders ----
  const wakePhysics = useCallback(() => {
    if (!rafRef.current && isActiveRef.current) {
      ballState.current.frozen = false;
      lastTimeRef.current = 0;
      idleFramesRef.current = 0;
      rafRef.current = requestAnimationFrame(render);
    }
  }, [render]);

  // ---- Update label gap ----
  const updateLabelGap = useCallback(() => {
    const labelEl = refs.labelRef.current;
    const frameEl = refs.frameRef.current;
    if (!labelEl || !frameEl) return;

    const labelRect = labelEl.getBoundingClientRect();
    const frameRect = frameEl.getBoundingClientRect();
    frameEl.style.setProperty("--label-left", (labelRect.left - frameRect.left) + "px");
    frameEl.style.setProperty("--label-right", (labelRect.right - frameRect.left) + "px");
  }, [refs.labelRef, refs.frameRef]);

  // ---- Activate ----
  const activate = useCallback(() => {
    if (isActiveRef.current) return;

    const markEl = refs.markRef.current;
    const arenaEl = refs.arenaRef.current;
    const ballEl = refs.ballRef.current;
    if (!markEl || !arenaEl || !ballEl) return;

    const markRect = markEl.getBoundingClientRect();
    const arenaRect = arenaEl.getBoundingClientRect();
    const startX = markRect.left - arenaRect.left + markRect.width / 2;
    const startY = markRect.top - arenaRect.top + markRect.height / 2;

    markEl.style.visibility = "hidden";
    markEl.style.animation = "none";
    ballEl.style.display = "block";
    arenaEl.classList.add("active");
    isActiveRef.current = true;

    layoutArena();
    initPhysics(startX, startY);
  }, [refs.markRef, refs.arenaRef, refs.ballRef, layoutArena, initPhysics]);

  // ---- Pointer helpers ----
  const getPointerPos = useCallback((e: MouseEvent | TouchEvent) => {
    const arenaEl = refs.arenaRef.current;
    if (!arenaEl) return { x: 0, y: 0 };
    const ev = "touches" in e ? e.touches[0] : e;
    const r = arenaEl.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }, [refs.arenaRef]);

  // ---- Cleanup drag ----
  const cleanupDragRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const { arenaRef, ballRef, markRef, aimLineRef, aimDirRef } = refs;

    function onMove(e: MouseEvent | TouchEvent) {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const ev = "touches" in e ? e.touches[0] : e;
      const arenaEl = arenaRef.current;
      if (!arenaEl) return;
      const r = arenaEl.getBoundingClientRect();
      mouseRef.current.x = ev.clientX - r.left;
      mouseRef.current.y = ev.clientY - r.top;

      const ball = ballState.current;
      const bx = ball.x;
      const by = ball.y;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const aimLine = aimLineRef.current;
      if (aimLine) {
        aimLine.setAttribute("x1", String(bx));
        aimLine.setAttribute("y1", String(by));
        aimLine.setAttribute("x2", String(mx));
        aimLine.setAttribute("y2", String(my));
      }

      const aimDir = aimDirRef.current;
      if (aimDir) {
        const dx = bx - mx;
        const dy = by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          const power = Math.min(dist, 220);
          const nx = dx / dist;
          const ny = dy / dist;
          aimDir.setAttribute("x1", String(bx));
          aimDir.setAttribute("y1", String(by));
          aimDir.setAttribute("x2", String(bx + nx * power * 0.6));
          aimDir.setAttribute("y2", String(by + ny * power * 0.6));
        }
      }
    }

    function cleanupDrag() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const ballEl = ballRef.current;
      if (ballEl) ballEl.classList.remove("dragging");

      const aimLine = aimLineRef.current;
      const aimDir = aimDirRef.current;
      if (aimLine) aimLine.style.opacity = "0";
      if (aimDir) aimDir.style.opacity = "0";

      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("touchcancel", onCancel);
    }
    cleanupDragRef.current = cleanupDrag;

    function onUp() {
      if (!isDraggingRef.current) return;

      const ball = ballState.current;
      const bx = ball.x;
      const by = ball.y;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dx = bx - mx;
      const dy = by - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      cleanupDrag();

      if (dist < 5) {
        ball.frozen = false;
        return;
      }

      const power = Math.min(dist, 220);
      let vx = (dx / dist) * power * SLING_SCALE;
      let vy = (dy / dist) * power * SLING_SCALE;

      const spd = Math.sqrt(vx * vx + vy * vy);
      if (spd > MAX_VEL) {
        vx = (vx / spd) * MAX_VEL;
        vy = (vy / spd) * MAX_VEL;
      }

      ball.vx = vx;
      ball.vy = vy;
      ball.frozen = false;
    }

    function onCancel() {
      cleanupDrag();
      ballState.current.frozen = false;
      wakePhysics();
    }

    function onDown(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      if (!isActiveRef.current) {
        activate();
      }
      wakePhysics();

      const ball = ballState.current;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > 2 && !ball.frozen) return;

      isDraggingRef.current = true;
      ball.frozen = true;
      ball.vx = 0;
      ball.vy = 0;

      const p = getPointerPos(e);
      mouseRef.current.x = p.x;
      mouseRef.current.y = p.y;

      const ballEl = ballRef.current;
      if (ballEl) ballEl.classList.add("dragging");

      const aimLine = aimLineRef.current;
      const aimDir = aimDirRef.current;
      if (aimLine) aimLine.style.opacity = "0.35";
      if (aimDir) aimDir.style.opacity = "0.2";

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
      document.addEventListener("touchcancel", onCancel);
    }

    const markEl = markRef.current;
    const ballEl = ballRef.current;
    if (markEl) {
      markEl.addEventListener("mousedown", onDown as EventListener);
      markEl.addEventListener("touchstart", onDown as EventListener, { passive: false });
    }
    if (ballEl) {
      ballEl.addEventListener("mousedown", onDown as EventListener);
      ballEl.addEventListener("touchstart", onDown as EventListener, { passive: false });
    }

    function handleBlur() {
      onCancel();
    }

    function handleVisibility() {
      if (document.hidden) {
        onCancel();
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else if (isActiveRef.current) {
        wakePhysics();
      }
    }

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);

    let resizeTimer: ReturnType<typeof setTimeout>;
    function handleResize() {
      layoutArena();
      updateLabelGap();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isActiveRef.current) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          const ball = ballState.current;
          const prevVx = ball.vx;
          const prevVy = ball.vy;
          layoutArena();
          const prevX = Math.min(ball.x, aWRef.current - R);
          const prevY = Math.min(ball.y, aHRef.current - R);
          initPhysics(prevX, prevY, prevVx, prevVy);
        }
      }, 1);
    }

    window.addEventListener("resize", handleResize);

    // Initial layout
    layoutArena();
    updateLabelGap();

    return () => {
      if (markEl) {
        markEl.removeEventListener("mousedown", onDown as EventListener);
        markEl.removeEventListener("touchstart", onDown as EventListener);
      }
      if (ballEl) {
        ballEl.removeEventListener("mousedown", onDown as EventListener);
        ballEl.removeEventListener("touchstart", onDown as EventListener);
      }
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [refs, activate, wakePhysics, getPointerPos, layoutArena, updateLabelGap, initPhysics]);

  return { activate };
}
