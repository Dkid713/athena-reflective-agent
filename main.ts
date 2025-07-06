
import { AthenaReflectorService } from './src/athenaReflectorService';
import { AutonomousExecutionEngine } from './src/AutonomousExecutionEngine';
import { MemoryGraph } from './src/memory-graph';

(async () => {
  console.log('🚀 [BOOT] Athena Reflective Agent is launching...');

  // Initialize services
  const reflector = new AthenaReflectorService();
  await reflector.initialize();
  console.log('✅ [INIT] Reflection service initialized');

  const engine = new AutonomousExecutionEngine();
  await engine.bootstrap();
  console.log('✅ [BOOT] Autonomous Execution Engine activated');

  // Add some test memory
  const testMemory = new MemoryGraph();
  testMemory.addNode({
    id: 'n-test-1',
    label: 'Test Observation: anomaly detected at 3PM',
    group: 'observation',
  });

  // Inject test memory
  reflector.graph = testMemory;
  console.log('🧪 [TEST] Injected test memory node');

  // Run initial reflection
  await reflector.run();

  // Set up periodic cycles
  setInterval(async () => {
    console.log('🧠 [LOOP] Triggering Athena reflection cycle...');
    await reflector.run();
  }, 10000);

  setInterval(async () => {
    console.log('🛠️ [LOOP] Triggering planning cycle...');
    await engine.runPlanningCycle();
  }, 15000);

  console.log('✅ Athena is now operational and running cycles');
})();
