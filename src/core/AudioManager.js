export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isListening = false;
    this.hasPermission = false;
  }

  async init(stream) {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Use provided stream or request audio only
      const audioStream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(audioStream);
      source.connect(this.analyser);
      
      this.isListening = true;
      this.hasPermission = true;
      console.log('Audio initialized');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.hasPermission = false;
    }
  }

  toggle() {
    if (!this.audioContext) {
      this.init();
    } else {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
        this.isListening = true;
      } else if (this.audioContext.state === 'running') {
        this.audioContext.suspend();
        this.isListening = false;
      }
    }
    return this.isListening;
  }

  getAudioData() {
    if (!this.isListening || !this.analyser) {
      return { bass: 0, mid: 0, high: 0, spectrum: null };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Split into frequency bands
    const bassEnd = Math.floor(this.dataArray.length * 0.1);  // 0-10%
    const midEnd = Math.floor(this.dataArray.length * 0.4);   // 10-40%
    
    let bassSum = 0, midSum = 0, highSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += this.dataArray[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += this.dataArray[i];
    }
    for (let i = midEnd; i < this.dataArray.length; i++) {
      highSum += this.dataArray[i];
    }
    
    return {
      bass: bassSum / (bassEnd * 255),
      mid: midSum / ((midEnd - bassEnd) * 255),
      high: highSum / ((this.dataArray.length - midEnd) * 255),
      spectrum: this.dataArray
    };
  }
}
