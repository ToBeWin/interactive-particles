export class UIManager {
  constructor(container) {
    this.container = container;
    this.particleSystem = null;
    this.shapes = ['sphere', 'heart', 'saturn', 'galaxy', 'flower', 'torus', 'dna', 'fireworks', 'atomic'];
    this.colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#00ff00', '#ffffff'];
    this.currentModelIndex = 0; // Track current model
  }

  init(particleSystem, audioManager) {
    this.particleSystem = particleSystem;
    this.audioManager = audioManager;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="panel">
        <div class="panel-title">Performance</div>
        <div class="stats" id="perf-stats">
          <div>FPS: <span id="fps-display">60</span></div>
          <div>Render: <span id="render-time">0</span>ms</div>
          <div>Particles: <span id="particle-count">30000</span></div>
        </div>
        <div style="margin-top: 10px;">
          <label style="font-size: 12px; opacity: 0.8;">Particle Count</label>
          <input type="range" id="particle-slider" min="10000" max="100000" step="10000" value="30000" style="width: 100%;">
        </div>

        <div class="panel-title" style="margin-top: 20px;">Visual Effects</div>
        <button class="btn active" id="bloom-btn">Bloom</button>
        <button class="btn" id="chromatic-btn">Chromatic</button>
        <button class="btn" id="film-btn">Film Grain</button>
        <button class="btn" id="rainbow-btn">Rainbow Mode</button>

        <div class="panel-title" style="margin-top: 20px;">Camera</div>
        <button class="btn" id="camera-btn">Start Camera</button>

        <div class="panel-title" style="margin-top: 20px;">Mode</div>
        <div class="mode-switch">
          <button class="btn active" data-mode="shape">Shape</button>
          <button class="btn" data-mode="gravity">Gravity</button>
        </div>

        <div class="panel-title" style="margin-top: 20px;">Audio</div>
        <button class="btn" id="audio-btn">Enable Mic</button>

        <div class="panel-title" style="margin-top: 20px;">Models</div>
        <div class="model-grid" id="model-grid">
          ${this.shapes.map(shape => `
            <button class="btn ${shape === 'sphere' ? 'active' : ''}" data-shape="${shape}">
              ${shape.charAt(0).toUpperCase() + shape.slice(1)}
            </button>
          `).join('')}
        </div>
        
        <div class="panel-title" style="margin-top: 20px;">Color</div>
        <input type="color" class="color-picker" value="#00ffff">
        
        <div class="status">
          <span id="gesture-status">Ready</span>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Camera Toggle
    const cameraBtn = this.container.querySelector('#camera-btn');
    cameraBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        // Pass stream to input manager (we need to expose this method)
        if (window.appInstance && window.appInstance.inputManager) {
          await window.appInstance.inputManager.init(stream);
          cameraBtn.textContent = 'Camera On';
          cameraBtn.classList.add('active');
        }
      } catch (err) {
        console.error("Camera permission denied:", err);
        cameraBtn.textContent = 'Camera Failed';
      }
    });

    // Particle Count Slider
    const particleSlider = this.container.querySelector('#particle-slider');
    particleSlider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value);
      this.particleSystem.setParticleCount(count);
      this.container.querySelector('#particle-count').textContent = count;
    });

    // Visual Effects
    const bloomBtn = this.container.querySelector('#bloom-btn');
    const chromaticBtn = this.container.querySelector('#chromatic-btn');
    const filmBtn = this.container.querySelector('#film-btn');
    const rainbowBtn = this.container.querySelector('#rainbow-btn');

    if (bloomBtn) {
      bloomBtn.addEventListener('click', () => {
        const active = window.appInstance.sceneManager.toggleEffect('bloom');
        bloomBtn.classList.toggle('active', active);
      });
    }

    if (chromaticBtn) {
      chromaticBtn.addEventListener('click', () => {
        const active = window.appInstance.sceneManager.toggleEffect('chromatic');
        chromaticBtn.classList.toggle('active', active);
      });
    }

    if (filmBtn) {
      filmBtn.addEventListener('click', () => {
        const active = window.appInstance.sceneManager.toggleEffect('film');
        filmBtn.classList.toggle('active', active);
      });
    }

    if (rainbowBtn) {
      rainbowBtn.addEventListener('click', () => {
        this.particleSystem.toggleRainbowMode();
        rainbowBtn.classList.toggle('active');
      });
    }

    // Mode Switching
    const modeBtns = this.container.querySelectorAll('[data-mode]');
    const modelGrid = this.container.querySelector('#model-grid');
    
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.particleSystem.setMode(mode);
        
        modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Disable model selection in gravity mode
        if (mode === 'gravity') {
          modelGrid.style.opacity = '0.5';
          modelGrid.style.pointerEvents = 'none';
        } else {
          modelGrid.style.opacity = '1';
          modelGrid.style.pointerEvents = 'auto';
        }
      });
    });

    // Audio Toggle
    const audioBtn = this.container.querySelector('#audio-btn');
    audioBtn.addEventListener('click', () => {
      const isListening = this.audioManager.toggle();
      audioBtn.textContent = isListening ? 'Mic On' : 'Enable Mic';
      audioBtn.classList.toggle('active', isListening);
    });

    // Shape buttons
    const buttons = this.container.querySelectorAll('[data-shape]');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        const shape = e.target.dataset.shape;
        this.currentModelIndex = this.shapes.indexOf(shape);
        this.particleSystem.setShape(shape);
        
        // Update active state
        buttons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Color picker
    const colorPicker = this.container.querySelector('.color-picker');
    colorPicker.addEventListener('input', (e) => {
      this.particleSystem.setColor(e.target.value);
    });
  }


  updateStatus(interactionData) {
    const statusEl = document.getElementById('gesture-status');
    if (statusEl) {
      // Handle swipe gestures
      if (interactionData.swipeGesture) {
        const direction = interactionData.swipeGesture === 'left' ? '←' : '→';
        this.switchModel(interactionData.swipeGesture);
        statusEl.textContent = `Swipe ${direction} detected!`;
        statusEl.style.color = '#ffff00';
      } else if (interactionData.scale !== 1.0) {
        statusEl.textContent = `Scale: ${interactionData.scale.toFixed(2)}`;
        statusEl.style.color = '#00ffff';
      } else {
        statusEl.textContent = 'Waiting for hands...';
        statusEl.style.color = '#aaa';
      }
    }
  }

  switchModel(direction) {
    if (direction === 'left') {
      this.currentModelIndex = (this.currentModelIndex - 1 + this.shapes.length) % this.shapes.length;
    } else if (direction === 'right') {
      this.currentModelIndex = (this.currentModelIndex + 1) % this.shapes.length;
    }

    const newShape = this.shapes[this.currentModelIndex];
    this.particleSystem.setShape(newShape);
    this.updateModelHighlight();
  }

  updateModelHighlight() {
    const buttons = this.container.querySelectorAll('[data-shape]');
    const currentShape = this.shapes[this.currentModelIndex];
    
    buttons.forEach(btn => {
      if (btn.dataset.shape === currentShape) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updatePerformance(stats) {
    const fpsEl = document.getElementById('fps-display');
    const renderEl = document.getElementById('render-time');
    
    if (fpsEl) fpsEl.textContent = stats.fps;
    if (renderEl) renderEl.textContent = stats.renderTime;
  }
}
