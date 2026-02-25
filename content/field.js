window.initVisualizer = () => {
  const modal = document.getElementById('visualizer-modal');
  const canvas = document.getElementById('prf-canvas');
  const ctx = canvas.getContext('2d');
  const info = document.getElementById('prf-info');
  const stats = document.getElementById('prf-stats');
  
  // Set canvas size
  function resizeCanvas() {
    const container = document.getElementById('prf-canvas-container');
    canvas.width = Math.min(container.clientWidth - 40, 1000);
    canvas.height = Math.min(container.clientHeight - 40, 700);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Simulation state
  let mode = 'field';
  let time = 0;
  let particles = [];
  let attractors = [];
  let entropy = 0;
  let density = 0;
  let fragmentation = 0;
  let techLevel = 0;
  let ontologyLevel = 0;
  let delay = 0;
  let amplification = 1;
  let collapseEvents = [];

  // Particle class
  class Particle {
    constructor(x, y, type = 'potential') {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.type = type;
      this.mass = Math.random() * 2 + 1;
      this.age = 0;
      this.decay = Math.random() * 0.02;
    }

    update() {
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
      
      attractors.forEach(attractor => {
        const dx = attractor.x - this.x;
        const dy = attractor.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = attractor.strength / (dist * dist);
        this.vx += (dx / dist) * force * 0.1;
        this.vy += (dy / dist) * force * 0.1;
      });

      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      this.age += this.decay;
    }

    draw() {
      ctx.save();
      
      let alpha = Math.max(0, 1 - this.age);
      let color, size;

      switch(this.type) {
        case 'potential':
          color = `rgba(0, 255, 0, ${alpha * 0.3})`;
          size = 2;
          break;
        case 'collapsed':
          color = `rgba(0, 255, 255, ${alpha * 0.8})`;
          size = 4;
          break;
        case 'fragment':
          color = `rgba(255, 0, 0, ${alpha * 0.6})`;
          size = 3;
          break;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();

      if (this.type === 'collapsed') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  // Attractor class
  class Attractor {
    constructor(x, y, strength, label = '') {
      this.x = x;
      this.y = y;
      this.strength = strength;
      this.label = label;
      this.radius = Math.sqrt(strength) * 10;
    }

    draw() {
      ctx.save();
      
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
      ctx.stroke();

      if (this.label) {
        ctx.fillStyle = '#0ff';
        ctx.font = '11px Courier New';
        ctx.fillText(this.label, this.x + 12, this.y + 4);
      }

      ctx.restore();
    }
  }

  // Mode configurations
  const modes = {
    field: {
      desc: 'Base state: The Probability Field. Particles represent potential outcomes drifting under entropic pressure.',
      init: () => {
        particles = [];
        attractors = [];
        for (let i = 0; i < 200; i++) {
          particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          ));
        }
      },
      update: () => {
        particles.forEach(p => p.update());
        particles = particles.filter(p => p.age < 1);
        
        if (Math.random() < 0.3) {
          particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          ));
        }

        entropy = particles.length / 300;
        density = 0;
      }
    },
    
    density: {
      desc: 'Density accumulation: Click to create attractors. Watch how potential collapses into reality around concentrated mass.',
      init: () => {
        particles = [];
        attractors = [];
        for (let i = 0; i < 300; i++) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
      },
      update: () => {
        particles.forEach(p => {
          p.update();
          if (attractors.some(a => {
            const dist = Math.hypot(p.x - a.x, p.y - a.y);
            return dist < a.radius * 0.3;
          })) {
            p.type = 'collapsed';
          }
        });
        particles = particles.filter(p => p.age < 1);
        density = particles.filter(p => p.type === 'collapsed').length / particles.length || 0;
      }
    },

    fragmentation: {
      desc: 'Competing attractors: Density split across incompatible basins. Particles caught between forces.',
      init: () => {
        particles = [];
        attractors = [
          new Attractor(canvas.width * 0.35, canvas.height * 0.5, 3, 'A'),
          new Attractor(canvas.width * 0.65, canvas.height * 0.5, 3, 'B')
        ];
        for (let i = 0; i < 300; i++) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
      },
      update: () => {
        particles.forEach(p => {
          p.update();
          const distA = Math.hypot(p.x - attractors[0].x, p.y - attractors[0].y);
          const distB = Math.hypot(p.x - attractors[1].x, p.y - attractors[1].y);
          
          if (distA < attractors[0].radius * 0.3) {
            p.type = 'collapsed';
          } else if (distB < attractors[1].radius * 0.3) {
            p.type = 'collapsed';
          } else if (distA < attractors[0].radius && distB < attractors[1].radius) {
            p.type = 'fragment';
          }
        });
        particles = particles.filter(p => p.age < 1);
        fragmentation = particles.filter(p => p.type === 'fragment').length / particles.length || 0;
      }
    },

    delay: {
      desc: 'Tech/Ontology Delay: Exponential tech growth vs linear ontology. The gap = instability.',
      init: () => {
        particles = [];
        attractors = [];
        techLevel = 1;
        ontologyLevel = 1;
        for (let i = 0; i < 200; i++) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'potential'));
        }
      },
      update: () => {
        techLevel *= 1.05;
        ontologyLevel += 0.15;
        delay = Math.max(0, techLevel - ontologyLevel);

        particles.forEach(p => {
          p.vx += (Math.random() - 0.5) * (delay * 0.05);
          p.vy += (Math.random() - 0.5) * (delay * 0.05);
          p.update();
        });
        particles = particles.filter(p => p.age < 1);

        if (Math.random() < 0.3) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'potential'));
        }

        entropy = delay / 50;
      }
    },

    amplification: {
      desc: 'Amplification sequence: Language → Internet → AI. Each era compounds the previous.',
      init: () => {
        particles = [];
        attractors = [new Attractor(canvas.width / 2, canvas.height / 2, 2, 'Signal')];
        amplification = 1;
        for (let i = 0; i < 300; i++) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'potential'));
        }
      },
      update: () => {
        amplification *= 1.02;
        attractors[0].strength = 2 + amplification * 0.5;
        attractors[0].radius = Math.sqrt(attractors[0].strength) * 10;

        particles.forEach(p => {
          p.update();
          const dist = Math.hypot(p.x - attractors[0].x, p.y - attractors[0].y);
          if (dist < attractors[0].radius * 0.3) {
            p.type = 'collapsed';
          }
        });
        particles = particles.filter(p => p.age < 1);

        if (Math.random() < 0.2) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'potential'));
        }

        density = particles.filter(p => p.type === 'collapsed').length / particles.length || 0;
      }
    },

    collapse: {
      desc: 'Civilizational collapse: Entropy, fragmentation, and delay all running together.',
      init: () => {
        particles = [];
        attractors = [new Attractor(canvas.width / 2, canvas.height / 2, 5, 'Civilization')];
        entropy = 0.2;
        fragmentation = 0;
        delay = 0;
        for (let i = 0; i < 400; i++) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'collapsed'));
        }
      },
      update: () => {
        entropy *= 1.01;
        delay *= 1.02;
        delay += 0.1;
        fragmentation = Math.min(1, fragmentation + 0.002);

        particles.forEach(p => {
          p.vx += (Math.random() - 0.5) * entropy;
          p.vy += (Math.random() - 0.5) * entropy;
          p.decay *= 1.001;
          p.update();

          const distToCenter = Math.hypot(p.x - attractors[0].x, p.y - attractors[0].y);
          if (distToCenter > attractors[0].radius * 0.8 || Math.random() < fragmentation * 0.1) {
            p.type = 'fragment';
          }
        });

        particles = particles.filter(p => p.age < 1.5);

        if (Math.random() < 0.1) {
          particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, 'fragment'));
        }
      }
    }
  };

  const updateInfo = () => {
    const modeConfig = modes[mode];
    info.textContent = modeConfig.desc;
  };

  const updateStats = () => {
    const modeStats = {
      field: `entropy: ${(entropy * 100).toFixed(1)}%`,
      density: `density: ${(density * 100).toFixed(1)}%`,
      fragmentation: `fragmentation: ${(fragmentation * 100).toFixed(1)}%`,
      delay: `delay: ${delay.toFixed(1)} | tech: ${techLevel.toFixed(1)} | ontology: ${ontologyLevel.toFixed(1)}`,
      amplification: `amplification: ${amplification.toFixed(2)}x | density: ${(density * 100).toFixed(1)}%`,
      collapse: `entropy: ${(entropy * 100).toFixed(1)}% | fragmentation: ${(fragmentation * 100).toFixed(1)}% | delay: ${delay.toFixed(1)}`
    };
    stats.textContent = modeStats[mode] || '';
  };

  const switchMode = (newMode) => {
    mode = newMode;
    modes[mode].init();
    updateInfo();
    updateStats();
  };

  const animate = () => {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Update and draw
    modes[mode].update();
    particles.forEach(p => p.draw());
    attractors.forEach(a => a.draw());

    updateStats();

    time++;
    requestAnimationFrame(animate);
  };

  // Event listeners
  document.querySelectorAll('.prf-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.prf-mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      switchMode(e.target.dataset.mode);
    });
  });

  canvas.addEventListener('click', (e) => {
    if (mode === 'density') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      attractors.push(new Attractor(x, y, 2));
    }
  });

  document.getElementById('prf-reset').addEventListener('click', () => {
    switchMode(mode);
  });

  // Initialize
  switchMode('field');
  animate();

  // Modal controls
  document.getElementById('prf-close').addEventListener('click', () => {
    modal.classList.remove('show');
    window.terminal.input.focus();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      window.terminal.input.focus();
    }
  });
};
