import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class InputManager {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.handLandmarker = null;
    this.lastVideoTime = -1;
    this.interactionData = {
      scale: 1.0,
      isOpen: true,
      handPosition: null,
      swipeGesture: null // 'left', 'right', or null
    };
    this.isWebcamRunning = false;
    
    // Swipe Detection State
    this.handHistory = []; // Store last N hand positions
    this.maxHistoryLength = 10; // Number of frames to track
    this.swipeCooldown = 0; // Cooldown counter to prevent rapid triggers
    this.cooldownFrames = 30; // Wait 30 frames (~0.5s at 60fps) between swipes
    
    // Mouse Fallback State
    this.mouse = { x: 0, y: 0, isPressed: false, isActive: false };
    this.setupMouseListeners();
  }

  setupMouseListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
      this.mouse.isActive = true;
    });

    window.addEventListener('mousedown', () => {
      this.mouse.isPressed = true;
      this.mouse.isActive = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isPressed = false;
    });
  }

  async init(stream) {
    // Start camera immediately using provided stream
    if (stream) {
      this.setupWebcam(stream);
    } else {
      this.setupWebcam(); // Fallback
    }

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "/wasm" // Local WASM directory
      );
      
      // Add timeout for model loading (10 seconds)
      const createModel = HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `/models/hand_landmarker.task`, // Local path
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("MediaPipe model load timeout")), 10000)
      );

      this.handLandmarker = await Promise.race([createModel, timeout]);
      
    } catch (error) {
      console.warn("MediaPipe init failed/timed out. Falling back to mouse.", error);
      const statusEl = document.getElementById('gesture-status');
      if (statusEl) {
        statusEl.textContent = "Mouse Control Active";
        statusEl.style.color = "#00ffff";
      }
    }
  }

  async setupWebcam(externalStream) {
    if (externalStream) {
      this.videoElement.srcObject = externalStream;
      this.videoElement.addEventListener("loadeddata", () => {
        this.isWebcamRunning = true;
      });
      return;
    }

    const constraints = {
      video: {
        width: 640,
        height: 480
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = stream;
      this.videoElement.addEventListener("loadeddata", () => {
        this.isWebcamRunning = true;
      });
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }

  getInteractionData() {
    // Priority: Hand Tracking > Mouse
    if (this.handLandmarker && this.isWebcamRunning) {
      this.processHandTracking();
    } else if (this.mouse.isActive) {
      this.processMouseFallback();
    }

    return this.interactionData;
  }

  processMouseFallback() {
    // Map mouse click to "Closed Hand" (Contract)
    // Mouse release to "Open Hand" (Expand)
    // Scale: 1.0 (Neutral), 0.5 (Closed), 2.0 (Open)
    
    // If pressed, shrink to 0.5. If not, expand to 1.5 (slightly open)
    const targetScale = this.mouse.isPressed ? 0.5 : 1.5;
    
    // Smooth transition
    this.interactionData.scale += (targetScale - this.interactionData.scale) * 0.1;
    this.interactionData.isOpen = !this.mouse.isPressed;
    
    this.interactionData.handPosition = {
      x: this.mouse.x,
      y: this.mouse.y
    };
  }

  processHandTracking() {
    let startTimeMs = performance.now();
    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      const results = this.handLandmarker.detectForVideo(this.videoElement, startTimeMs);
      
      this.processResults(results);
    }
  }

  processResults(results) {
    // Decrease cooldown每帧
    if (this.swipeCooldown > 0) {
      this.swipeCooldown--;
      this.interactionData.swipeGesture = null; // Clear during cooldown
    }

    if (results.landmarks && results.landmarks.length > 0) {
      // Calculate average distance between thumb tip and index finger tip for all hands
      let totalDistance = 0;
      let handCount = 0;

      for (const landmarks of results.landmarks) {
        // Thumb tip: 4, Index tip: 8
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // Simple Euclidean distance in 3D (though z is relative)
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2) +
          Math.pow(thumbTip.z - indexTip.z, 2)
        );
        
        totalDistance += distance;
        handCount++;
      }

      const avgDistance = totalDistance / handCount;
      
      // Normalize distance to a scale factor
      let scale = (avgDistance - 0.05) * 10.0 + 0.5;
      scale = Math.max(0.5, Math.min(3.0, scale)); // Clamp
      
      this.interactionData.scale = scale;
      this.interactionData.isOpen = scale > 1.0;

      // Calculate hand center (centroid of all points)
      let centerX = 0;
      let centerY = 0;
      let totalPoints = 0;

      for (const landmarks of results.landmarks) {
        for (const point of landmarks) {
          centerX += point.x;
          centerY += point.y;
          totalPoints++;
        }
      }

      if (totalPoints > 0) {
        this.interactionData.handPosition = {
          x: centerX / totalPoints,
          y: centerY / totalPoints
        };

        // Swipe Detection: Track hand position history
        this.handHistory.push({ x: centerX / totalPoints, time: Date.now() });
        if (this.handHistory.length > this.maxHistoryLength) {
          this.handHistory.shift(); // Remove oldest
        }

        // Detect swipe if cooldown is 0 and we have enough history
        if (this.swipeCooldown === 0 && this.handHistory.length >= this.maxHistoryLength) {
          const swipe = this.detectSwipe();
          if (swipe) {
            this.interactionData.swipeGesture = swipe;
            this.swipeCooldown = this.cooldownFrames; // Start cooldown
          }
        }
      }
    } else {
      // No hands detected, slowly return to neutral
      this.interactionData.scale = this.interactionData.scale * 0.95 + 1.0 * 0.05;
      this.interactionData.handPosition = null;
      this.interactionData.swipeGesture = null;
      this.handHistory = []; // Clear history
    }
  }

  detectSwipe() {
    if (this.handHistory.length < this.maxHistoryLength) return null;

    const first = this.handHistory[0];
    const last = this.handHistory[this.handHistory.length - 1];

    const deltaX = last.x - first.x;
    const deltaTime = last.time - first.time;

    // Swipe must be fast (< 500ms) and significant (> 0.15 screen width)
    const threshold = 0.15;
    const timeLimit = 500;

    if (deltaTime > timeLimit) return null;

    if (deltaX > threshold) {
      return 'right'; // Swipe right
    } else if (deltaX < -threshold) {
      return 'left'; // Swipe left
    }

    return null;
  }
}
