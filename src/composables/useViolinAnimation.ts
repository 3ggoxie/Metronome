import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useMetronome } from './useMetronome';
import { useTheme } from './useTheme';

export function useViolinAnimation(canvasRef: Ref<HTMLCanvasElement | null>) {
  const { isPlaying, currentBeat, bpm } = useMetronome();
  const { resolvedTheme } = useTheme();

  let animationId: number | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let lastBeat = -1;
  let time = 0;

  const amplitudes = ref<number[]>([0, 0, 0, 0]);
  const decays = ref<number[]>([0.93, 0.93, 0.93, 0.93]);

  // ── Stylized violin body outline ──
  const bodyPath = (cx: number, cy: number, s: number) => {
    ctx!.beginPath();
    // Top center
    ctx!.moveTo(cx, cy - s * 0.62);

    // Upper bout — right
    ctx!.bezierCurveTo(
      cx + s * 0.10, cy - s * 0.62,
      cx + s * 0.27, cy - s * 0.50,
      cx + s * 0.26, cy - s * 0.28,
    );
    // Upper corner → C-bout
    ctx!.bezierCurveTo(
      cx + s * 0.25, cy - s * 0.18,
      cx + s * 0.24, cy - s * 0.12,
      cx + s * 0.21, cy - s * 0.12,
    );
    // C-bout (waist)
    ctx!.bezierCurveTo(
      cx + s * 0.14, cy - s * 0.04,
      cx + s * 0.12, cy + s * 0.02,
      cx + s * 0.14, cy + s * 0.08,
    );
    // Lower corner
    ctx!.bezierCurveTo(
      cx + s * 0.16, cy + s * 0.15,
      cx + s * 0.24, cy + s * 0.20,
      cx + s * 0.26, cy + s * 0.30,
    );
    // Lower bout
    ctx!.bezierCurveTo(
      cx + s * 0.29, cy + s * 0.42,
      cx + s * 0.34, cy + s * 0.54,
      cx + s * 0.32, cy + s * 0.58,
    );
    // Bottom curve
    ctx!.bezierCurveTo(
      cx + s * 0.18, cy + s * 0.66,
      cx + s * 0.04, cy + s * 0.68,
      cx, cy + s * 0.66,
    );

    // Left side — mirror bottom → top
    ctx!.bezierCurveTo(
      cx - s * 0.04, cy + s * 0.68,
      cx - s * 0.18, cy + s * 0.66,
      cx - s * 0.32, cy + s * 0.58,
    );
    ctx!.bezierCurveTo(
      cx - s * 0.34, cy + s * 0.54,
      cx - s * 0.29, cy + s * 0.42,
      cx - s * 0.26, cy + s * 0.30,
    );
    ctx!.bezierCurveTo(
      cx - s * 0.24, cy + s * 0.20,
      cx - s * 0.16, cy + s * 0.15,
      cx - s * 0.14, cy + s * 0.08,
    );
    ctx!.bezierCurveTo(
      cx - s * 0.12, cy + s * 0.02,
      cx - s * 0.14, cy - s * 0.04,
      cx - s * 0.21, cy - s * 0.12,
    );
    ctx!.bezierCurveTo(
      cx - s * 0.24, cy - s * 0.12,
      cx - s * 0.25, cy - s * 0.18,
      cx - s * 0.26, cy - s * 0.28,
    );
    ctx!.bezierCurveTo(
      cx - s * 0.27, cy - s * 0.50,
      cx - s * 0.10, cy - s * 0.62,
      cx, cy - s * 0.62,
    );

    ctx!.closePath();
  };

  // ── Simple scroll (spiral + pegbox) ──
  const drawScroll = (cx: number, cy: number, s: number, isDark: boolean) => {
    const scrollCY = cy - s * 0.75;
    const sw = s * 0.065;

    // Pegbox
    ctx!.fillStyle = isDark ? '#120800' : '#1a0a05';
    ctx!.beginPath();
    ctx!.roundRect(cx - sw, cy - s * 0.65, sw * 2, s * 0.09, s * 0.003);
    ctx!.fill();

    // Scroll spiral
    ctx!.save();
    ctx!.translate(cx, scrollCY);
    ctx!.strokeStyle = isDark ? '#7a5030' : '#5c3317';
    ctx!.lineWidth = Math.max(2, s * 0.015);
    ctx!.lineCap = 'round';
    ctx!.beginPath();
    const turns = 3;
    const steps = 40;
    const maxR = sw * 1.6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns + Math.PI * 0.4;
      const r = maxR * (0.12 + 0.88 * (1 - t));
      const px = Math.cos(angle) * r;
      const py = -Math.sin(angle) * r * 0.65;
      if (i === 0) ctx!.moveTo(px, py);
      else ctx!.lineTo(px, py);
    }
    ctx!.stroke();
    ctx!.restore();

    // Tuning pegs — two small dots each side
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 2; i++) {
        const py = scrollCY + s * 0.02 + i * s * 0.035;
        ctx!.fillStyle = isDark ? '#120800' : '#1a0a05';
        ctx!.beginPath();
        ctx!.arc(cx + side * sw * 0.8, py, s * 0.006, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
  };

  // ── Stylized f-holes ──
  const drawFHole = (x: number, y: number, rot: number, scale: number) => {
    ctx!.save();
    ctx!.translate(x, y);
    ctx!.rotate(rot);
    ctx!.scale(scale, scale);
    ctx!.strokeStyle = '#0d0500';
    ctx!.lineWidth = 2.5;
    ctx!.lineCap = 'round';

    // Simple S-curve with terminal circles
    ctx!.beginPath();
    ctx!.arc(0, -14, 3.5, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.beginPath();
    ctx!.arc(0, 14, 4, 0, Math.PI * 2);
    ctx!.fill();

    ctx!.beginPath();
    ctx!.moveTo(3, -11);
    ctx!.bezierCurveTo(-4, -6, 6, 2, 0, 8);
    ctx!.bezierCurveTo(-2, 10, -4, 12, -2, 14);
    ctx!.stroke();

    ctx!.restore();
  };

  // ── Fingerboard ──
  const drawFingerboard = (cx: number, cy: number, s: number) => {
    const top = cy - s * 0.56;
    const bot = cy + s * 0.24;
    const tw = s * 0.022;
    const bw = s * 0.036;

    ctx!.fillStyle = '#0d0500';
    ctx!.beginPath();
    ctx!.moveTo(cx - tw, top);
    ctx!.lineTo(cx + tw, top);
    ctx!.lineTo(cx + bw, bot);
    ctx!.lineTo(cx - bw, bot);
    ctx!.closePath();
    ctx!.fill();
  };

  // ── Bridge ──
  const drawBridge = (cx: number, cy: number, s: number, isDark: boolean) => {
    const bx = cx;
    const by = cy + s * 0.05;
    const bw = s * 0.085;
    const bh = s * 0.012;

    ctx!.fillStyle = isDark ? '#c4a060' : '#d4a865';
    ctx!.beginPath();
    ctx!.moveTo(bx - bw, by);
    ctx!.lineTo(bx - bw, by + bh);
    ctx!.quadraticCurveTo(bx - bw * 0.5, by - bh * 0.5, bx - bw * 0.15, by - bh * 0.3);
    ctx!.quadraticCurveTo(bx, by - bh * 0.5, bx + bw * 0.15, by - bh * 0.3);
    ctx!.quadraticCurveTo(bx + bw * 0.5, by - bh * 0.5, bx + bw, by + bh);
    ctx!.lineTo(bx + bw, by);
    ctx!.closePath();
    ctx!.fill();
    ctx!.strokeStyle = isDark ? '#6b4420' : '#8b6914';
    ctx!.lineWidth = 0.5;
    ctx!.stroke();
  };

  // ── Tailpiece ──
  const drawTailpiece = (cx: number, cy: number, s: number, isDark: boolean) => {
    const tx = cx;
    const ty = cy + s * 0.40;
    const tw = s * 0.055;
    const th = s * 0.10;

    ctx!.fillStyle = '#0d0500';
    ctx!.beginPath();
    ctx!.moveTo(tx - tw, ty - th);
    ctx!.lineTo(tx + tw, ty - th);
    ctx!.lineTo(tx + tw * 0.45, ty + th);
    ctx!.lineTo(tx - tw * 0.45, ty + th);
    ctx!.closePath();
    ctx!.fill();

    // Fine tuner highlights (tiny dots)
    ctx!.fillStyle = isDark ? '#a09078' : '#c0b098';
    for (let i = 0; i < 4; i++) {
      ctx!.beginPath();
      ctx!.arc(tx - tw * 0.5 + i * tw * 0.35, ty - th * 0.55, s * 0.004, 0, Math.PI * 2);
      ctx!.fill();
    }
  };

  const triggerVibration = () => {
    amplitudes.value = amplitudes.value.map(() => 8 + Math.random() * 5);
    decays.value = decays.value.map(() => 0.91 + Math.random() * 0.05);
  };

  // ──────────────────────────────────────────
  //  MAIN DRAW
  // ──────────────────────────────────────────
  const draw = (canvas: HTMLCanvasElement) => {
    if (!ctx) ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const isDark = resolvedTheme.value === 'dark';
    time += 0.016;

    ctx.clearRect(0, 0, w, h);

    // ── Background gradient ──
    const bg = ctx.createRadialGradient(w * 0.38, h * 0.48, 0, w * 0.38, h * 0.48, Math.max(w, h) * 0.7);
    if (isDark) {
      bg.addColorStop(0, '#140e08');
      bg.addColorStop(0.5, '#0b0704');
      bg.addColorStop(1, '#050302');
    } else {
      bg.addColorStop(0, '#faf6f0');
      bg.addColorStop(0.6, '#f0e8d8');
      bg.addColorStop(1, '#e0d4c0');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // ── Floor shadow ──
    {
      const sh = ctx.createRadialGradient(w * 0.38, h * 0.78, 0, w * 0.38, h * 0.78, Math.min(w, h) * 0.32);
      sh.addColorStop(0, 'rgba(0,0,0,0.18)');
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(w * 0.38, h * 0.80, Math.min(w, h) * 0.22, Math.min(w, h) * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Violin position & scale ──
    const vx = w * 0.38;
    const vy = h * 0.48;
    const vs = Math.min(w, h) * 0.46;

    // ── Body fill ──
    const bodyGrad = ctx.createLinearGradient(vx - vs * 0.3, vy - vs * 0.3, vx + vs * 0.3, vy + vs * 0.3);
    if (isDark) {
      bodyGrad.addColorStop(0, '#c08040');
      bodyGrad.addColorStop(0.4, '#a86028');
      bodyGrad.addColorStop(0.8, '#7a3a10');
      bodyGrad.addColorStop(1, '#5a2008');
    } else {
      bodyGrad.addColorStop(0, '#e0b860');
      bodyGrad.addColorStop(0.35, '#c89040');
      bodyGrad.addColorStop(0.7, '#a06820');
      bodyGrad.addColorStop(1, '#6a3a10');
    }
    bodyPath(vx, vy, vs);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Subtle light highlight on upper bout
    bodyPath(vx, vy, vs);
    ctx.save();
    ctx.clip();
    const hl = ctx.createRadialGradient(
      vx - vs * 0.08, vy - vs * 0.20, vs * 0.05,
      vx, vy, vs * 0.65,
    );
    hl.addColorStop(0, 'rgba(255,245,220,0.18)');
    hl.addColorStop(0.5, 'rgba(255,240,210,0.04)');
    hl.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = hl;
    ctx.fillRect(vx - vs * 0.4, vy - vs * 0.8, vs * 0.8, vs * 1.6);
    ctx.restore();

    // ── Body outline ──
    bodyPath(vx, vy, vs);
    ctx.strokeStyle = isDark ? '#3a2010' : '#3a1a08';
    ctx.lineWidth = Math.max(2, vs * 0.012);
    ctx.stroke();

    // ── F-holes ──
    const fh = vs * 0.009;
    drawFHole(vx - vs * 0.10, vy - vs * 0.02, -0.10, fh);
    drawFHole(vx + vs * 0.10, vy - vs * 0.02, 0.10, fh);
    drawFHole(vx - vs * 0.09, vy + vs * 0.20, -0.06, fh);
    drawFHole(vx + vs * 0.09, vy + vs * 0.20, 0.06, fh);

    // ── Fingerboard, Tailpiece, Bridge ──
    drawTailpiece(vx, vy, vs, isDark);
    drawFingerboard(vx, vy, vs);
    drawBridge(vx, vy, vs, isDark);

    // ── Scroll ──
    drawScroll(vx, vy, vs, isDark);

    // ── Strings ──
    const strColors = isDark
      ? ['#e0d0a8', '#d4c498', '#c8b888', '#bfae78']
      : ['#a09070', '#8b7a5a', '#7a6a4a', '#6a5a3a'];

    const strX = [
      vx - vs * 0.055,
      vx - vs * 0.018,
      vx + vs * 0.018,
      vx + vs * 0.055,
    ];
    const strTop = vy - vs * 0.62;
    const strBot = vy + vs * 0.44;

    strX.forEach((sx, i) => {
      const amp = amplitudes.value[i];

      if (amp > 0.3) {
        ctx!.strokeStyle = strColors[i];
        ctx!.lineWidth = Math.max(0.5, vs * 0.003 + i * 0.2);
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        const segs = 50;
        for (let j = 0; j <= segs; j++) {
          const sy = strTop + (strBot - strTop) * (j / segs);
          const p = j / segs;
          const damp = Math.sin(p * Math.PI);
          const wave = Math.sin(p * Math.PI * 6 + time * 22 + i) * amp * damp * 0.5;
          if (j === 0) ctx!.moveTo(sx, sy + wave);
          else ctx!.lineTo(sx, sy + wave);
        }
        amplitudes.value[i] *= decays.value[i];
        ctx!.stroke();
      } else {
        ctx!.strokeStyle = strColors[i];
        ctx!.lineWidth = Math.max(0.5, vs * 0.003 + i * 0.15);
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        ctx!.moveTo(sx, strTop);
        ctx!.lineTo(sx, strBot);
        ctx!.stroke();
        amplitudes.value[i] = 0;
      }
    });

    // ── Bow (when playing) ──
    if (isPlaying.value) {
      const beatMs = 60000 / bpm.value;
      const progress = (Date.now() % beatMs) / beatMs;
      const bowY = vy - vs * 0.35 + progress * vs * 0.70;
      const bowX = vx + vs * 0.24;

      const stickTop = bowY - vs * 0.30;
      const stickBot = bowY + vs * 0.30;

      // Bow stick
      ctx!.strokeStyle = '#b87333';
      ctx!.lineWidth = Math.max(2, vs * 0.012);
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(bowX, stickTop);
      ctx!.quadraticCurveTo(bowX - vs * 0.03, (stickTop + stickBot) / 2, bowX, stickBot);
      ctx!.stroke();

      // Bow hair
      ctx!.strokeStyle = 'rgba(240,235,225,0.6)';
      ctx!.lineWidth = Math.max(1.5, vs * 0.007);
      ctx!.beginPath();
      ctx!.moveTo(bowX - 2, stickTop + vs * 0.01);
      ctx!.quadraticCurveTo(bowX - vs * 0.03 - 2, (stickTop + stickBot) / 2, bowX - 2, stickBot - vs * 0.01);
      ctx!.stroke();

      // Frog
      ctx!.save();
      ctx!.translate(bowX, stickTop);
      ctx!.fillStyle = '#0d0500';
      ctx!.fillRect(-vs * 0.012, -vs * 0.05, vs * 0.024, vs * 0.05);
      ctx!.fillStyle = 'rgba(220,210,190,0.5)';
      ctx!.beginPath();
      ctx!.arc(0, -vs * 0.025, vs * 0.003, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      // Bow tip
      ctx!.save();
      ctx!.translate(bowX, stickBot);
      ctx!.fillStyle = '#e8e0d0';
      ctx!.beginPath();
      ctx!.moveTo(-vs * 0.008, 0);
      ctx!.lineTo(vs * 0.008, 0);
      ctx!.lineTo(0, vs * 0.025);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();

      // Particle sparkles at contact point
      const cx2 = bowX - 2;
      const cy2 = bowY;
      for (let p = 0; p < 4; p++) {
        const a = (time * 3 + p * 1.5) % (Math.PI * 2);
        const d = vs * 0.015 + Math.sin(time * 6 + p) * vs * 0.015;
        const px = cx2 + Math.cos(a) * d;
        const py = cy2 + Math.sin(a) * d;
        const alpha = 0.12 + Math.sin(time * 5 + p * 2) * 0.08;
        const pg = ctx!.createRadialGradient(px, py, 0, px, py, vs * 0.018);
        pg.addColorStop(0, `rgba(255,220,150,${alpha})`);
        pg.addColorStop(1, 'rgba(255,220,150,0)');
        ctx!.fillStyle = pg;
        ctx!.fillRect(px - vs * 0.018, py - vs * 0.018, vs * 0.036, vs * 0.036);
      }
    }

    // ── Beat detection ──
    if (isPlaying.value && currentBeat.value !== lastBeat) {
      lastBeat = currentBeat.value;
      triggerVibration();
    }

    animationId = requestAnimationFrame(() => draw(canvas));
  };

  // ──────────────────────────────────────────
  //  LIFECYCLE
  // ──────────────────────────────────────────
  let cleanupResize: (() => void) | null = null;

  const startAnimation = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ro = new ResizeObserver(() => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);

    draw(canvas);

    return () => ro.disconnect();
  };

  onMounted(() => {
    cleanupResize = startAnimation() ?? null;
  });

  onUnmounted(() => {
    if (animationId !== null) cancelAnimationFrame(animationId);
    if (cleanupResize) cleanupResize();
  });

  // Re-draw on theme change — cancel old loop first to avoid duplicates
  watch(resolvedTheme, () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    const canvas = canvasRef.value;
    if (canvas) draw(canvas);
  });

  return { amplitudes, triggerVibration };
}
