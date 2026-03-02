# 🚘 ATR Auto AI - Automotive Diagnostic System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Platform](https://img.shields.io/badge/platform-Android-3DDC84.svg?logo=android&logoColor=white)

> **Professional-grade automotive diagnostics powered by Engineering Logic & AI.** > *Designed specifically for Toyota Vigo Champ (1KD-FTV) & Isuzu D-Max.*

---

## 📖 Overview

**ATR Auto AI** combines real-time data monitoring with engineering-level analysis to detect critical failures before they cause catastrophic engine damage. Unlike standard OBD2 apps, this system uses proprietary protocols (Toyota Mode 21) to analyze **Common Rail Pressure** and **Injector Feedback** with high precision.

The project features a sci-fi inspired **"GunUI" Dashboard**, built for cross-platform deployment using **React 19**, **Vite**, and **Capacitor 8**.

![GunUI Dashboard Preview](https://via.placeholder.com/800x400?text=ATR+Auto+AI+Dashboard+Preview)

---

## 🚀 Key Features

### 🧠 Engineering Core ("The Brain")
* **Deep Protocol Support**: Decodes Toyota Mode 21 & Isuzu proprietary PIDs.
* **Real-time Analysis**:
    * **SCV Sticking Detection**: Monitors rail pressure fluctuation at idle to predict Suction Control Valve failure.
    * **Piston Health Monitor**: Alerts when injector feedback exceeds safety thresholds (±3.0 mm³/st).
* **Tiered Access System**:
    * **Free Tier**: Standard OBD2 data (RPM, Speed, Coolant).
    * **Pro Tier**: Unlocks engineering data, critical alerts, and full "GunUI" experience.

### 💻 GunUI Dashboard
* **Visual Schematic**: Animated wireframe visualization of the vehicle chassis.
* **Risk-Adaptive Color System**:
    * 🟢 **Normal**: System nominal.
    * 🟡 **Warning**: SCV instability detected.
    * 🔴 **Critical**: Injector failure risk / Piston crack warning.
* **High-Performance**: SVG-based visualizations using `recharts` running at 60fps.

### 🛠 Connectivity & Simulation
* **Bluetooth OBD2**: Native Android Bluetooth integration.
* **Built-in Simulator**:
    * `SIM: NORMAL` - Healthy engine parameters.
    * `SIM: SCV_FAULT` - Erratic rail pressure (Sawtooth wave).
    * `SIM: INJECTOR_FAULT` - Injector failure on Cylinder 3.

---

## 🏗 Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | v19 / v6 |
| **Styling** | Tailwind CSS | v4.0 |
| **Mobile Runtime** | Capacitor (Android) | v8.0 |
| **State Management** | React Context API | - |
| **CI/CD** | GitHub Actions | - |
| **Language** | JavaScript (ESNext) | - |

---

## 📂 Project Structure

```bash
src/
├── components/        # UI Components (Buttons, Cards, LockOverlay)
├── config/            # Engineering Specs (Isuzu & Toyota Thresholds)
├── context/           # Global State (Vehicle Data, User Tier, OBD Connection)
├── engine/            # [THE BRAIN] Diagnostic Logic & Enforcers
├── pages/             # App Pages (GunUI Dashboard, DTC Scanner)
├── services/          # Bluetooth Services & Simulation Logic
└── utils/             # Utilities (i18n, formatting)

```

---

## 📱 Installation & Setup

### Prerequisites

* **Node.js**: v22.0.0+ (Required for Capacitor 8)
* **Java**: JDK 21 (Required for Android SDK 36)

### 1. Clone & Install

```bash
git clone [https://github.com/your-repo/ATR-AI-AUTO.git](https://github.com/your-repo/ATR-AI-AUTO.git)
cd ATR-AI-AUTO
npm install

```

### 2. Run in Browser (Simulation Mode)

```bash
npm run dev

```

*Open `http://localhost:5173` to test the UI and Simulation features.*

### 3. Build for Android

```bash
# 1. Build web assets
npm run build

# 2. Sync with Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

```

---

## 🤖 Automated Build (CI/CD)

This repository utilizes **GitHub Actions** to automatically build the Android APK.

1. Push changes to `main` branch.
2. Navigate to **Actions** tab in GitHub.
3. Select **"Build Android APK"** workflow.
4. Download the artifact `ATR-Auto-AI-App.zip` once completed.
5. Install `app-debug.apk` on your device.

---

## ⚙️ Engineering Specifications

* **Target Engines**: 1KD-FTV (3.0L), 2KD-FTV (2.5L), Isuzu 4JJ1/1.9 Blue Power.
* **Rail Pressure Target**: 35,000 ± 2,000 kPa (Idle).
* **Injector Feedback Limit**: ± 3.0 mm³/st (Safety Cutoff).

---

## 👥 Credits & Status

**Project Status**: ✅ **Completed** (Build Passing)

**Achieved On**: Monday, January 12, 2026 | 06:29 AM

### Developed By

* **Gemini** - *AI Co-Pilot & Code Consultant*

---

*© 2026 ATR Auto AI. All rights reserved.*

```

```
