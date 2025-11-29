# Interactive 3D Particles / 交互式 3D 粒子系统

[English](#english) | [中文](#chinese)

<a id="english"></a>

A mesmerizing interactive 3D particle system built with Three.js and MediaPipe. This project features a dynamic particle engine that reacts to hand gestures, mouse inputs, and audio frequencies in real-time.

## ✨ Features

- **Dynamic Particle System**: Renders 30,000+ particles with smooth morphing transitions between various shapes (Sphere, Heart, Galaxy, DNA, and more).
- **Hand Gesture Control**:
  - **Pinch to Scale**: Control the size of the particle cloud by changing the distance between your thumb and index finger.
  - **Gravity Well**: In 'Gravity Mode', your hand position becomes a gravitational force, attracting particles.
  - **Swipe Navigation**: Swipe your hand left or right in the air to switch between different particle shapes.
- **Audio Reactivity**: Visualize your music! Particles pulse to the beat, changing size, speed, and color based on bass, mid, and high frequencies.
- **Mouse Interaction**: Fully functional mouse fallback for devices without a webcam.
- **Visual Effects**: Includes a dynamic starfield background, rainbow color modes, and custom shader-based particle rendering.

## 🛠️ Tech Stack

- **[Three.js](https://threejs.org/)**: High-performance 3D rendering engine.
- **[MediaPipe](https://developers.google.com/mediapipe)**: Real-time hand tracking and gesture recognition.
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling.
- **Vanilla JavaScript**: Modern ES6+ modules structure.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/interactive-particles.git
    cd interactive-particles
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

## 🎮 Controls

| Interaction       | Action                                                                              |
| :---------------- | :---------------------------------------------------------------------------------- |
| **Hand Tracking** | **Pinch** to scale, **Move** to attract (Gravity Mode), **Swipe** to change shapes. |
| **Mouse**         | **Click & Hold** to contract, **Release** to expand, **Move** to interact.          |
| **UI Controls**   | Use the on-screen panel to toggle modes, shapes, and audio.                         |

## 📦 Build

To build the project for production:

```bash
npm run build
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<a id="chinese"></a>

# 交互式 3D 粒子系统

一个基于 Three.js 和 MediaPipe 构建的迷人交互式 3D 粒子系统。该项目具有动态粒子引擎，可实时响应手势、鼠标输入和音频频率。

## ✨ 特性

- **动态粒子系统**：渲染 30,000+ 个粒子，并在各种形状（球体、心形、星系、DNA 等）之间平滑变形。
- **手势控制**：
  - **捏合缩放**：通过改变拇指和食指之间的距离来控制粒子云的大小。
  - **重力井**：在“重力模式”下，您的手部位置变成引力，吸引粒子。
  - **滑动导航**：在空中向左或向右挥手以切换不同的粒子形状。
- **音频反应**：可视化您的音乐！粒子随节拍脉动，根据低音、中音和高音频率改变大小、速度和颜色。
- **鼠标交互**：为没有网络摄像头的设备提供全功能的鼠标回退支持。
- **视觉效果**：包括动态星空背景、彩虹颜色模式和基于自定义着色器的粒子渲染。

## 🛠️ 技术栈

- **[Three.js](https://threejs.org/)**：高性能 3D 渲染引擎。
- **[MediaPipe](https://developers.google.com/mediapipe)**：实时手部追踪和手势识别。
- **[Vite](https://vitejs.dev/)**：下一代前端构建工具。
- **Vanilla JavaScript**：现代 ES6+ 模块化结构。

## 🚀 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- npm (v6 或更高版本)

### 安装

1.  克隆仓库：

    ```bash
    git clone https://github.com/yourusername/interactive-particles.git
    cd interactive-particles
    ```

2.  安装依赖：

    ```bash
    npm install
    ```

3.  启动开发服务器：

    ```bash
    npm run dev
    ```

4.  打开浏览器并访问 `http://localhost:5173`（或终端中显示的 URL）。

## 🎮 操作控制

| 交互方式     | 动作                                                       |
| :----------- | :--------------------------------------------------------- |
| **手部追踪** | **捏合**缩放，**移动**吸引（重力模式），**挥手**切换形状。 |
| **鼠标**     | **点击并按住**收缩，**松开**扩散，**移动**交互。           |
| **UI 控制**  | 使用屏幕上的面板切换模式、形状和音频。                     |

## 📦 构建

构建生产版本：

```bash
npm run build
```

## 📄 许可证

本项目开源并遵循 [MIT 许可证](LICENSE)。
