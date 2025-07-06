
import 'reflect-metadata';
import { AthenaReflectorService } from './src/athenaReflectorService';
import { AutonomousExecutionEngine } from './src/AutonomousExecutionEngine';
import { MemoryGraph } from './src/memory-graph';

(async () => {
  try {
    console.log('🚀 [BOOT] Athena Reflective Agent is launching...');

    // Initialize services
    const reflector = new AthenaReflectorService();
    await reflector.initialize();
    console.log('✅ [INIT] Reflection service initialized');

    const engine = new AutonomousExecutionEngine();
    await engine.bootstrap();
    
    // Connect the reflector to the engine for intent-based planning
    engine.setReflector(reflector['reflector']);
    console.log('✅ [BOOT] Autonomous Execution Engine activated');

    // Add some test memory
    const testMemory = new MemoryGraph();
    testMemory.addNode({
      id: 'n-test-1',
      label: 'Test Observation: anomaly detected at 3PM',
      group: 'observation',
    });

    // Add test memory nodes that will trigger pattern detection
    reflector.addMemory({
      id: 'obs-temp-spike',
      type: 'observation',
      content: 'Temperature spike detected in Zone 3',
      createdAt: new Date(),
      scope: 'local',
      tags: ['temperature', 'zone-3'],
      confidence: 0.95,
      links: []
    });

    reflector.addMemory({
      id: 'user-ack',
      type: 'interaction',
      content: 'User acknowledged temperature alert',
      createdAt: new Date(),
      scope: 'local',
      tags: ['user', 'acknowledgment'],
      confidence: 0.90,
      links: ['obs-temp-spike']
    });

    reflector.addMemory({
      id: 'system-baseline',
      type: 'observation',
      content: 'System returned to baseline temperature',
      createdAt: new Date(),
      scope: 'local',
      tags: ['temperature', 'baseline', 'recovery'],
      confidence: 0.85,
      links: ['user-ack']
    });

    // Inject test memory
    reflector.graph = testMemory;
    console.log('🧪 [TEST] Injected test memory nodes for pattern detection');

    // Run initial reflection
    await reflector.run();

    // Set up periodic cycles
    setInterval(async () => {
      try {
        console.log('🧠 [LOOP] Triggering Athena reflection cycle...');
        await reflector.run();
      } catch (error) {
        console.error('❌ [ERROR] Reflection cycle failed:', error);
      }
    }, 10000);

    setInterval(async () => {
      try {
        console.log('🛠️ [LOOP] Triggering planning cycle...');
        await engine.runPlanningCycle();
      } catch (error) {
        console.error('❌ [ERROR] Planning cycle failed:', error);
      }
    }, 15000);

    console.log('✅ Athena is now operational and running cycles');
    console.log('📊 [STATUS] Watching for reflection every 10s, planning every 15s');
    
  } catch (error) {
    console.error('💥 [FATAL] Athena failed to start:', error);
    process.exit(1);
  }
})();
