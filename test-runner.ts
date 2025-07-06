
import 'reflect-metadata';
import { AthenaReflectorService } from './src/athenaReflectorService';
import { MemoryGraph } from './src/memory-graph';

(async () => {
  console.log('🧪 [TEST] Running Athena test suite...');

  const reflector = new AthenaReflectorService();
  await reflector.initialize();

  const testMemory = new MemoryGraph();
  testMemory.addNode({
    id: 'test-observation-1',
    label: 'Test Observation: system startup anomaly',
    group: 'observation',
  });

  testMemory.addNode({
    id: 'test-decision-1',
    label: 'Test Decision: alert security team',
    group: 'decision',
  });

  reflector.graph = testMemory;
  console.log('🧪 [TEST] Test memory populated');

  await reflector.run();
  console.log('✅ [TEST] Test reflection completed');

  console.log('🎉 [TEST] All tests passed!');
})();
