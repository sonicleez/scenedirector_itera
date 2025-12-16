// Popup script for Genyu Extension
const $ = id => document.getElementById(id);
const logEl = $('log');

function log(msg, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

// Check server connection
async function pingServer() {
    $('serverStatus').textContent = 'Checking...';
    $('serverStatus').className = 'value pending';

    try {
        const response = await fetch('http://localhost:3001/api/tokens', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            $('serverStatus').textContent = '✅ Connected';
            $('serverStatus').className = 'value ok';

            if (data.hasRecaptcha && data.recaptchaToken) {
                $('tokenStatus').textContent = '✅ Has Token';
                $('tokenStatus').className = 'value ok';
                $('tokenLength').textContent = (data.recaptchaLength || 0) + ' chars';

                if (data.tokenAgeSeconds !== null && data.tokenAgeSeconds !== undefined) {
                    $('lastCapture').textContent = data.tokenAgeSeconds + 's ago';
                }
            } else {
                $('tokenStatus').textContent = '❌ No Token';
                $('tokenStatus').className = 'value error';
            }

            log(`Server OK. Token: ${data.hasRecaptcha ? 'Yes' : 'No'}`, 'success');
            return data;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (e) {
        $('serverStatus').textContent = '❌ Offline';
        $('serverStatus').className = 'value error';
        log(`Server error: ${e.message}`, 'error');
        return null;
    }
}

// Check local storage for captured tokens
async function checkStoredToken() {
    log('Checking chrome.storage.local...');

    chrome.storage.local.get(['lastToken', 'lastCapture'], (result) => {
        if (result.lastToken) {
            log(`Stored token: ${result.lastToken.substring(0, 30)}...`, 'success');
            log(`Captured at: ${result.lastCapture || 'unknown'}`, 'info');
        } else {
            log('No token in local storage', 'error');
        }
    });
}

// Clear storage
function clearStorage() {
    chrome.storage.local.clear(() => {
        log('Storage cleared', 'info');
        $('tokenStatus').textContent = '❌ Cleared';
        $('tokenStatus').className = 'value error';
        $('tokenLength').textContent = '-';
        $('lastCapture').textContent = 'Never';
    });
}

// Test manual capture (send fake token to server)
async function testManualCapture() {
    log('Sending test token to server...');

    try {
        const testToken = '0cAFcWeA_TEST_TOKEN_' + Date.now();
        const response = await fetch('http://localhost:3001/api/update-tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recaptchaToken: testToken,
                projectId: 'test-project-id'
            })
        });

        if (response.ok) {
            log('Test token sent successfully!', 'success');
            await pingServer(); // Refresh status
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (e) {
        log(`Failed to send: ${e.message}`, 'error');
    }
}

// Event listeners
$('pingServer').addEventListener('click', pingServer);
$('checkToken').addEventListener('click', checkStoredToken);
$('clearStorage').addEventListener('click', clearStorage);
$('testCapture').addEventListener('click', testManualCapture);

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOKEN_CAPTURED') {
        log(`Token captured! Length: ${message.length}`, 'success');
        pingServer();
    }
});

// Initial check
pingServer();
