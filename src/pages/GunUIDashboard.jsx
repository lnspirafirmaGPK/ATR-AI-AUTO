import React, { useState, useEffect } from 'react';
import { Activity, Zap, Bluetooth, AlertTriangle, Cpu, Gauge, Terminal, Search, Minimize2, Maximize2 } from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import { useUser } from '../context/UserContext';
import { SIMULATION_MODES } from '../services/bluetooth';
import IntroSequence from '../components/genui/IntroSequence';
import GenUIContainer from '../components/genui/GenUIContainer';
import LiquidButton from '../components/genui/LiquidButton';
import OverlayWidget from '../components/genui/OverlayWidget';

// --- Sub-Components ---

const DataCard = ({ title, icon, children, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold tracking-wider">
      {icon}
      <span style={{ color: color }}>{title}</span>
    </div>
    {children}
  </div>
);

// Schematic Visualizer: SVG Animation
const SchematicVisualizer = ({ riskLevel, active }) => {
  const [drawPct, setDrawPct] = useState(0);
  const color = riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'WARNING' ? '#eab308' : '#22c55e';

  useEffect(() => {
    let interval;
    // Always animate if there is data (even simulated)
    if (true) {
       interval = setInterval(() => {
         setDrawPct(prev => Math.min(prev + 2, 100));
       }, 30);
    }

    return () => {
      if (interval) clearInterval(interval);
      setDrawPct(0);
    }
  }, [active, riskLevel]);

  // Simplified Truck Path (Side View)
  const chassisPath = "M50 300 L50 250 L120 250 L150 180 L350 180 L400 250 L650 250 L650 300 L550 300 A40 40 0 0 1 470 300 L230 300 A40 40 0 0 1 150 300 Z";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 700 400" className="w-full h-full max-w-[600px]">
        {/* Chassis */}
        <path d={chassisPath} fill="none" stroke={color} strokeWidth="2"
              strokeDasharray="2000" strokeDashoffset={2000 - (2000 * drawPct / 100)}
              className="transition-all duration-300" />

        {/* Wheels */}
        {["M190 300", "M510 300"].map((m, i) => (
           <g key={i} className={active ? "animate-spin-slow origin-center" : ""}>
             <circle cx={i===0?190:510} cy={300} r="35" fill="none" stroke={color} strokeWidth="2" strokeDasharray="10 5" opacity={drawPct/100}/>
           </g>
        ))}

        {/* Engine Block (1KD-FTV) - Pulse if Critical */}
        <rect x="160" y="200" width="80" height="80" fill={riskLevel === 'CRITICAL' ? `${color}33` : 'none'} stroke={color} strokeWidth="2"
              className={riskLevel === 'CRITICAL' ? 'animate-pulse' : ''} opacity={drawPct/100} />

        {/* Turbo VNT */}
        <path d="M250 220 C270 200 290 240 270 260 C250 280 230 240 250 220" fill="none" stroke={color} strokeWidth="2" opacity={drawPct/100} />

        {/* RPM Visualization (Piston Speed simulation) */}
        <line x1="200" y1="220" x2="200" y2={260 + Math.sin(drawPct * 0.5)*20} stroke={color} strokeWidth="4" />
      </svg>
    </div>
  );
};

const LogStream = ({ riskLevel }) => {
  const [logs, setLogs] = useState(["> System Ready..."]);

  useEffect(() => {
    const interval = setInterval(() => {
       const msgs = riskLevel === 'CRITICAL'
         ? ["⚠️ INJECTOR #3 VARIANCE HIGH", "❌ SCV FLUCTUATION DETECTED", "PRESSURE DROP < 20000 kPa"]
         : ["Checking VNT Stepper...", "Rail Pressure Stable", "EGR Valve Position OK", "MAF Signal: Clean", "Fuel Temp: 45°C"];
       const newLog = `> ${msgs[Math.floor(Math.random() * msgs.length)]}`;
       setLogs(prev => [...prev.slice(-5), newLog]);
    }, 2000);
    return () => clearInterval(interval);
  }, [riskLevel]);

  return (
    <div className="flex flex-col gap-1 text-slate-400">
      {logs.map((log, i) => (
        <div key={i} className="truncate">{log}</div>
      ))}
    </div>
  );
};

