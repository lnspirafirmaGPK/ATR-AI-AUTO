import SimulationEngine, { SIMULATION_MODES } from '../SimulationEngine.js';

function runTest() {
    console.log("Testing SimulationEngine...");

    SimulationEngine.setFaultMode(SIMULATION_MODES.NORMAL);
    let data = SimulationEngine.update();
    console.log("Normal Data Rail Pressure:", data.railPressure);

    SimulationEngine.setFaultMode(SIMULATION_MODES.SCV_FAULT);
    SimulationEngine.state = 'IDLE';
    data = SimulationEngine.update();
    console.log("SCV Fault (IDLE) Rail Pressure:", data.railPressure);

    SimulationEngine.setFaultMode(SIMULATION_MODES.INJECTOR_FAULT);
    data = SimulationEngine.update();
    console.log("Injector Fault Cyl 1:", data.injectors[1]);

    console.log("SimulationEngine verification finished.");
    process.exit(0);
}

runTest();
