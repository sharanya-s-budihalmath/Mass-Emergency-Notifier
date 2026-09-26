// ============================================
// APARTMENT AI EMERGENCY SYSTEM - MAIN SERVER
// ============================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import {
  Resident,
  EmergencyType,
  EmergencyRequest,
  EmergencyResponse,
  CallResult,
  VapiCallRequest,
  VapiCallResponse,
  VapiWebhookPayload,
  SystemStats
} from './types';

// Load environment variables
dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3000;
const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || '';
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Log if API key is loaded
console.log('🔑 API Key loaded:', VAPI_API_KEY ? `${VAPI_API_KEY.substring(0, 8)}...` : 'NOT FOUND');

// ============================================
// AGENT ID MAPPING - REPLACE WITH YOUR REAL IDs
// ============================================

const agentIds: Record<EmergencyType, string> = {
  fire: 'b6d78940-4fa7-4116-bf8c-55483ec585e4',       // Replace with your Fire Emergency Assistant ID
  water: '75e6811b-6bde-4b3f-92e9-f9751634ccc3',      // Replace with your Water Scarcity Assistant ID
  security: 'f6fafd76-f3d8-422f-b82e-e6a09b050f60' // Replace with your Security Alert Assistant ID
};

// Agent configurations for frontend display
const agentConfigs: Record<EmergencyType, { name: string; description: string; firstMessage: string }> = {
  fire: {
    name: 'Fire Emergency Response',
    description: 'Immediate evacuation and fire safety instructions',
    firstMessage: 'URGENT: This is an emergency notification from your building management. A fire has been reported in the building. Please evacuate immediately using the stairs. Do not use elevators. Proceed to the designated assembly point outside. Is everyone in your apartment aware of this emergency?'
  },
  water: {
    name: 'Water Scarcity Alert',
    description: 'Water supply interruption notifications',
    firstMessage: 'Hello, this is an important notification from your building management. We are experiencing a water supply interruption. Please conserve water and avoid using washing machines or dishwashers until further notice. Do you have any questions about this situation?'
  },
  security: {
    name: 'Security Alert System',
    description: 'Security incidents and safety measures',
    firstMessage: 'ATTENTION: This is a security alert from your building management. We are currently addressing a security concern in the building. Please remain inside your apartment, lock your doors, and do not open for anyone except identified security personnel. Are you currently safe in your apartment?'
  }
};

// ============================================
// MOCK RESIDENT DATA - UPDATE WITH REAL PHONE NUMBERS
// ============================================

const residents: Resident[] = [
  {
    id: 'res-001',
    name: 'Sharath',
    phone: '+916363226830',  // Your phone number
    apartment: '101',
    floor: 1,
    isVIP: true
  },
  {
    id: 'res-002',
    name: 'Sanju',
    phone: '+918618706393',  // Make sure this is 10 digits after +91
    apartment: '205',
    floor: 2,
    isVIP: false
  },
  {
    id: 'res-003',
    name: 'Syed',
    phone: '+917338668261',
    apartment: '310',
    floor: 3,
    isVIP: false
  }
];

// ============================================
// SYSTEM STATISTICS (In-Memory)
// ============================================

let systemStats: SystemStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  averageCallDuration: 0
};

const callLogs: Array<{
  timestamp: string;
  type: VapiWebhookPayload['message']['type'];
  callId?: string;
  details: string;
}> = [];

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Make a phone call using Vapi AI
 */
async function makeVapiCall(
  resident: Resident,
  emergencyType: EmergencyType
): Promise<{ success: boolean; data?: VapiCallResponse; error?: string }> {
  try {
    const assistantId = agentIds[emergencyType];
    const config = agentConfigs[emergencyType];

    const payload: VapiCallRequest = {
      assistantId,
      phoneNumberId: VAPI_PHONE_NUMBER_ID,
      customer: {
        number: resident.phone,
        name: resident.name
      },
      assistantOverrides: {
        firstMessage: config.firstMessage,
        variableValues: {
          residentName: resident.name,
          apartmentNumber: resident.apartment,
          floorNumber: resident.floor.toString(),
          emergencyType: emergencyType.toUpperCase()
        }
      }
    };

    console.log(`📞 Calling ${resident.name} (${resident.phone})...`);

    const response = await axios.post<VapiCallResponse>(
      `${VAPI_BASE_URL}/call/phone`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };

  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data 
      ? JSON.stringify(axiosError.response.data) 
      : axiosError.message;
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    vapiConfigured: !!VAPI_API_KEY && VAPI_API_KEY !== 'your_vapi_api_key_here'
  });
});

/**
 * GET /api/residents - Get all residents
 */
app.get('/api/residents', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: residents.length,
    residents: residents.map(r => ({
      ...r,
      phone: r.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') // Mask phone numbers
    }))
  });
});

/**
 * GET /api/stats - Get system statistics
 */
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: systemStats,
    recentLogs: callLogs.slice(-20)
  });
});

/**
 * GET /api/agents - Get agent configurations
 */
app.get('/api/agents', (req: Request, res: Response) => {
  res.json({
    success: true,
    agents: Object.entries(agentConfigs).map(([type, config]) => ({
      type,
      ...config,
      configured: agentIds[type as EmergencyType] !== `${type.toUpperCase()}_AGENT_ID`
    }))
  });
});

