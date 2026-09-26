// ============================================
// APARTMENT AI EMERGENCY SYSTEM - TYPE DEFINITIONS
// ============================================

/**
 * Resident information for emergency contact
 */
export interface Resident {
  id: string;
  name: string;
  phone: string;
  apartment: string;
  floor: number;
  isVIP?: boolean;
}

/**
 * Types of emergencies the system can handle
 */
export type EmergencyType = 'fire' | 'water' | 'security';

/**
 * Emergency request body from frontend
 */
export interface EmergencyRequest {
  type: EmergencyType;
  message?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Vapi API call request body
 */
export interface VapiCallRequest {
  assistantId: string;
  phoneNumberId: string;
  customer: {
    number: string;
    name?: string;
  };
  assistantOverrides?: {
    firstMessage?: string;
    variableValues?: Record<string, string>;
  };
}

/**
 * Vapi API call response
 */
export interface VapiCallResponse {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  phoneCallProvider: string;
  phoneCallProviderId: string;
  assistantId: string;
  customer: {
    number: string;
    name?: string;
  };
}

/**
 * Emergency call result for a single resident
 */
export interface CallResult {
  residentId: string;
  residentName: string;
  phone: string;
  success: boolean;
  callId?: string;
  error?: string;
  timestamp: string;
}

/**
 * API response for emergency trigger
 */
export interface EmergencyResponse {
  success: boolean;
  emergencyType: EmergencyType;
  totalResidents: number;
  callsInitiated: number;
  callsFailed: number;
  results: CallResult[];
  timestamp: string;
}

/**
 * Vapi webhook event types
 */
export type VapiWebhookEventType = 
  | 'call.started'
  | 'call.ringing'
  | 'call.answered'
  | 'call.ended'
  | 'speech.started'
  | 'speech.ended'
  | 'transcript'
  | 'function.call'
  | 'hang'
  | 'error';

/**
 * Vapi webhook payload
 */
export interface VapiWebhookPayload {
  message: {
    type: VapiWebhookEventType;
    call?: VapiCallResponse;
    timestamp?: string;
    transcript?: string;
    endedReason?: string;
    [key: string]: unknown;
  };
}

/**
 * Agent configuration mapping
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

/**
 * System statistics
 */
export interface SystemStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageCallDuration: number;
  lastEmergency?: {
    type: EmergencyType;
    timestamp: string;
  };
}