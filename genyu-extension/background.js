// Background v8.0 - Token Pool System
console.log('[Genyu BG] Background v8.0 - Token Pool System');

// ==================== TOKEN POOL ====================
const TOKEN_POOL = [];
const MAX_TOKEN_AGE = 90000; // 90 seconds
const GENERATE_INTERVAL = 5000; // 5 seconds

// Generate fresh reCAPTCHA token and add to pool
async function generateAndPoolToken() {
    try {
        const tabs = await chrome.tabs.query({});
        const labsTab = tabs.find(tab =>
            tab.url && (tab.url.includes('labs.google.com') || tab.url.includes('labs.google'))
        );

        if (!labsTab) {
            console.log('[Token Pool] ⚠️ No labs.google tab - skipping generation');
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: labsTab.id },
            func: async () => {
                if (typeof grecaptcha === 'undefined') {
                    return { error: 'grecaptcha not loaded' };
                }

                try {
                    const token = await grecaptcha.enterprise.execute(
                        "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV",
                        { action: "FLOW_GENERATION" }
                    );
                    return { token };
                } catch (e) {
                    return { error: e.message };
                }
            },
            world: 'MAIN'
        });

        const result = results[0]?.result;

        if (result?.token) {
            const tokenObj = {
                token: result.token,
                timestamp: Date.now(),
                used: false
            };

            TOKEN_POOL.push(tokenObj);
            console.log(`[Token Pool] ✅ Added token (Pool size: ${TOKEN_POOL.length})`);

            // Clean old tokens and sync to server
            cleanTokenPool();
            syncPoolToServer();
        } else if (result?.error) {
            console.log('[Token Pool] ⚠️ Generation failed:', result.error);
        }
    } catch (e) {
        console.error('[Token Pool] Error:', e.message);
    }
}

// Clean expired tokens from pool
function cleanTokenPool() {
    const now = Date.now();
    const before = TOKEN_POOL.length;

    // Remove tokens older than MAX_TOKEN_AGE or already used
    for (let i = TOKEN_POOL.length - 1; i >= 0; i--) {
        const age = now - TOKEN_POOL[i].timestamp;
        if (age > MAX_TOKEN_AGE || TOKEN_POOL[i].used) {
            TOKEN_POOL.splice(i, 1);
        }
    }

    const removed = before - TOKEN_POOL.length;
    if (removed > 0) {
        console.log(`[Token Pool] 🧹 Cleaned ${removed} tokens (Pool size: ${TOKEN_POOL.length})`);
    }
}

// Send pool to server
async function syncPoolToServer() {
    try {
        cleanTokenPool(); // Clean first

        const availableTokens = TOKEN_POOL.filter(t => !t.used);

        await fetch('http://localhost:3001/api/update-token-pool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tokens: availableTokens.map(t => ({
                    token: t.token,
                    age: Math.round((Date.now() - t.timestamp) / 1000)
                }))
            })
        });

        console.log(`[Token Pool] 📤 Synced ${availableTokens.length} tokens to server`);
    } catch (e) {
        // Server might be down
    }
}

// Get fresh token from pool
function getTokenFromPool() {
    cleanTokenPool(); // Clean first

    // Find newest unused token
    const availableTokens = TOKEN_POOL.filter(t => !t.used);

    if (availableTokens.length === 0) {
        console.log('[Token Pool] ⚠️ No tokens available in pool');
        return null;
    }

    // Get newest token
    const newestToken = availableTokens.reduce((newest, current) =>
        current.timestamp > newest.timestamp ? current : newest
    );

    // Mark as used
    newestToken.used = true;

    const age = Date.now() - newestToken.timestamp;
    console.log(`[Token Pool] ✅ Retrieved token (age: ${Math.round(age / 1000)}s, remaining: ${availableTokens.length - 1})`);

    return newestToken.token;
}

// Start auto-generation
setInterval(generateAndPoolToken, GENERATE_INTERVAL);
generateAndPoolToken(); // Generate first token immediately

console.log(`[Token Pool] 🔄 Auto-generating tokens every ${GENERATE_INTERVAL / 1000}s`);

// ==================== SESSION TOKEN AUTO-SEND ====================
let lastSessionToken = null;

async function checkAndSendSessionToken() {
    try {
        const cookie = await chrome.cookies.get({
            url: 'https://labs.google.com',
            name: '__Secure-next-auth.session-token'
        });

        if (cookie && cookie.value && cookie.value !== lastSessionToken) {
            lastSessionToken = cookie.value;

            await fetch('http://localhost:3001/api/update-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: cookie.value })
            });

            console.log('[Session Token] ✅ Auto-sent to server');
        }
    } catch (e) {
        // Ignore
    }
}

setInterval(checkAndSendSessionToken, 5000);
checkAndSendSessionToken();

// ==================== API FOR APP ====================
// Listen for token requests from App
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_RECAPTCHA_TOKEN') {
        const token = getTokenFromPool();
        sendResponse({ token });
    }
    return true; // Keep channel open for async response
});

// Endpoint to get pool status
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_POOL_STATUS') {
        const availableTokens = TOKEN_POOL.filter(t => !t.used).length;
        sendResponse({
            totalTokens: TOKEN_POOL.length,
            availableTokens: availableTokens,
            maxAge: MAX_TOKEN_AGE / 1000
        });
    }
    return true;
});

console.log('[Genyu BG] ✅ Ready - Token Pool + Session Token Auto-send');
