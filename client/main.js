document.addEventListener('DOMContentLoaded', function() {
    
    // Verify all required elements exist
    const requiredElements = [
        'textInput', 'tokenInput', 'encodeResult', 'decodeResult',
        'encodeTokenCount', 'decodeTokenCount', 'encodeTokens', 'decodeText',
        'encodeLoading', 'decodeLoading'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
    }

    // Initialize deep linking
    initializeDeepLinking();
});

// Deep linking functionality
function initializeDeepLinking() {
    // Handle initial page load
    handleHashChange();
    
    // Listen for hash changes (back/forward buttons)
    window.addEventListener('hashchange', handleHashChange);
}

function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove the '#'
    
    // Default to 'encode' if no hash or invalid hash
    const validTabs = ['encode', 'decode'];
    const targetTab = validTabs.includes(hash) ? hash : 'encode';
    
    // Switch to the appropriate tab without triggering another hash change
    switchTabByName(targetTab, false);
}

function switchTabByName(tabName, updateHash = true) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to the corresponding tab button
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes(tabName)) {
            button.classList.add('active');
        }
    });
    
    // Update URL hash if requested
    if (updateHash) {
        updateUrlHash(tabName);
    }
}

function updateUrlHash(tabName) {
    // Update URL without triggering hashchange event
    const newUrl = window.location.pathname + window.location.search + '#' + tabName;
    history.replaceState(null, null, newUrl);
}

function switchTab(tabName) {
    // Updated switchTab function that includes deep linking
    switchTabByName(tabName, true);
}

async function encodeText() {
    const textInput = document.getElementById('textInput');
    
    if (!textInput) {
        console.error('Text input element not found');
        return;
    }
    
    const text = textInput.value.trim();
    
    if (!text) {
        showError('encodeResult', 'Please enter some text to encode.');
        return;
    }

    showLoading('encodeLoading');
    hideResult('encodeResult');

    try {
        const response = await fetch('/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to encode text');
        }

        displayEncodeResult(result);
    } catch (error) {
        showError('encodeResult', 'Error: ' + error.message);
    } finally {
        hideLoading('encodeLoading');
    }
}

async function decodeTokens() {
    const tokenInput = document.getElementById('tokenInput');
    
    if (!tokenInput) {
        console.error('Token input element not found');
        return;
    }
    
    const tokenText = tokenInput.value.trim();
    
    if (!tokenText) {
        showError('decodeResult', 'Please enter some tokens to decode.');
        return;
    }

    // Parse comma-separated tokens
    let tokens;
    try {
        tokens = tokenText.split(',').map(t => {
            const num = parseInt(t.trim());
            if (isNaN(num) || num < 0) {
                throw new Error('Invalid token: ' + t.trim());
            }
            return num;
        });
    } catch (error) {
        showError('decodeResult', 'Please enter valid comma-separated numbers.');
        return;
    }

    showLoading('decodeLoading');
    hideResult('decodeResult');

    try {
        const response = await fetch('/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tokens })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to decode tokens');
        }

        displayDecodeResult(result);
    } catch (error) {
        showError('decodeResult', 'Error: ' + error.message);
    } finally {
        hideLoading('decodeLoading');
    }
}

function displayEncodeResult(result) {
    const resultDiv = document.getElementById('encodeResult');
    const tokenCountDiv = document.getElementById('encodeTokenCount');
    const tokensDiv = document.getElementById('encodeTokens');
    
    // Check if elements exist before setting content
    if (!resultDiv || !tokenCountDiv || !tokensDiv) {
        console.error('Required result elements not found');
        return;
    }
    
    tokenCountDiv.textContent = `Token Count: ${result.tokenCount}`;
    
    // Display tokens as plain text (comma-separated) instead of styled spans
    tokensDiv.textContent = result.tokens.join(', ');
    
    resultDiv.classList.remove('error');
    resultDiv.style.display = 'block';
}

function displayDecodeResult(result) {
    const resultDiv = document.getElementById('decodeResult');
    const tokenCountDiv = document.getElementById('decodeTokenCount');
    const textDiv = document.getElementById('decodeText');
    
    // Check if elements exist before setting content
    if (!resultDiv || !tokenCountDiv || !textDiv) {
        console.error('Required result elements not found');
        return;
    }
    
    tokenCountDiv.textContent = `Token Count: ${result.tokenCount}`;
    textDiv.textContent = result.text;
    
    resultDiv.classList.remove('error');
    resultDiv.style.display = 'block';
}

function showError(resultId, message) {
    const resultDiv = document.getElementById(resultId);
    if (!resultDiv) {
        console.error(`Result element ${resultId} not found`);
        return;
    }
    
    resultDiv.innerHTML = `<div class="result-content">${message}</div>`;
    resultDiv.classList.add('error');
    resultDiv.style.display = 'block';
}

function showLoading(loadingId) {
    const loadingDiv = document.getElementById(loadingId);
    if (loadingDiv) {
        loadingDiv.classList.add('show');
    }
}

function hideLoading(loadingId) {
    const loadingDiv = document.getElementById(loadingId);
    if (loadingDiv) {
        loadingDiv.classList.remove('show');
    }
}

function hideResult(resultId) {
    const resultDiv = document.getElementById(resultId);
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }
}

function clearInput(inputId) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.value = '';
    }
    
    if (inputId === 'textInput') {
        hideResult('encodeResult');
    } else {
        hideResult('decodeResult');
    }
}

function copyResult(elementId, button) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element ${elementId} not found`);
        return;
    }
    
    let textToCopy = element.textContent;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        if (button) {
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'encode-tab') {
            encodeText();
        } else {
            decodeTokens();
        }
    }
});