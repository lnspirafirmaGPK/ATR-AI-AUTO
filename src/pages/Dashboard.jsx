// src/pages/Dashboard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { useVehicle } from '../context/VehicleContext'; 
import { useUser } from '../context/UserContext';
import { useOBD, CONNECTION_STATES } from '../context/OBDContext'; // [เพิ่ม] เรียกใช้ Context ใหม่
import { LockOverlay } from '../components/common/LockOverlay';
import { Button } from '../components/common/Button';
import { t } from '../utils/i18n';
import { Activity, Gauge, Thermometer, AlertTriangle, CheckCircle, Bluetooth } from 'lucide-react';
import { SIMULATION_MODES } from '../services/bluetooth';

const StatusIcon = ({ status }) => {
    if (status === 'CRITICAL') return <AlertTriangle className="text-red-500 h-6 w-6" />;
    if (status === 'WARNING') return <AlertTriangle className="text-yellow-500 h-6 w-6" />;
    return <CheckCircle className="text-green-500 h-6 w-6" />;
};

export default function Dashboard({ lang }) {
  // ใช้ useVehicle สำหรับดูค่า Data (RPM, Speed)
  const { vehicleData, diagnosticStatus, simulationMode, toggleSimulationMode } = useVehicle();
  
  // [แก้ไข] ใช้ useOBD สำหรับการ Connect/Disconnect และดูสถานะ
  const { connectToVehicle, disconnect, connectionState, currentVehicle } = useOBD();
  const { isPro } = useUser();

  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('dashboard', lang)}</h1>
           <div className="flex items-center gap-2 mt-1">
             <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? `Connected to: ${currentVehicle}` 
                  : 'Disconnected'}
             </p>
           </div>
        </div>

        {/* Connection Controls Area */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {!isConnected ? (
                <>
                  {/* ปุ่มเลือก ISUZU */}
                  <Button onClick={() => connectToVehicle('ISUZU')} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Bluetooth className="w-4 h-4" /> Connect Isuzu
                  </Button>
                  
                  {/* ปุ่มเลือก TOYOTA */}
                  <Button onClick={() => connectToVehicle('TOYOTA')} className="bg-black hover:bg-gray-800 text-white gap-2">
                    <Bluetooth className="w-4 h-4" /> Connect Toyota
                  </Button>
                </>
            ) : (
                <Button onClick={disconnect} variant="destructive">Disconnect</Button>
            )}

            {/* Simulation Selector */}
            <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                value={simulationMode}
                onChange={(e) => toggleSimulationMode(e.target.value)}
            >
                <option value={SIMULATION_MODES.NORMAL}>Sim: Normal</option>
                <option value={SIMULATION_MODES.SCV_FAULT}>Sim: SCV Fault</option>
                <option value={SIMULATION_MODES.INJECTOR_FAULT}>Sim: Injector Fault</option>
            </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* RPM Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('rpm', lang)}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(vehicleData.rpm)}</div>
            <p className="text-xs text-muted-foreground">rev/min</p>
          </CardContent>
        </Card>

        {/* Speed Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('speed', lang)}</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{Math.round(vehicleData.speed)}</div>
                <p className="text-xs text-muted-foreground">km/h</p>
            </CardContent>
        </Card>

        {/* Coolant / ATF Temp Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {/* ถ้าเป็น Isuzu อาจจะเปลี่ยน Label ตรงนี้เป็น ATF Temp ได้ในอนาคต */}
                <CardTitle className="text-sm font-medium">{t('coolantTemp', lang)}</CardTitle>
                <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{vehicleData.coolantTemp}</div>
                <p className="text-xs text-muted-foreground">°C</p>
            </CardContent>
        </Card>

        {/* Health Status Card */}
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <StatusIcon status={diagnosticStatus.fuelSystem.status === 'NORMAL' && diagnosticStatus.railSystem.status === 'NORMAL' ? 'NORMAL' : 'WARNING'} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {diagnosticStatus.fuelSystem.status === 'CRITICAL' ? 'CRITICAL' :
                     diagnosticStatus.railSystem.status === 'WARNING' ? 'WARNING' : 'GOOD'}
                </div>
                <p className="text-xs text-muted-foreground">Real-time Check</p>
            </CardContent>
        </Card>
      </div>

      {/* Advanced Analysis Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 relative">
          <CardHeader>
            <CardTitle>{t('railPressure', lang)} Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-3xl font-mono text-blue-600 dark:text-blue-400">
               {isPro ? `${Math.round(vehicleData.railPressure / 1000)} MPa` : '---'}
            </div>
             {isPro && (
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                        <span>Status</span>
                        <span className={diagnosticStatus.railSystem.status === 'WARNING' ? 'text-yellow-600 font-bold' : 'text-green-600 font-bold'}>
                            {diagnosticStatus.railSystem.status}
                        </span>
                    </div>
                    {diagnosticStatus.railSystem.status === 'WARNING' && (
                         <div className="text-sm text-red-500 font-medium">
                            {diagnosticStatus.railSystem.message}
                         </div>
                    )}
                </div>
             )}
          </CardContent>
          {!isPro && <LockOverlay message="Unlock Real-time Rail Pressure Analysis & SCV Sticking Detection" />}
        </Card>

        <Card className="col-span-3 relative">
          <CardHeader>
            <CardTitle>Cylinder Balance</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cyl {i}</span>
                        <div className="flex items-center gap-2">
                             <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                {isPro && (
                                    <div
                                        className={`h-full transition-all duration-300 ${Math.abs(vehicleData.injectors[i]) > 3 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: '50%', transform: `translateX(${vehicleData.injectors[i] * 10}%)` }} 
                                    />
                                )}
                             </div>
                             <span className="w-12 text-right font-mono text-sm">
                                {isPro ? vehicleData.injectors[i].toFixed(1) : '--.-'}
                             </span>
                        </div>
                    </div>
                ))}
             </div>
             {isPro && diagnosticStatus.fuelSystem.status === 'CRITICAL' && (
                 <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-md text-sm font-bold animate-pulse">
                     ⚠️ {diagnosticStatus.fuelSystem.message}
                 </div>
             )}
          </CardContent>
          {!isPro && <LockOverlay message="Unlock Individual Injector Diagnosis" />}
        </Card>
      </div>
    </div>
  );
}