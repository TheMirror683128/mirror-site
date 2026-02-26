window.PRF_VISUALIZER = (() => {
  let animationId = null;
  let isRunning = false;

  const Particle = class {
    constructor(x, y, type = 'potential') {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.type = type;
      this.age = 0;
      this.decay = Math.random() * 0.02;
      this.trail = []; // Track motion for trails
      this.trailMaxLen = 6;
    }
    update(attractors, width, height) {
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
      
      attractors.forEach(a => {
        const dx = a.x - this.x;
        const dy = a.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = a.strength / (dist * dist);
        this.vx += (dx / dist) * force * 0.1;
        this.vy += (dy / dist) * force * 0.1;
      });

      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;

      // Add to trail
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailMaxLen) this.trail.shift();

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      this.age += this.decay;
    }
    draw(ctx) {
      const alpha = Math.max(0, 1 - this.age);
      let color, size;
      switch(this.type) {
        case 'collapsed': color = `rgba(0,255,255,${alpha*0.8})`; size = 4; break;
        case 'fragment': color = `rgba(255,0,0,${alpha*0.6})`; size = 3; break;
        default: color = `rgba(0,255,0,${alpha*0.3})`; size = 2;
      }
      
      // Draw trail (motion blur effect)
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const trailAlpha = (i / this.trail.length) * alpha * 0.4;
          ctx.strokeStyle = color.replace(/[\d.]+\)/, `${trailAlpha})`);
          ctx.lineWidth = size * 0.6;
          ctx.beginPath();
          ctx.moveTo(this.trail[i].x, this.trail[i].y);
          ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
          ctx.stroke();
        }
      }
      
      // Draw particle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const Attractor = class {
    constructor(x, y, strength, label = '') {
      this.x = x;
      this.y = y;
      this.strength = strength;
      this.label = label;
      this.radius = Math.sqrt(strength) * 10;
    }
    draw(ctx) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      gradient.addColorStop(0, 'rgba(0,255,255,0.3)');
      gradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer ring glow
      ctx.strokeStyle = 'rgba(0,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Core point
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      if (this.label) {
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 13px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // Draw label above the attractor with subtle background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const labelWidth = ctx.measureText(this.label).width;
        ctx.fillRect(this.x - labelWidth/2 - 4, this.y - 18, labelWidth + 8, 14);
        ctx.fillStyle = '#0ff';
        ctx.fillText(this.label, this.x, this.y - 6);
        ctx.textAlign = 'left';
      }
    }
  };

  const modes = {
    field: {
      init(state) {
        state.particles = [];
        // Add central attractor to show base density point
        state.attractors = [new Attractor(state.w / 2, state.h / 2, 1.5, 'Being')];
        for (let i = 0; i < 250; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      update(state) {
        state.particles.forEach(p => p.update(state.attractors, state.w, state.h));
        state.particles = state.particles.filter(p => p.age < 1);
        if (Math.random() < 0.25) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      desc: 'Base state: Probability Field around Being. Particles gravitate toward structure.'
    },
    density: {
      init(state) {
        state.particles = [];
        // Start with one attractor to show the concept
        state.attractors = [new Attractor(state.w / 2, state.h / 2, 2.5, 'Density')];
        for (let i = 0; i < 350; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      update(state) {
        state.particles.forEach(p => {
          p.update(state.attractors, state.w, state.h);
          state.attractors.forEach(a => {
            if (Math.hypot(p.x - a.x, p.y - a.y) < a.radius * 0.3) p.type = 'collapsed';
          });
        });
        state.particles = state.particles.filter(p => p.age < 1);
        if (Math.random() < 0.2) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      desc: 'Click to create more density points. Potential collapses around mass.'
    },
    fragmentation: {
      init(state) {
        state.particles = [];
        state.attractors = [
          new Attractor(state.w * 0.3, state.h * 0.5, 3.2, 'Narrative-A'),
          new Attractor(state.w * 0.7, state.h * 0.5, 3.2, 'Narrative-B')
        ];
        // Start more particles to show the split clearly
        for (let i = 0; i < 400; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      update(state) {
        state.particles.forEach(p => {
          p.update(state.attractors, state.w, state.h);
          const d0 = Math.hypot(p.x - state.attractors[0].x, p.y - state.attractors[0].y);
          const d1 = Math.hypot(p.x - state.attractors[1].x, p.y - state.attractors[1].y);
          
          // Particles collapse into nearest attractor
          if (d0 < state.attractors[0].radius * 0.3) {
            p.type = 'collapsed';
          } else if (d1 < state.attractors[1].radius * 0.3) {
            p.type = 'collapsed';
          }
          // Particles stuck between both attractors become fragments
          else if (d0 < state.attractors[0].radius * 1.2 && d1 < state.attractors[1].radius * 1.2) {
            p.type = 'fragment';
          }
        });
        state.particles = state.particles.filter(p => p.age < 1);
        if (Math.random() < 0.25) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      desc: 'Two incompatible basins. Potential splits; mid-space becomes waste (red fragments).'
    },
    delay: {
      init(state) {
        state.particles = [];
        state.attractors = [];
        state.tech = 1;
        state.ontology = 1;
        for (let i = 0; i < 200; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      update(state) {
        state.tech *= 1.05;
        state.ontology += 0.15;
        const gap = Math.max(0, state.tech - state.ontology);
        state.particles.forEach(p => {
          p.vx += (Math.random() - 0.5) * (gap * 0.05);
          p.vy += (Math.random() - 0.5) * (gap * 0.05);
          p.update(state.attractors, state.w, state.h);
        });
        state.particles = state.particles.filter(p => p.age < 1);
        if (Math.random() < 0.3) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      desc: 'Tech grows exponentially, ontology linearly. The gap = instability.'
    },
    amplification: {
      init(state) {
        state.particles = [];
        state.attractors = [new Attractor(state.w / 2, state.h / 2, 2, 'Signal')];
        state.amp = 1;
        for (let i = 0; i < 300; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      update(state) {
        state.amp *= 1.02;
        state.attractors[0].strength = 2 + state.amp * 0.5;
        state.attractors[0].radius = Math.sqrt(state.attractors[0].strength) * 10;
        state.particles.forEach(p => {
          p.update(state.attractors, state.w, state.h);
          if (Math.hypot(p.x - state.attractors[0].x, p.y - state.attractors[0].y) < state.attractors[0].radius * 0.3) {
            p.type = 'collapsed';
          }
        });
        state.particles = state.particles.filter(p => p.age < 1);
        if (Math.random() < 0.2) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h));
        }
      },
      desc: 'Language → Internet → AI. Each era amplifies the previous.'
    },
    collapse: {
      init(state) {
        state.particles = [];
        state.attractors = [new Attractor(state.w / 2, state.h / 2, 5, 'System')];
        state.entropy = 0.2;
        state.frag = 0;
        state.delay = 0;
        for (let i = 0; i < 400; i++) {
          state.particles.push(new Particle(Math.random() * state.w, Math.random() * state.h, 'collapsed'));
        }
      },
      update(state) {
        state.entropy *= 1.01;
        state.delay = (state.delay || 0) * 1.02 + 0.1;
        state.frag = Math.min(1, (state.frag || 0) + 0.002);
        state.particles.forEach(p => {
          p.vx += (Math.random() - 0.5) * state.entropy;
          p.vy += (Math.random() - 0.5) * state.entropy;
          p.decay *= 1.001;
          p.update(state.attractors, state.w, state.h);
          if (Math.hypot(p.x - state.attractors[0].x, p.y - state.attractors[0].y) > state.attractors[0].radius * 0.8) {
            p.type = 'fragment';
          }
        });
        state.particles = state.particles.filter(p => p.age < 1.5);
      },
      desc: 'Full collapse: entropy, fragmentation, and delay running together.'
    }
  };

  return {
    open() {
      if (isRunning) return;
      isRunning = true;

      const modal = document.getElementById('visualizer-modal');
      const canvas = document.getElementById('prf-canvas');
      const info = document.getElementById('prf-info');
      const stats = document.getElementById('prf-stats');

      if (!modal || !canvas) {
        console.error('Modal or canvas not found');
        return;
      }

      modal.classList.add('show');

      const ctx = canvas.getContext('2d');
      const state = {
        mode: 'field',
        particles: [],
        attractors: [],
        w: 800,
        h: 500,
        time: 0,
        paused: false,
        speed: 1.0,
        gridCanvas: null,
        gridCtx: null
      };

      // Pre-render grid to offscreen canvas
      const createGridCanvas = () => {
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = state.w;
        gridCanvas.height = state.h;
        const gridCtx = gridCanvas.getContext('2d');
        
        // Clear with transparency
        gridCtx.clearRect(0, 0, state.w, state.h);
        
        // Draw grid lines very subtly to avoid flickering
        gridCtx.strokeStyle = 'rgba(0,255,0,0.03)';
        gridCtx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= state.w; i += 60) {
          gridCtx.beginPath();
          gridCtx.moveTo(i, 0);
          gridCtx.lineTo(i, state.h);
          gridCtx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= state.h; i += 60) {
          gridCtx.beginPath();
          gridCtx.moveTo(0, i);
          gridCtx.lineTo(state.w, i);
          gridCtx.stroke();
        }
        
        return gridCanvas;
      };
      state.gridCanvas = createGridCanvas();

      const resizeCanvas = () => {
        const container = document.getElementById('prf-canvas-container');
        const w = Math.max(400, Math.min(container.clientWidth - 60, 1200));
        const h = Math.max(300, Math.min(container.clientHeight - 120, 700));
        
        state.w = w;
        state.h = h;
        
        // Set internal resolution (drawing surface)
        canvas.width = w;
        canvas.height = h;
        
        // Set CSS display size
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        // Recreate grid canvas
        state.gridCanvas = createGridCanvas();
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      modes[state.mode].init(state);

      const switchMode = (m) => {
        state.mode = m;
        state.particles = [];
        state.attractors = [];
        modes[m].init(state);
        if (info) info.textContent = modes[m].desc;
      };

      const updateStats = () => {
        if (!stats) return;
        const modeStats = {
          field: `particles: ${state.particles.length}`,
          density: `density: ${((state.particles.filter(p => p.type === 'collapsed').length / state.particles.length) * 100).toFixed(1)}%`,
          fragmentation: `particles: ${state.particles.length}`,
          delay: `tech: ${(state.tech || 0).toFixed(1)} | ontology: ${(state.ontology || 0).toFixed(1)}`,
          amplification: `amp: ${(state.amp || 1).toFixed(2)}x`,
          collapse: `entropy: ${(state.entropy || 0).toFixed(2)}`
        };
        stats.textContent = modeStats[state.mode] || '';
      };

      const animate = () => {
        // Clear background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, state.w, state.h);

        // Draw grid from pre-rendered canvas (only if it exists and matches size)
        if (state.gridCanvas && state.gridCanvas.width === state.w && state.gridCanvas.height === state.h) {
          ctx.drawImage(state.gridCanvas, 0, 0);
        }

        // Update if not paused
        if (!state.paused) {
          // Apply speed multiplier by running updates multiple times or with scaled delta
          for (let i = 0; i < Math.ceil(state.speed); i++) {
            modes[state.mode].update(state);
          }
        }
        
        // Draw particles (with trails)
        state.particles.forEach(p => p.draw(ctx));
        
        // Draw attractors
        state.attractors.forEach(a => a.draw(ctx));
        
        // Display pause indicator
        if (state.paused) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.font = 'bold 16px Courier New';
          ctx.fillText('[PAUSED]', 20, 30);
        }
        
        // Display speed indicator if not 1.0
        if (state.speed !== 1.0) {
          ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
          ctx.font = '12px Courier New';
          ctx.fillText(`speed: ${state.speed.toFixed(1)}x`, 20, 50);
        }
        
        updateStats();

        state.time++;
        if (isRunning) animationId = requestAnimationFrame(animate);
      };

      // Event handlers
      document.querySelectorAll('.prf-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.prf-mode-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          switchMode(e.target.dataset.mode);
        });
      });

      canvas.addEventListener('click', (e) => {
        if (state.mode === 'density') {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          state.attractors.push(new Attractor(x, y, 2));
        }
      });

      document.getElementById('prf-reset').addEventListener('click', () => {
        switchMode(state.mode);
      });

      const closeHandler = () => {
        modal.classList.remove('show');
        isRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
        window.terminal.input.focus();
      };

      document.getElementById('prf-close').addEventListener('click', closeHandler);
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closeHandler();
        // Pause/Resume with spacebar
        if (e.key === ' ' && modal.classList.contains('show')) {
          e.preventDefault();
          state.paused = !state.paused;
        }
        // Speed controls: +/- keys
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          state.speed = Math.min(3.0, state.speed + 0.25);
        }
        if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          state.speed = Math.max(0.25, state.speed - 0.25);
        }
        // Reset speed with 'r'
        if (e.key === 'r' || e.key === 'R') {
          if (modal.classList.contains('show')) {
            e.preventDefault();
            state.speed = 1.0;
          }
        }
      });

      animate();
    }
  };
})();
