export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 500; // Update FPS every 500ms
    this.renderTime = 0;
    this.particleCount = 0;
  }

  beginFrame() {
    this.frameStartTime = performance.now();
  }

  endFrame() {
    this.frameCount++;
    const currentTime = performance.now();
    this.renderTime = currentTime - this.frameStartTime;

    // Update FPS
    const elapsed = currentTime - this.lastTime;
    if (elapsed >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  setParticleCount(count) {
    this.particleCount = count;
  }

  getStats() {
    return {
      fps: this.fps,
      renderTime: this.renderTime.toFixed(2),
      particleCount: this.particleCount,
      memory: performance.memory ? 
        (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 'N/A'
    };
  }
}