/**
 * POST /api/emergency - Trigger emergency calls to all residents
 * ✅ PARALLEL CALLS - All phones ring at the same time!
 */
app.post('/api/emergency', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { type, priority } = req.body as EmergencyRequest;

    // Validate emergency type
    if (!type || !['fire', 'water', 'security'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid emergency type. Must be: fire, water, or security'
      });
    }

    console.log('');
    console.log('🚨 ═══════════════════════════════════════════════════════');
    console.log(`🚨 EMERGENCY ALERT TRIGGERED: ${type.toUpperCase()}`);
    console.log(`🚨 Priority: ${priority || 'HIGH'}`);
    console.log(`🚨 Residents to notify: ${residents.length}`);
    console.log('🚨 ═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📞 Initiating ALL calls simultaneously...');
    console.log('');

    // ✅ PARALLEL CALLS - All at the same time!
    const callPromises = residents.map(async (resident) => {
      const result: CallResult = {
        residentId: resident.id,
        residentName: resident.name,
        phone: resident.phone,
        success: false,
        timestamp: new Date().toISOString()
      };

      try {
        const callResponse = await makeVapiCall(resident, type);

        if (callResponse.success && callResponse.data) {
          result.success = true;
          result.callId = callResponse.data.id;
          console.log(`✅ ${resident.name} - Call initiated (ID: ${callResponse.data.id})`);
        } else {
          result.success = false;
          result.error = callResponse.error;
          console.log(`❌ ${resident.name} - Failed: ${callResponse.error}`);
        }
      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ ${resident.name} - Error: ${result.error}`);
      }

      return result;
    });

    // ✅ Wait for ALL calls to complete simultaneously
    const results = await Promise.all(callPromises);

    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    // Update system stats
    systemStats.totalCalls += residents.length;
    systemStats.successfulCalls += successCount;
    systemStats.failedCalls += failCount;
    systemStats.lastEmergency = {
      type,
      timestamp: new Date().toISOString()
    };

    const response: EmergencyResponse = {
      success: true,
      emergencyType: type,
      totalResidents: residents.length,
      callsInitiated: successCount,
      callsFailed: failCount,
      results,
      timestamp: new Date().toISOString()
    };

    const duration = Date.now() - startTime;
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Emergency broadcast completed in ${duration}ms`);
    console.log(`   📞 Total Calls: ${residents.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    res.json(response);

  } catch (error) {
    console.error('❌ Emergency broadcast failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process emergency request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-call - Test call to a single number
 */
app.post('/api/test-call', async (req: Request, res: Response) => {
  try {
    const { phone, type = 'fire' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const testResident: Resident = {
      id: 'test-001',
      name: 'Test User',
      phone,
      apartment: 'TEST',
      floor: 0
    };

    console.log(`🧪 Initiating test call to ${phone}`);

    const result = await makeVapiCall(testResident, type as EmergencyType);

    res.json({
      success: result.success,
      callId: result.data?.id,
      error: result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test call failed:', error);
    res.status(500).json({
      success: false,
      error: 'Test call failed'
    });
  }
});

/**
 * POST /api/webhook - Vapi webhook endpoint
 */
app.post('/api/webhook', (req: Request, res: Response) => {
  const payload = req.body as VapiWebhookPayload;
  const timestamp = new Date().toISOString();

  console.log('');
  console.log('📥 ─────────────────────────────────────────');
  console.log('📥 VAPI WEBHOOK RECEIVED');
  console.log(`📥 Timestamp: ${timestamp}`);
  console.log(`📥 Event Type: ${payload.message?.type}`);
  
  if (payload.message?.call) {
    console.log(`📥 Call ID: ${payload.message.call.id}`);
    console.log(`📥 Status: ${payload.message.call.status}`);
  }

  if (payload.message?.transcript) {
    console.log(`📥 Transcript: ${payload.message.transcript}`);
  }

  if (payload.message?.endedReason) {
    console.log(`📥 Ended Reason: ${payload.message.endedReason}`);
  }

  console.log('📥 ─────────────────────────────────────────');
  console.log('');

  // Log the event
  callLogs.push({
    timestamp,
    type: payload.message?.type,
    callId: payload.message?.call?.id,
    details: JSON.stringify(payload.message).substring(0, 200)
  });

  // Keep only last 100 logs
  if (callLogs.length > 100) {
    callLogs.shift();
  }

  // Vapi expects a 200 response
  res.status(200).json({ received: true });
});

/**
 * GET /api/logs - Get recent webhook logs
 */
app.get('/api/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: callLogs.length,
    logs: callLogs.slice(-50).reverse()
  });
});

// ============================================
// SERVE FRONTEND
// ============================================

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🏢 APARTMENT AI EMERGENCY SYSTEM                        ║');
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║   🌐 Server running on: http://localhost:${PORT}             ║`);
  console.log(`║   📊 Health check: http://localhost:${PORT}/api/health       ║`);
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║   📋 ENDPOINTS:                                           ║');
  console.log('║   • GET  /api/health     - System health check            ║');
  console.log('║   • GET  /api/residents  - List all residents             ║');
  console.log('║   • GET  /api/stats      - System statistics              ║');
  console.log('║   • POST /api/emergency  - Trigger emergency calls        ║');
  console.log('║   • POST /api/webhook    - Vapi webhook receiver          ║');
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║   ⚡ PARALLEL CALLING ENABLED - All phones ring at once!  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;