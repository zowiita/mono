const fs = require('fs');

const code = \class MonoPhysicsPlayground {
    constructor(containerId, canvasId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.getElementById(canvasId);
        if (!this.container || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.tokens = [];
        this.width = 0;
        this.height = 0;

        this.initTokens();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    initTokens() {
        const types = [
            { t: 'circle', color: '#1B2026', border: 'rgba(255,255,255,0.1)', text: 'Möno', size: 40 },
            { t: 'circle', color: '#FF5500', border: 'rgba(255,85,0,0.8)', text: 'Rate', size: 30 },
            { t: 'pill', color: '#222224', border: '#4A35EE', text: 'Anime', width: 90, height: 40 },
            { t: 'pill', color: '#181D22', border: 'rgba(255,255,255,0.08)', text: 'Evangelion', width: 110, height: 40 },
            { t: 'circle', color: '#1B2026', border: 'rgba(255,255,255,0.08)', text: 'Watch', size: 35 },
            { t: 'pill', color: '#FF5500', border: '#FF5500', text: '5.0', width: 70, height: 35 }
        ];

        for (let i = 0; i < 20; i++) {
            const base = types[i % types.length];
            this.tokens.push({
                ...base,
                x: Math.random() * 800 + 100,
                y: Math.random() * 300 + 100,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                angle: Math.random() * Math.PI * 2,
                va: (Math.random() - 0.5) * 0.01
            });
        }
    }

    update() {
        for (let t of this.tokens) {
            t.x += t.vx;
            t.y += t.vy;
            t.angle += t.va;

            const r = t.size || (t.width / 2);
            if (t.x < r) { t.x = r; t.vx *= -1; }
            if (t.x > this.width - r) { t.x = this.width - r; t.vx *= -1; }
            if (t.y < r) { t.y = r; t.vy *= -1; }
            if (t.y > this.height - r) { t.y = this.height - r; t.vy *= -1; }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for (let t of this.tokens) {
            this.ctx.save();
            this.ctx.translate(t.x, t.y);
            this.ctx.rotate(t.angle);

            this.ctx.fillStyle = t.color;
            this.ctx.strokeStyle = t.border;
            this.ctx.lineWidth = 2;

            if (t.t === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, t.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else if (t.t === 'pill') {
                const w = t.width, h = t.height, r = h / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(-w/2 + r, -h/2);
                this.ctx.lineTo(w/2 - r, -h/2);
                this.ctx.arcTo(w/2, -h/2, w/2, h/2, r);
                this.ctx.lineTo(-w/2 + r, h/2);
                this.ctx.arcTo(-w/2, h/2, -w/2, -h/2, r);
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.ctx.fillStyle = (t.color === '#FF5500') ? '#000' : '#FFF';
            this.ctx.font = '600 13px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(t.text, 0, 0);

            this.ctx.restore();
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}
window.MonoPhysicsPlayground = MonoPhysicsPlayground;
\;

fs.writeFileSync('public/js/mono-physics.js', code);
console.log('Fixed mono-physics');
