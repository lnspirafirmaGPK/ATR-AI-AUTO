import DiagnosticEnforcer from '../DiagnosticEnforcer.js';

const normalValues = {
  railPressure: 35000,
  injectors: { 1: 0.5, 2: -0.2, 3: 0.1, 4: -0.1 }
};

const scvFaultValues = {
    railPressure: 40000,
    injectors: { 1: 0.5, 2: -0.2, 3: 0.1, 4: -0.1 }
};

const injectorFaultValues = {
    railPressure: 35000,
    injectors: { 1: 3.5, 2: -0.2, 3: 0.1, 4: -0.1 }
};

function runTest() {
    console.log("Running DiagnosticEnforcer Tests...");

    const normalResult = DiagnosticEnforcer.processProcessedData(normalValues);
    console.log("Normal Status:", normalResult.analysis.railSystem.status, normalResult.analysis.fuelSystem.status);

    for(let i=0; i<20; i++) {
        DiagnosticEnforcer.processProcessedData({
            railPressure: 35000 + (i % 2 === 0 ? 3000 : -3000),
            injectors: normalValues.injectors
        });
    }
    const scvResult = DiagnosticEnforcer.processProcessedData(scvFaultValues);
    console.log("SCV Fault Status:", scvResult.analysis.railSystem.status);

    const injResult = DiagnosticEnforcer.processProcessedData(injectorFaultValues);
    console.log("Injector Fault Status:", injResult.analysis.fuelSystem.status);

    console.log("DiagnosticEnforcer manual verification finished.");
}

runTest();
