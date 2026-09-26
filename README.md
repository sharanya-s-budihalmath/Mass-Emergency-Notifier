Core Sections
Project Overview - Clear description of what the system does

✨ Features - Organized list of all capabilities including:

Emergency types (Fire, Water, Security)
Voice calling capabilities
Real-time monitoring
Beautiful UI
Keyboard shortcuts
🏗️ Architecture - Complete tech stack breakdown:

Frontend: HTML5, CSS3, JavaScript
Backend: TypeScript, Express.js, Vapi AI
All components explained
🚀 Getting Started - Step-by-step installation guide:

Prerequisites
Installation steps
Environment configuration
Build & run commands
📋 API Endpoints - Complete documentation of all endpoints:

Health checks
Resident management
Statistics
Emergency operations
Testing endpoints
Webhook handling
🔧 Configuration - How to:

Update residents
Configure AI agents
Customize messages
📦 Project Structure - Visual directory layout

🔐 Security Considerations - Important security practices

Type Definitions - TypeScript interfaces explained

Usage Examples - curl commands for API testing

Additional Sections - UI features, troubleshooting, phone format, contributing guidelines, future enhancements, and disclaimers

The README is now live in your repository and ready to help users understand and use your emergency notification system!

Make these code changes?
README.md

md
# 🏢 Apartment AI Emergency System

A sophisticated voice-based emergency notification system that uses AI-powered calling to instantly alert all apartment residents during critical situations. Built with **Vapi AI** for intelligent voice communications and a modern full-stack architecture.

