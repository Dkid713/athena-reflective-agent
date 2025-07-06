
import 'reflect-metadata';
import { AthenaReflectorService } from './src/athenaReflectorService';
import { AutonomousExecutionEngine } from './src/AutonomousExecutionEngine';
import { MemoryGraph } from './src/memory-graph';
import { SecurityContractEngine } from './src/SecurityContractEngine';
import { DataFeedEngine } from './src/DataFeedEngine';
import { OutlookSentimentEngine } from './src/OutlookSentimentEngine';

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

    // Initialize Data Feed Engine
    const dataFeedEngine = new DataFeedEngine();
    dataFeedEngine.setReflector(reflector['reflector']);
    await dataFeedEngine.startDataIngestion();
    console.log('✅ [DATA FEEDS] Data Feed Engine activated - monitoring arXiv, PubMed, Google News, and Market Data');

    // Initialize Outlook Sentiment Engine
    const sentimentEngine = new OutlookSentimentEngine();
    sentimentEngine.setReflector(reflector['reflector']);
    await sentimentEngine.startSentimentAnalysis();
    console.log('✅ [SENTIMENT] Outlook Sentiment Engine activated - analyzing market and social sentimentalized');

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

    // Start reflection cycles with enhanced monitoring
    const reflectionInterval = setInterval(async () => {
      console.log('🔄 [CYCLE] Running enhanced reflection cycle...');
      await reflector.run();
      
      // Log data feed status every 10th cycle
      if (Date.now() % (10 * 3 * 60 * 1000) < 1000) {
        const feedStatus = dataFeedEngine.getFeedStatus();
        const sentimentSummary = sentimentEngine.getSentimentSummary();
        
        console.log('📊 [STATUS] Data Feed Status:', feedStatus);
        console.log('💭 [STATUS] Sentiment Summary:', sentimentSummary);
      }
    }, 30000); // Reduced from 10s to 30s

    // Start planning cycles
    const planningInterval = setInterval(async () => {
      console.log('🛠️ [CYCLE] Running planning cycle...');
      await engine.runPlanningCycle();
    }, 45000); // Reduced from 15s to 45s

    console.log('✅ Athena is now operational and running cycles');
    console.log('📊 [STATUS] Watching for reflection every 30s, planning every 45s');

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
