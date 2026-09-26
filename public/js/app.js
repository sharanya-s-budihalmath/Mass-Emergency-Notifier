// ============================================
// APARTMENT AI EMERGENCY SYSTEM - FRONTEND APP
// ============================================

// API Base URL
const API_BASE = window.location.origin;

// State Management
let currentEmergencyType = null;
let isProcessing = false;
let residents = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏢 Apartment AI Emergency System Initialized');
    
    // Initialize the app
    checkSystemHealth();
    loadResidents();
    loadStats();
    updateClock();
    
    // Update clock every second
    setInterval(updateClock, 1000);
    
    // Refresh stats every 30 seconds
    setInterval(loadStats, 30000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
});

// ============================================
// SYSTEM HEALTH CHECK
// ============================================

async function checkSystemHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        
        const statusDot = document.getElementById('systemStatus');
        const statusText = document.getElementById('statusText');
        
        if (data.status === 'healthy') {
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');
            
            if (data.vapiConfigured) {
                statusText.textContent = 'System Online';
            } else {
                statusText.textContent = 'Demo Mode';
                showToast('warning', 'Demo Mode', 'Vapi API key not configured. Running in demo mode.');
            }
        } else {
            statusDot.classList.add('offline');
            statusDot.classList.remove('online');
            statusText.textContent = 'System Offline';
        }
        
        addLogEntry('info', 'System health check completed');
        
    } catch (error) {
        console.error('Health check failed:', error);
        const statusDot = document.getElementById('systemStatus');
        const statusText = document.getElementById('statusText');
        statusDot.classList.add('offline');
        statusText.textContent = 'Connection Error';
        
        showToast('error', 'Connection Error', 'Unable to connect to the server.');
    }
}

// ============================================
// LOAD RESIDENTS
// ============================================

async function loadResidents() {
    try {
        const response = await fetch(`${API_BASE}/api/residents`);
        const data = await response.json();
        
        if (data.success) {
            residents = data.residents;
            renderResidents(residents);
            document.getElementById('residentCount').textContent = data.count;
            document.getElementById('residentCountModal').textContent = data.count;
        }
    } catch (error) {
        console.error('Failed to load residents:', error);
        showToast('error', 'Error', 'Failed to load residents data.');
    }
}

