/**
 * MONO Interactive 2D Physics Playground (Calibrated & Smooth Engine)
 * Realistic gravity, stable sub-stepped collisions, drag & toss,
 * MÖNO tokens, pencil-sketched contours, and anime pill tags.
 */

class MonoPhysicsPlayground {
  constructor(containerId, canvasId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(canvasId);
    if (!this.container || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.bodies = [];
    this.gravity = 0.32;
    this.friction = 0.985;
    this.restitution = 0.58; // gentle, cozy bounce
    this.isZeroG = false;
    this.hasTriggeredOnScroll = false;
    
    // Drag & Toss state
    this.draggedBody = null;
    this.dragOffset = { x: 0, y: 0 };
    this.prevMouse = { x: 0, y: 0, time: 0 };
    this.mouseVelocity = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };
    this.isMouseDown = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    this.setupScrollTrigger();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height || 420;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // Keep existing bodies inside bounds
    this.bodies.forEach(b => {
      b.x = Math.max(b.radius, Math.min(this.width - b.radius, b.x));
      b.y = Math.max(b.radius, Math.min(this.height - b.radius, b.y));
    });
  }

  setupScrollTrigger() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasTriggeredOnScroll) {
          this.hasTriggeredOnScroll = true;
          this.spawnInitialBatch();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(this.container);
  }

  spawnInitialBatch() {
    this.bodies = [];

    const badges = [
      { text: 'EVANGELION', color: '#1D00FF', textColor: '#FFFFFF' },
      { text: 'FRIEREN ★', color: '#FF5500', textColor: '#FFFFFF' },
      { text: 'MASTERPIECE', color: '#FAF7F2', textColor: '#1D00FF' },
      { text: '0.5 – 5.0 ★', color: '#00D2FF', textColor: '#0E0E12' },
      { text: '1995 · ANIME', color: '#0E0E12', textColor: '#FAF7F2' },
      { text: 'VIOLET', color: '#1D00FF', textColor: '#FF5500' },
    ];

    // Staggered smooth drop
    badges.forEach((b, i) => {
      setTimeout(() => {
        const spreadX = (this.width * 0.2) + ((i / badges.length) * (this.width * 0.6));
        this.addPill(spreadX, -30, b.text, b.color, b.textColor);
      }, i * 110);
    });

    const ballTypes = [
      { type: 'mono_cobalt', radius: 30 },
      { type: 'mono_orange', radius: 34 },
      { type: 'mono_cream', radius: 26 },
      { type: 'sketch_flower', radius: 32 },
      { type: 'mono_eyes', radius: 28 },
      { type: 'mono_cobalt', radius: 36 },
      { type: 'mono_orange', radius: 30 },
      { type: 'sketch_star', radius: 28 },
      { type: 'mono_eyes', radius: 32 },
      { type: 'mono_cobalt', radius: 28 },
      { type: 'mono_orange', radius: 36 }
    ];

    ballTypes.forEach((bt, idx) => {
      setTimeout(() => {
        const spreadX = (this.width * 0.15) + (Math.random() * (this.width * 0.7));
        this.addBall(spreadX, -40, bt.radius, bt.type);
      }, (badges.length * 110) + (idx * 90));
    });
  }

  addBall(x, y, radius, type) {
    this.bodies.push({
      kind: 'circle',
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 1.5 + 1.2,
      radius,
      mass: radius * 0.08,
      angle: (Math.random() - 0.5) * 0.5,
      angularVelocity: (Math.random() - 0.5) * 0.03,
      type
    });
  }

  addPill(x, y, text, bg, textColor) {
    const width = text.length * 10.5 + 28;
    const height = 32;
    this.bodies.push({
      kind: 'pill',
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 1.5 + 1.2,
      width,
      height,
      radius: Math.max(width, height) / 2.2,
      mass: 3.8,
      angle: (Math.random() - 0.5) * 0.2,
      angularVelocity: (Math.random() - 0.5) * 0.02,
      text,
      bg,
      textColor
    });
  }

  spawnMore(count = 5) {
    const types = ['mono_cobalt', 'mono_orange', 'mono_cream', 'sketch_flower', 'mono_eyes'];
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        const r = Math.floor(Math.random() * 10) + 26;
        const spawnX = (this.width * 0.2) + (Math.random() * (this.width * 0.6));
        this.addBall(spawnX, -30, r, type);
      }, i * 100);
    }
  }

  toggleZeroG() {
    this.isZeroG = !this.isZeroG;
    if (this.isZeroG) {
      this.bodies.forEach(b => {
        b.vy = (Math.random() - 0.5) * 3;
        b.vx = (Math.random() - 0.5) * 3;
      });
    }
    return this.isZeroG;
  }

  clear() {
    this.bodies = [];
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onStart = (e) => {
      const pos = getPos(e);
      this.isMouseDown = true;
      this.mousePos = pos;
      this.prevMouse = { x: pos.x, y: pos.y, time: performance.now() };
      this.mouseVelocity = { x: 0, y: 0 };

      for (let i = this.bodies.length - 1; i >= 0; i--) {
        const b = this.bodies[i];
        const dist = Math.hypot(pos.x - b.x, pos.y - b.y);
        if (dist <= b.radius * 1.15) {
          this.draggedBody = b;
          this.dragOffset = { x: b.x - pos.x, y: b.y - pos.y };
          this.bodies.splice(i, 1);
          this.bodies.push(b);
          break;
        }
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      const now = performance.now();
      const dt = Math.max(1, now - this.prevMouse.time);
      
      this.mouseVelocity = {
        x: Math.max(-12, Math.min(12, (pos.x - this.prevMouse.x) / (dt / 16.6))),
        y: Math.max(-12, Math.min(12, (pos.y - this.prevMouse.y) / (dt / 16.6)))
      };
      
      this.prevMouse = { x: pos.x, y: pos.y, time: now };
      this.mousePos = pos;

      if (this.draggedBody) {
        this.draggedBody.x = pos.x + this.dragOffset.x;
        this.draggedBody.y = pos.y + this.dragOffset.y;
        this.draggedBody.vx = this.mouseVelocity.x * 0.75;
        this.draggedBody.vy = this.mouseVelocity.y * 0.75;
      }
    };

    const onEnd = () => {
      if (this.draggedBody) {
        this.draggedBody.vx = Math.max(-10, Math.min(10, this.mouseVelocity.x * 0.9));
        this.draggedBody.vy = Math.max(-10, Math.min(10, this.mouseVelocity.y * 0.9));
        this.draggedBody = null;
      }
      this.isMouseDown = false;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  updatePhysics() {
    const subSteps = 3;
    const currentGravity = (this.isZeroG ? 0 : this.gravity) / subSteps;
    const floor = this.height;
    const right = this.width;

    for (let step = 0; step < subSteps; step++) {
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];

        if (b === this.draggedBody) {
          b.angularVelocity *= 0.95;
          b.angle += b.angularVelocity;
          continue;
        }

        // Apply Gravity
        b.vy += currentGravity;
        
        // Speed cap to prevent explosion / glitching
        const speed = Math.hypot(b.vx, b.vy);
        const maxSpeed = 11;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        // Friction
        b.vx *= Math.pow(this.friction, 1 / subSteps);
        b.vy *= Math.pow(this.friction, 1 / subSteps);
        b.angularVelocity *= 0.98;

        // Position integration
        b.x += b.vx / subSteps;
        b.y += b.vy / subSteps;
        b.angle += b.angularVelocity / subSteps;

        // Wall collisions
        if (b.y + b.radius > floor) {
          b.y = floor - b.radius;
          b.vy = -Math.abs(b.vy) * this.restitution;
          b.vx *= 0.94;
          b.angularVelocity += b.vx * 0.003;
        }
        if (b.y - b.radius < 0 && this.isZeroG) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy) * this.restitution;
        }
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * this.restitution;
        }
        if (b.x + b.radius > right) {
          b.x = right - b.radius;
          b.vx = -Math.abs(b.vx) * this.restitution;
        }
      }

      // Inter-body collisions
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          const b1 = this.bodies[i];
          const b2 = this.bodies[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;

            if (b1 !== this.draggedBody) {
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
            }
            if (b2 !== this.draggedBody) {
              b2.x += nx * overlap;
              b2.y += ny * overlap;
            }

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);
            const e = this.restitution;

            if (b1 !== this.draggedBody) {
              b1.vx -= p * b2.mass * nx * (1 + e);
              b1.vy -= p * b2.mass * ny * (1 + e);
            }
            if (b2 !== this.draggedBody) {
              b2.vx += p * b1.mass * nx * (1 + e);
              b2.vy += p * b1.mass * ny * (1 + e);
            }
          }
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      this.ctx.save();
      this.ctx.translate(b.x, b.y);
      this.ctx.rotate(b.angle);

      if (b.kind === 'pill') {
        this.drawPill(b);
      } else {
        this.drawBall(b);
      }

      this.ctx.restore();
    }
  }

  drawBall(b) {
    const r = b.radius;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);

    if (b.type === 'mono_cobalt') {
      ctx.fillStyle = '#1D00FF';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.stroke();

      ctx.fillStyle = '#FF5500';
      ctx.font = `800 ${Math.floor(r * 0.85)}px Satoshi, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);
    } else if (b.type === 'mono_orange') {
      ctx.fillStyle = '#FF5500';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.stroke();

      ctx.fillStyle = '#1D00FF';
      ctx.font = `800 ${Math.floor(r * 0.85)}px Satoshi, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);
    } else if (b.type === 'mono_cream') {
      ctx.fillStyle = '#FAF7F2';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1D00FF';
      ctx.stroke();

      ctx.fillStyle = '#1D00FF';
      ctx.font = `800 ${Math.floor(r * 0.85)}px Satoshi, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);
    } else if (b.type === 'mono_eyes') {
      // Soft gradient ball with the cute orange MÖNO umlaut eyes
      ctx.fillStyle = '#1D00FF';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.stroke();

      // Two orange eyes
      const eyeR = r * 0.2;
      const eyeGap = r * 0.28;
      ctx.beginPath();
      ctx.arc(-eyeGap, -1, eyeR, 0, Math.PI * 2);
      ctx.arc(eyeGap, -1, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5500';
      ctx.fill();

      // White inner highlights
      ctx.beginPath();
      ctx.arc(-eyeGap - 1, -2, eyeR * 0.35, 0, Math.PI * 2);
      ctx.arc(eyeGap - 1, -2, eyeR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    } else if (b.type === 'sketch_flower') {
      // Hand-drawn botanical contour in pencil style
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1D00FF';
      ctx.stroke();

      // Flower sketch petals
      ctx.strokeStyle = '#1D00FF';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const theta = (p / 5) * Math.PI * 2;
        const px = Math.cos(theta) * (r * 0.55);
        const py = Math.sin(theta) * (r * 0.55);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(px * 1.4, py * 1.4, px, py);
      }
      ctx.stroke();
    } else if (b.type === 'sketch_star') {
      ctx.fillStyle = '#FEE75C';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();

      ctx.fillStyle = '#0E0E12';
      ctx.font = `800 ${Math.floor(r * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', 0, 1);
    }
  }

  drawPill(b) {
    const w = b.width;
    const h = b.height;
    const r = h / 2;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, r);
    ctx.fillStyle = b.bg;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.stroke();

    ctx.fillStyle = b.textColor;
    ctx.font = '700 12px Satoshi, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(b.text, 0, 1);
  }

  loop() {
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

window.MonoPhysicsPlayground = MonoPhysicsPlayground;