/**
 * GUN UI (Graphic User Neural Interface) - Master Component
 */
const GunUIDashboard = () => {
  // Use Global State instead of local state
  const {
    vehicleData,
    diagnosticStatus,
    isConnected,
    toggleSimulationMode,
    simulationMode
  } = useVehicle();

  const { isPro, isGoldenKey, ownerName, upgradeToGoldenKey } = useUser();
  const [showIntro, setShowIntro] = useState(true);
  const [overlayMode, setOverlayMode] = useState(false);

  // Derived State from Context
  const riskLevel =
      diagnosticStatus.fuelSystem.status === 'CRITICAL' ? 'CRITICAL' :
      diagnosticStatus.railSystem.status === 'WARNING' ? 'WARNING' :
      'NORMAL';

  const connectionStatus = isConnected ? 'CONNECTED' : 'DISCONNECTED';

  // Helper Functions
  const handleSimulate = (level) => {
     if (level === 'NORMAL') toggleSimulationMode(SIMULATION_MODES.NORMAL);
     if (level === 'WARNING') toggleSimulationMode(SIMULATION_MODES.SCV_FAULT);
     if (level === 'CRITICAL') toggleSimulationMode(SIMULATION_MODES.INJECTOR_FAULT);
  };

  // Risk-Adaptive Color Logic
  const getColor = () => {
    switch(riskLevel) {
      case 'CRITICAL': return '#ef4444'; // Red-500
      case 'WARNING': return '#eab308';  // Yellow-500
      default: return '#22c55e';         // Green-500
    }
  };

  // Prepare Injector Data (Handle nulls for Free tier)
  const injectors = isPro && vehicleData.injectors ? Object.values(vehicleData.injectors) : [0, 0, 0, 0];
  const railPressure = isPro ? vehicleData.railPressure : 0;

  if (showIntro && isGoldenKey) {
    return <IntroSequence onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="w-full h-screen overflow-hidden">
    <GenUIContainer>

      {/* --- Overlay Mode --- */}
      {overlayMode && (
          <OverlayWidget data={vehicleData} isCritical={riskLevel === 'CRITICAL'} />
      )}

      <div className={`w-full min-h-screen p-4 font-mono relative overflow-y-auto transition-all duration-500 ${overlayMode ? 'opacity-20 pointer-events-none scale-95 blur-sm' : ''}`}
           style={{ backgroundImage: `linear-gradient(${getColor()}33 1px, transparent 1px), linear-gradient(90deg, ${getColor()}33 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>

        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800/50 pb-4 mb-6 z-10 relative gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`p-2 rounded-full bg-slate-900 border border-${riskLevel === 'NORMAL' ? 'green' : riskLevel === 'WARNING' ? 'yellow' : 'red'}-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]`}>
              <Cpu className="w-6 h-6" style={{ color: getColor() }} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-white font-[Rajdhani]">ATR AUTO AI <span className="text-xs text-slate-500">v4.0.1</span></h1>
              <p className="text-xs text-slate-500 tracking-wider">NEURAL DIAGNOSTIC SYSTEM</p>
            </div>
          </div>

          {/* Simulation Controls (Hybrid Mode Toggle) */}
          <div className="flex gap-2">
            {!isGoldenKey && (
                 <button onClick={() => upgradeToGoldenKey("Jules")} className="px-3 py-1 text-xs border border-amber-500/50 text-amber-500 hover:bg-amber-900/20">
                     [DEV] UNLOCK GOLDEN KEY
                 </button>
            )}

            <LiquidButton onClick={() => setOverlayMode(!overlayMode)} active={overlayMode} color="cyan">
               {overlayMode ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
            </LiquidButton>
          </div>
        </header>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

          {/* Left Panel: Schematic Visualizer (The "GUN" Part) */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/60 rounded-xl p-6 relative min-h-[400px] flex items-center justify-center backdrop-blur-md">

            {/* SVG Schematic Drawing */}
            <SchematicVisualizer
              riskLevel={riskLevel}
              active={true} // Always active in Sim/Playground mode
            />

            {/* Overlay Info (Specs) */}
            <div className="absolute top-4 left-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-bold border-b border-slate-700 pb-1 mb-1">VEHICLE PROFILE</span>
                <span className="text-white font-bold text-lg">TOYOTA VIGO CHAMP</span>
                <span style={{ color: getColor() }}>ENGINE: 1KD-FTV (3.0L D-4D)</span>
                <span className="text-slate-400">INDUCTION: VN TURBO INTERCOOLER</span>
                <span className="text-slate-400">FUEL: COMMONRAIL GEN 2</span>
              </div>
            </div>

            {/* Risk Status Label */}
            <div className="absolute bottom-4 right-4 text-right">
               <span className="text-xs text-slate-500 block">SYSTEM INTEGRITY</span>
               <span className="text-2xl font-bold tracking-widest" style={{ color: getColor(), textShadow: `0 0 10px ${getColor()}` }}>
                 {riskLevel}
               </span>
               {riskLevel === 'CRITICAL' &&
                  <div className="mt-2 text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded animate-pulse">
                    ⚠️ IMMEDIATE ACTION REQUIRED
                  </div>
               }
            </div>
          </div>

          {/* Right Panel: Digital Data Grid */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            {/* 1. Rail Pressure Card (Most Important) */}
            <DataCard title="COMMON RAIL PRESSURE" icon={<Gauge className="w-4 h-4"/>} color={getColor()}>
               <div className="flex justify-between items-end">
                 <span className="text-4xl font-bold font-mono" style={{ color: getColor() }}>
                   {railPressure ? Math.round(railPressure).toLocaleString() : '---'}
                 </span>
                 <span className="text-sm text-slate-500 mb-1">kPa</span>
               </div>
               {/* Progress Bar Visualizer */}
               <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                 <div className="h-full transition-all duration-300"
                      style={{ width: `${(railPressure / 180000) * 100}%`, backgroundColor: getColor() }}>
                 </div>
               </div>
               <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                 <span>TARGET: 35,000</span>
                 <span>MAX: 180,000</span>
               </div>
               {!isPro && <div className="mt-2 text-xs text-center text-slate-500 border border-slate-700 rounded p-1">Upgrade to Pro to unlock live data</div>}
            </DataCard>

            {/* 2. Injector Balance */}
            <DataCard title="INJECTOR FEEDBACK (mm³/st)" icon={<Activity className="w-4 h-4"/>} color={getColor()}>
              <div className="grid grid-cols-4 gap-2 h-24 items-end mt-2">
                {injectors.map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 group relative">
                     <span className={`text-[10px] font-mono absolute -top-4 ${Math.abs(val) > 3 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                       {val.toFixed(1)}
                     </span>
                     <div className="w-full h-16 bg-slate-800 rounded relative overflow-hidden">
                        {/* Bar moves up/down from center */}
                        <div
                          className={`absolute bottom-0 w-full transition-all duration-500 ${Math.abs(val) > 3 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ height: `${Math.min(Math.abs(val) * 20, 100)}%` }}
                        ></div>
                        {/* Center Line */}
                        <div className="absolute top-1/2 w-full h-[1px] bg-white/20"></div>
                     </div>
                     <span className="text-[10px] text-slate-500">#{i+1}</span>
                  </div>
                ))}
              </div>
               {!isPro && <div className="mt-2 text-xs text-center text-slate-500 border border-slate-700 rounded p-1">LOCKED</div>}
            </DataCard>

            {/* 3. Terminal Log */}
            <div className="flex-1 bg-black/60 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-hidden flex flex-col backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-2">
                <Terminal className="w-3 h-3" />
                <span>DIAGNOSTIC_LOG</span>
              </div>
              <LogStream riskLevel={riskLevel} />
            </div>

            {/* Owner Branding */}
            {isGoldenKey && (
               <div className="text-right mt-2 opacity-50">
                  <span className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-light">
                     System Owner: {ownerName}
                  </span>
               </div>
            )}

          </div>
        </div>
      </div>
    </GenUIContainer>
    </div>
  );
};

export default GunUIDashboard;