function renderResidents(residents) {
    const grid = document.getElementById('residentsGrid');
    
    if (!residents || residents.length === 0) {
        grid.innerHTML = `
            <div class="log-empty">
                <span class="log-empty-icon">👥</span>
                <span>No residents registered</span>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = residents.map(resident => {
        const initials = resident.name.split(' ').map(n => n[0]).join('');
        const isVip = resident.isVIP;
        
        return `
            <div class="resident-card ${isVip ? 'vip' : ''}">
                <div class="resident-avatar">${initials}</div>
                <div class="resident-info">
                    <div class="resident-name">
                        ${resident.name}
                        ${isVip ? '<span class="vip-badge">VIP</span>' : ''}
                    </div>
                    <div class="resident-details">
                        <span class="resident-apt">Apt ${resident.apartment}</span>
                        <span class="resident-floor">Floor ${resident.floor}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD STATISTICS
// ============================================

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalCalls').textContent = data.stats.totalCalls;
            document.getElementById('successCalls').textContent = data.stats.successfulCalls;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// ============================================
// UPDATE CLOCK
// ============================================

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    document.getElementById('currentTime').textContent = time;
}

// ============================================
// TRIGGER EMERGENCY
// ============================================

function triggerEmergency(type) {
    if (isProcessing) {
        showToast('warning', 'Please Wait', 'An emergency broadcast is already in progress.');
        return;
    }
    
    currentEmergencyType = type;
    
    // Update modal content based on type
    const modal = document.getElementById('confirmModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const confirmBtn = document.getElementById('confirmBtn');
    
    const emergencyInfo = {
        fire: {
            icon: '🔥',
            title: 'Confirm Fire Emergency',
            description: 'This will trigger immediate evacuation calls to all residents with fire safety instructions.',
            color: 'var(--accent-fire)'
        },
        water: {
            icon: '💧',
            title: 'Confirm Water Scarcity Alert',
            description: 'This will notify all residents about the water supply interruption and conservation guidelines.',
            color: 'var(--accent-water)'
        },
        security: {
            icon: '🛡️',
            title: 'Confirm Security Alert',
            description: 'This will alert all residents about the security incident with safety instructions.',
            color: 'var(--accent-security)'
        }
    };
    
    const info = emergencyInfo[type];
    modalIcon.textContent = info.icon;
    modalTitle.textContent = info.title;
    modalDescription.textContent = info.description;
    confirmBtn.style.background = `linear-gradient(135deg, ${info.color}, ${info.color}dd)`;
    
    // Show modal
    modal.classList.add('active');
    
    // Add escape key listener
    document.addEventListener('keydown', handleModalEscape);
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    currentEmergencyType = null;
    document.removeEventListener('keydown', handleModalEscape);
}

function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// ============================================
// CONFIRM EMERGENCY
// ============================================

async function confirmEmergency() {
    if (!currentEmergencyType || isProcessing) return;
    
    const confirmBtn = document.getElementById('confirmBtn');
    const confirmBtnText = document.getElementById('confirmBtnText');
    
    // Set loading state
    isProcessing = true;
    confirmBtn.classList.add('loading');
    confirmBtn.disabled = true;
    confirmBtnText.textContent = 'Processing...';
    
    try {
        addLogEntry(currentEmergencyType, `Initiating ${currentEmergencyType.toUpperCase()} emergency broadcast...`);
        
        const response = await fetch(`${API_BASE}/api/emergency`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: currentEmergencyType,
                priority: 'critical'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Emergency Broadcast Sent', 
                `${data.callsInitiated} calls initiated to ${data.totalResidents} residents.`);
            
            addLogEntry('success', 
                `Emergency broadcast completed: ${data.callsInitiated} successful, ${data.callsFailed} failed`);
            
            // Log individual results
            data.results.forEach(result => {
                if (result.success) {
                    addLogEntry('success', `✓ Call to ${result.residentName} initiated (ID: ${result.callId})`);
                } else {
                    addLogEntry('error', `✗ Call to ${result.residentName} failed: ${result.error}`);
                }
            });
            
            // Refresh stats
            loadStats();
            
        } else {
            showToast('error', 'Broadcast Failed', data.error || 'An error occurred.');
            addLogEntry('error', `Emergency broadcast failed: ${data.error}`);
        }
        
    } catch (error) {
        console.error('Emergency request failed:', error);
        showToast('error', 'Request Failed', 'Unable to connect to the server.');
        addLogEntry('error', `Request error: ${error.message}`);
    } finally {
        // Reset loading state
        isProcessing = false;
        confirmBtn.classList.remove('loading');
        confirmBtn.disabled = false;
        confirmBtnText.textContent = 'Confirm & Send';
        closeModal();
    }
}

// ============================================
// ACTIVITY LOG
// ============================================

function addLogEntry(type, message) {
    const logContainer = document.getElementById('activityLog');
    const emptyState = logContainer.querySelector('.log-empty');
    
    if (emptyState) {
        emptyState.remove();
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-type ${type}">${type}</span>
        <span class="log-message">${message}</span>
    `;
    
    // Add to top of log
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Keep only last 50 entries
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[entries.length - 1].remove();
    }
}

function clearLogs() {
    const logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = `
        <div class="log-empty">
            <span class="log-empty-icon">📭</span>
            <span>No activity yet. Trigger an emergency to see logs.</span>
        </div>
    `;
    showToast('info', 'Logs Cleared', 'Activity log has been cleared.');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="dismissToast(this)">×</button>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            dismissToast(toast.querySelector('.toast-close'));
        }
    }, 5000);
}

function dismissToast(button) {
    const toast = button.closest('.toast');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboardShortcuts(e) {
    // Only handle if modal is not open and not typing in an input
    if (document.getElementById('confirmModal').classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key.toLowerCase()) {
        case 'f':
            if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser find
            triggerEmergency('fire');
            break;
        case 'w':
            triggerEmergency('water');
            break;
        case 's':
            if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser save
            triggerEmergency('security');
            break;
        case 'r':
            loadResidents();
            loadStats();
            checkSystemHealth();
            showToast('info', 'Refreshed', 'Data has been refreshed.');
            break;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatPhoneNumber(phone) {
    // Simple phone number masking
    if (phone.length > 6) {
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
    }
    return phone;
}

// Error boundary for async operations
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, url, lineNo, columnNo, error);
    addLogEntry('error', `System error: ${msg}`);
    return false;
};

// Handle unhandled promise rejections
window.onunhandledrejection = function(event) {
    console.error('Unhandled rejection:', event.reason);
    addLogEntry('error', `Unhandled error: ${event.reason}`);
};

// ============================================
// EXPORT FOR TESTING
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        triggerEmergency,
        confirmEmergency,
        showToast,
        addLogEntry
    };
}