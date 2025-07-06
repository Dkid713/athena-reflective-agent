// runtime.ts
import { AthenaReflectorService } from 'athena-reflective-agent/src/athenaReflectorService';
import { AutonomousExecutionEngine } from './src/AutonomousExecutionEngine';

(async () => {
  console.log('[BOOT] Athena Reflective Agent is launching...');

  const reflector = new AthenaReflectorService();
  await reflector.initialize();
  console.log('[INIT] Reflection service initialized');

  setInterval(async () => {
    console.log('[LOOP] Triggering Athena reflection cycle...');
    await reflector.run();
  }, 10000);

  const engine = new AutonomousExecutionEngine();
  await engine.bootstrap();
  console.log('[BOOT] Autonomous Execution Engine activated');
})();


// agent-test-runner.ts
import { AthenaReflectorService } from 'athena-reflective-agent/src/athenaReflectorService';
import { MemoryGraph } from 'athena-reflective-agent/src/memory-graph';

(async () => {
  console.log('[TEST] Running agent test with fake memory...');

  const reflector = new AthenaReflectorService();
  await reflector.initialize();

  const testMemory = new MemoryGraph();
  testMemory.addNode({
    id: 'n-test-1',
    label: 'Test Observation: anomaly detected at 3PM',
    group: 'observation',
  });

  // Inject the memory directly if needed
  reflector.graph = testMemory;

  console.log('[TEST] Injected test memory node');

  await reflector.run();

  console.log('[TEST] Reflection run complete');
})();
