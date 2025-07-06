
import 'reflect-metadata';
import { AthenaReflectorService } from './src/athenaReflectorService';
import { AutonomousExecutionEngine } from './src/AutonomousExecutionEngine';
import { MemoryGraph } from './src/memory-graph';
import { SecurityContractEngine } from './src/SecurityContractEngine';

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

    // Initialize Security Contract Engine
    const securityEngine = new SecurityContractEngine();
    securityEngine.addContract({
      id: 'test-contract-001',
      scope: ['memory', 'reflection'],
      permissions: ['read', 'write', 'reflect'],
      restrictions: ['no-external-share'],
      redactionRules: [
        {
          pattern: /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g,
          replacement: '[REDACTED-CARD]',
          severity: 'high'
        }
      ]
    });
    console.log('✅ [SECURITY] Security Contract Engine initialized');

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
      content: 'User acknowledged the temperature alert',
      createdAt: new Date(),
      scope: 'local',
      tags: ['user-interaction', 'acknowledged'],
      confidence: 0.90,
      links: ['obs-temp-spike']
    });

    reflector.addMemory({
      id: 'system-recovery',
      type: 'observation',
      content: 'Temperature returned to baseline levels',
      createdAt: new Date(),
      scope: 'local',
      tags: ['recovery', 'baseline'],
      confidence: 0.92,
      links: ['user-ack']
    });

    console.log('✅ [MEMORY] Test memory nodes loaded');

    // Start reflection cycles
    const reflectionInterval = setInterval(async () => {
      console.log('🔄 [CYCLE] Running reflection cycle...');
      await reflector.run();
    }, 10000);

    // Start planning cycles
    const planningInterval = setInterval(async () => {
      console.log('🛠️ [CYCLE] Running planning cycle...');
      await engine.runPlanningCycle();
    }, 15000);

    console.log('✅ Athena is now operational and running cycles');
    console.log('📊 [STATUS] Watching for reflection every 10s, planning every 15s');

    // Graceful shutdown handlers
    const shutdown = () => {
      console.log('🛑 [SHUTDOWN] Athena is shutting down gracefully...');
      clearInterval(reflectionInterval);
      clearInterval(planningInterval);
      console.log('✅ [SHUTDOWN] All cycles stopped');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('💥 [FATAL] Athena failed to start:', error);
    process.exit(1);
  }
})();
