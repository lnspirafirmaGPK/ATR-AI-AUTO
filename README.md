# ATR Auto AI - Automotive Diagnostic System

**ATR Auto AI** is a professional-grade automotive diagnostic application designed specifically for the **Toyota Vigo Champ (1KD-FTV Engine)**. It combines real-time data monitoring with engineering-level analysis to detect critical failures like **SCV Sticking** and **Injector Failure** before they cause catastrophic engine damage.

The project features a sci-fi inspired **"GunUI" Dashboard** and is built for cross-platform deployment (Android) using **React**, **Vite**, and **Capacitor**.

![GunUI Dashboard](https://via.placeholder.com/800x400?text=ATR+Auto+AI+Dashboard+Preview)

---

## 🚀 Key Features

### 🧠 Engineering Core ("The Brain")
*   **Toyota Mode 21 Support**: Decodes proprietary protocols for Common Rail Pressure and Injector Feedback (Individual Cylinder Correction).
*   **Real-time Analysis**:
    *   **SCV Sticking Detection**: Monitors rail pressure fluctuation at idle.
    *   **Piston Health Monitor**: Alerts when injector feedback exceeds safety thresholds (±3.0 mm³/st).
*   **Tiered Access**:
    *   **Free Tier**: Standard OBD2 data (RPM, Speed, Coolant).
    *   **Pro Tier**: Unlocks engineering data, critical alerts, and the full "GunUI" experience.

### 💻 GunUI Dashboard
*   **Visual Schematic**: Animated wireframe visualization of the vehicle chassis and engine status.
*   **Risk-Adaptive Color System**: The entire UI changes color based on system health:
    *   🟢 **Normal**: System nominal.
    *   🟡 **Warning**: SCV instability detected.
    *   🔴 **Critical**: Injector failure risk / Piston crack warning.
*   **Smooth Animations**: SVG-based visualizations using `recharts` and CSS transitions.

### 🛠 Connectivity & Simulation
*   **Bluetooth OBD2**: Native Android Bluetooth integration via Capacitor.
*   **Simulation Mode**: Built-in simulator for development and demonstration.
    *   `SIM: NORMAL`: Simulates healthy engine parameters.
    *   `SIM: WARNING`: Simulates erratic rail pressure (Sawtooth wave).
    *   `SIM: CRITICAL`: Simulates injector failure on Cylinder 3.

---

## 🏗 Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS (v4)
*   **Mobile Runtime**: Capacitor 8 (Android)
*   **State Management**: React Context API (`VehicleContext`, `UserContext`)
*   **Visualization**: Recharts, Lucide React, Custom SVG
*   **CI/CD**: GitHub Actions (Automated APK Build)

---

## 📂 Project Structure

```bash
src/
├── assets/                 # Static assets
├── components/             # UI Components
│   ├── common/             # Reusable UI (Buttons, Cards, LockOverlay)
│   ├── layout/             # Navbar, Sidebar
│   └── ...
├── config/                 # Engineering Configuration
│   └── vigo_champ_specs.json  # Thresholds & Constants (Source of Truth)
├── context/                # Global State
│   ├── VehicleContext.jsx  # [CORE] Orchestrates Data Flow & Simulation
│   ├── UserContext.jsx     # Manages Free/Pro Tiers
│   └── OBDContext.jsx      # Connection State
├── engine/                 # [THE BRAIN] Diagnostic Logic
│   ├── DiagnosticEnforcer.js # Main Logic Class
│   ├── parsers/            # Hex -> Engineering Value
│   └── analyzers/          # Fault Detection Algorithms
├── pages/                  # Route Pages
│   ├── GunUIDashboard.jsx  # Main "Sci-Fi" Dashboard
│   ├── Subscription.jsx    # In-App Purchase Mockup
│   └── ...
├── services/               # External Services (Bluetooth)
└── utils/                  # Utilities (i18n, formatting)
```

---

## 📱 Development & Setup

### Prerequisites
*   Node.js v20+
*   Java 17 (for Android Build)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Web Browser (with Simulation)
```bash
npm run dev
```
*   Open `http://localhost:5173`
*   Use the **SIM: NORMAL / WARNING / CRITICAL** buttons in the top right to test the UI.

### 3. Build for Android
```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 🤖 Automated Build (GitHub Actions)

This repository includes a CI/CD pipeline to automatically build the **Android APK**.

1.  Push changes to the `main` branch.
2.  Go to the **Actions** tab in GitHub.
3.  Select **"Build Android APK"**.
4.  Download the `ATR-Auto-AI-App` artifact (zip file) from the completed workflow run.
5.  Extract and install `app-debug.apk` on your Android device.

---

## ⚙️ Engineering Specifications (Reference)

*   **Target Engine**: 1KD-FTV (3.0L) / 2KD-FTV (2.5L)
*   **Rail Pressure (Idle)**: Target 35,000 ± 2,000 kPa
*   **Injector Feedback Limit**: ± 3.0 mm³/st
*   **Protocol**: ISO 15765-4 CAN (Toyota Mode 21 Extension)

---

**Developed by Jules** for ATR Auto AI.