![Language](https://img.shields.io/badge/Languages-TypeScript%20%7C%20JavaScript%20%7C%20CSS%20%7C%20HTML-blue)
![Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🚨 Emergency Types
- **Fire Emergency** - Immediate evacuation alerts with fire safety instructions
- **Water Scarcity** - Water supply interruption notifications with conservation guidelines
- **Security Alert** - Security incident warnings with safety protocols

### 📞 Intelligent Voice Calling
- **Parallel Calling System** - All residents receive calls simultaneously
- **AI-Powered Responses** - Smart agents handle resident interactions
- **Customizable Messages** - Personalized emergency instructions with resident details
- **Multi-Variable Support** - Dynamic message customization (name, apartment, floor, emergency type)

### 📊 Real-Time Monitoring
- **Live Dashboard** - Beautiful, responsive UI with real-time statistics
- **Call Tracking** - Monitor success/failure of each emergency broadcast
- **Activity Logging** - Comprehensive event logs with timestamps
- **System Health Checks** - Real-time API connectivity monitoring

### 🎨 Modern User Interface
- **Animated Dashboard** - Glassmorphism design with gradient backgrounds
- **Emergency Controls** - Large, intuitive buttons for each emergency type
- **Resident Management** - Visual cards displaying resident information
- **Toast Notifications** - Real-time feedback on operations
- **Modal Confirmations** - Safety confirmations before triggering emergencies

### ⌨️ Keyboard Shortcuts
- `F` - Trigger Fire Emergency
- `W` - Trigger Water Scarcity Alert
- `S` - Trigger Security Alert
- `R` - Refresh all data

---

## 🏗️ Architecture

### Frontend Stack
- **HTML5** - Semantic markup with accessibility
- **CSS3** - Advanced styling with animations and glassmorphism effects
- **JavaScript** - Client-side logic and API interactions

### Backend Stack
- **TypeScript** - Type-safe server code
- **Express.js** - REST API and server framework
- **Vapi AI** - Voice calling and AI agent integration
- **Node.js** - Runtime environment

### Key Components

#### Backend (`src/`)
- **server.ts** - Main Express server with API endpoints
- **types.ts** - TypeScript interfaces and type definitions

#### Frontend (`public/`)
- **index.html** - Main HTML structure
- **css/styles.css** - Complete styling and animations
- **js/app.js** - Frontend logic and API interactions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 14.x or higher
- npm or yarn
- Vapi AI API credentials
- Vapi Phone Number ID

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/sharathtgowda11-bit/Mass-emergency-notifier-using-vapi.git
cd Mass-emergency-notifier-using-vapi
Install Dependencies
bash
npm install
Configure Environment Variables
bash
cp .env.example .env
Update .env with your credentials:

env
VAPI_API_KEY=your_vapi_api_key_here
PORT=3000
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
Build TypeScript
bash
npm run build
Start the Server
bash
npm start
The application will be available at http://localhost:3000

📋 API Endpoints
Health & Status
GET /api/health - System health check
Returns: { status, timestamp, version, vapiConfigured }
Residents
GET /api/residents - Get all registered residents
Returns: { success, count, residents }
Note: Phone numbers are masked for security
Statistics
GET /api/stats - Get system statistics
Returns: { stats: { totalCalls, successfulCalls, failedCalls }, recentLogs }
Emergency Operations
POST /api/emergency - Trigger emergency calls
Body: { type: "fire|water|security", priority?: "low|medium|high|critical" }
Returns: { success, emergencyType, callsInitiated, callsFailed, results }
Testing
POST /api/test-call - Test call to a single number
Body: { phone: "+1234567890", type?: "fire|water|security" }
Returns: { success, callId, error }
Webhooks
POST /api/webhook - Vapi webhook receiver for call events
Tracks: call status, transcripts, events
Logs
GET /api/logs - Get recent webhook logs
Returns: { success, count, logs }
🔧 Configuration
Updating Residents
Edit the resident array in src/server.ts:

TypeScript
const residents: Resident[] = [
  {
    id: 'res-001',
    name: 'Resident Name',
    phone: '+91XXXXXXXXXX',
    apartment: '101',
    floor: 1,
    isVIP: true
  },
  // Add more residents...
];
Configuring AI Agents
Replace the agent IDs in src/server.ts:

TypeScript
const agentIds: Record<EmergencyType, string> = {
  fire: 'your_fire_agent_id',
  water: 'your_water_agent_id',
  security: 'your_security_agent_id'
};
Customizing Messages
Modify agent configurations in src/server.ts:

TypeScript
const agentConfigs = {
  fire: {
    name: 'Fire Emergency Response',
    description: 'Immediate evacuation...',
    firstMessage: 'Your custom message here...'
  },
  // Add more configurations...
};
📦 Project Structure
Code
Mass-emergency-notifier-using-vapi/
├── src/
│   ├── server.ts          # Express server & API endpoints
│   └── types.ts           # TypeScript type definitions
├── public/
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # All styling & animations
│   └── js/
│       └── app.js         # Frontend logic
├── dist/                  # Compiled JavaScript (generated)
├── node_modules/          # Dependencies
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Example environment variables
└── README.md              # This file
🔐 Security Considerations
Phone Number Masking - All displayed phone numbers are masked in the UI
API Key Protection - Never commit .env file to repository
HTTPS Recommended - Use HTTPS in production
CORS Configuration - Adjust CORS settings for production domains
Input Validation - All API inputs are validated
Error Handling - Sensitive information is not exposed in error messages
📝 Type Definitions
Resident
TypeScript
interface Resident {
  id: string;
  name: string;
  phone: string;
  apartment: string;
  floor: number;
  isVIP?: boolean;
}
EmergencyRequest
TypeScript
interface EmergencyRequest {
  type: 'fire' | 'water' | 'security';
  message?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}
EmergencyResponse
TypeScript
interface EmergencyResponse {
  success: boolean;
  emergencyType: EmergencyType;
  totalResidents: number;
  callsInitiated: number;
  callsFailed: number;
  results: CallResult[];
  timestamp: string;
}
🎯 Usage Examples
Trigger Fire Emergency via API
bash
curl -X POST http://localhost:3000/api/emergency \
  -H "Content-Type: application/json" \
  -d '{"type":"fire","priority":"critical"}'
Test Call to Phone Number
bash
curl -X POST http://localhost:3000/api/test-call \
  -H "Content-Type: application/json" \
  -d '{"phone":"+911234567890","type":"fire"}'
Get System Statistics
bash
curl http://localhost:3000/api/stats
🎨 UI Features
Dark Mode Design
Professional dark theme with accent colors
Glassmorphism effects with blur backgrounds
Smooth animations and transitions
Responsive Layout
Mobile-friendly design
Adaptive grid layouts
Touch-optimized buttons
Real-Time Updates
Live clock display
Dynamic statistics
Activity log with timestamps
Visual Feedback
Color-coded emergency types
Success/error status indicators
Loading states and animations
🧪 Testing
Health Check
bash
curl http://localhost:3000/api/health
Load Residents
bash
curl http://localhost:3000/api/residents
System Statistics
bash
curl http://localhost:3000/api/stats
📊 System Statistics Tracked
Total Calls - Cumulative count of all emergency broadcasts
Successful Calls - Calls successfully initiated
Failed Calls - Calls that encountered errors
Last Emergency - Information about the most recent emergency
Call Logs - Detailed webhook events and call status updates
🐛 Troubleshooting
API Key Not Recognized
Verify .env file exists and is not committed
Check VAPI_API_KEY format (should start with alphanumeric)
Restart the server after updating .env
Calls Not Going Through
Verify VAPI_PHONE_NUMBER_ID is correct
Check phone numbers have correct country codes
Ensure Vapi account has credits/valid payment method
Review webhook logs in activity log
UI Not Loading
Clear browser cache
Check if static files are being served correctly
Verify public/ directory exists with all files
Connection Errors
Verify server is running on correct port
Check firewall settings
Confirm API base URL is correct
📞 Phone Number Format
Phone numbers must follow international format:

India: +91XXXXXXXXXX (10 digits after country code)
Other Countries: +<country_code><number>
Example: +916363226830

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is open source and available under the MIT License. See the LICENSE file for more details.

🙏 Acknowledgments
Vapi AI - For the powerful voice calling platform
Express.js - For the robust web framework
TypeScript - For type safety and better development experience
📧 Contact & Support
For questions, issues, or suggestions:

Open an issue on GitHub
Contact the repository owner
🎯 Future Enhancements
 SMS fallback notifications
 Email notifications
 Call recording and playback
 Advanced scheduling
 Multi-language support
 Analytics dashboard
 Admin panel for resident management
 Integration with emergency services
⚠️ Disclaimer
This system is designed for emergency notification purposes. Always ensure:

Proper authorization before triggering emergencies
Compliance with local telecommunications regulations
Testing in non-emergency scenarios first
Regular backup of resident data
