// Configuration
const CONFIG = {
    // Users should set their OpenAI API key here
    OPENAI_API_KEY: '', // Leave empty - users will add their own key
    ASSISTANT_MODEL: 'gpt-4o',
    ASSISTANT_TEMPERATURE: 0.2
};

// In-memory storage for claims (simplified, no blockchain)
let claims = [
    {
        id: 1,
        patientName: 'John Doe',
        amount: 500,
        serviceType: 'Consultation',
        diagnosis: 'Annual checkup',
        status: 'approved',
        timestamp: new Date('2024-01-15').toISOString()
    },
    {
        id: 2,
        patientName: 'Jane Smith',
        amount: 3500,
        serviceType: 'Surgery',
        diagnosis: 'Appendectomy',
        status: 'pending',
        timestamp: new Date('2024-01-20').toISOString()
    }
];

let nextClaimId = 3;

// OpenAI Assistant setup
let assistantId = null;
let vectorStoreId = null;
let threadId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Set up event listeners
    document.getElementById('claim-form').addEventListener('submit', handleClaimSubmit);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Display existing claims
    displayClaims();

    // Initialize OpenAI Assistant (only if API key is provided)
    if (CONFIG.OPENAI_API_KEY) {
        try {
            await createAssistant();
            await createVectorStore('Insurance Claims Database');
            await createThread();
            await updateVectorStoreWithClaims();
            console.log('OpenAI Assistant initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OpenAI Assistant:', error);
            displayMessage('⚠️ OpenAI API key not configured. Please add your API key in script.js to enable AI fraud detection.', 'llm-message');
        }
    } else {
        displayMessage('⚠️ OpenAI API key not configured. Please add your API key in script.js (CONFIG.OPENAI_API_KEY) to enable AI fraud detection features.', 'llm-message');
    }
}

// Handle claim submission
function handleClaimSubmit(e) {
    e.preventDefault();

    const claim = {
        id: nextClaimId++,
        patientName: document.getElementById('patient-name').value,
        amount: parseFloat(document.getElementById('claim-amount').value),
        serviceType: document.getElementById('service-type').value,
        diagnosis: document.getElementById('diagnosis').value,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    claims.push(claim);
    displayClaims();
    
    // Reset form
    e.target.reset();

    // Analyze claim for fraud
    if (CONFIG.OPENAI_API_KEY) {
        analyzeClaim(claim);
    } else {
        alert(`Claim #${claim.id} submitted successfully! (AI fraud detection disabled - add OpenAI API key to enable)`);
    }
}

// Display all claims
function displayClaims() {
    const claimsList = document.getElementById('claims-list');
    
    if (claims.length === 0) {
        claimsList.innerHTML = '<p style="color: #999; text-align: center;">No claims submitted yet.</p>';
        return;
    }

    claimsList.innerHTML = claims.slice().reverse().map(claim => `
        <div class="claim-card ${claim.status === 'flagged' ? 'flagged' : ''}">
            <div class="claim-header">
                <span class="claim-id">Claim #${claim.id}</span>
                <span class="claim-status status-${claim.status}">${claim.status.toUpperCase()}</span>
            </div>
            <div class="claim-details">
                <div><strong>Patient:</strong> ${claim.patientName}</div>
                <div><strong>Amount:</strong> $${claim.amount.toFixed(2)}</div>
                <div><strong>Service:</strong> ${claim.serviceType}</div>
                <div><strong>Diagnosis:</strong> ${claim.diagnosis}</div>
                <div><strong>Date:</strong> ${new Date(claim.timestamp).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// Analyze claim for potential fraud
async function analyzeClaim(claim) {
    try {
        // Update vector store with new claim
        await updateVectorStoreWithClaims();

        // Ask AI to analyze the claim
        const message = `Analyze claim #${claim.id} for potential fraud. This is a $${claim.amount} claim for ${claim.serviceType} with diagnosis: ${claim.diagnosis}. Consider: 1) Is the amount unusually high for this service? 2) Are there duplicate claims? 3) Does the diagnosis match the service? Respond with either "FRAUD_DETECTED" or "NO_FRAUD" followed by a brief explanation.`;
        
        await createMessage(message);
        const response = await getLLMResponse();

        // Check if fraud was detected
        if (response.includes('FRAUD_DETECTED')) {
            // Flag the claim
            const claimIndex = claims.findIndex(c => c.id === claim.id);
            if (claimIndex !== -1) {
                claims[claimIndex].status = 'flagged';
                displayClaims();
                
                // Show notification
                showNotification(`Claim #${claim.id} flagged for potential fraud!`);
                displayMessage(`🚨 Claim #${claim.id} has been flagged for potential fraud: ${response}`, 'llm-message');
            }
        } else {
            displayMessage(`✅ Claim #${claim.id} appears legitimate: ${response}`, 'llm-message');
        }
    } catch (error) {
        console.error('Error analyzing claim:', error);
        alert(`Claim #${claim.id} submitted, but fraud analysis failed. Please check console for details.`);
    }
}

// Send user message to chatbot
async function sendMessage() {
    const userMessage = document.getElementById('user-input').value.trim();

    if (!userMessage) return;

    if (!CONFIG.OPENAI_API_KEY) {
        displayMessage(userMessage, 'user-message');
        displayMessage('⚠️ OpenAI API key not configured. Please add your API key in script.js to enable chat functionality.', 'llm-message');
        document.getElementById('user-input').value = '';
        return;
    }

    // Display user's message
    displayMessage(userMessage, 'user-message');
    document.getElementById('user-input').value = '';

    try {
        // Show loading indicator
        const loadingMsg = displayMessage('<div class="loading"></div> Analyzing...', 'llm-message');

        // Send message to AI
        await createMessage(userMessage);
        const response = await getLLMResponse();

        // Remove loading message
        loadingMsg.remove();

        // Display AI response
        displayMessage(response, 'llm-message');
    } catch (error) {
        console.error('Error getting response:', error);
        displayMessage('Sorry, I encountered an error. Please check your API key and try again.', 'llm-message');
    }
}

// Display message in chat
function displayMessage(message, messageType) {
    const chatBox = document.getElementById('chat-box');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', messageType);

    const iconDiv = document.createElement('div');
    iconDiv.classList.add('icon');
    
    const iconSvg = messageType === 'user-message' 
        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196F3'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234CAF50'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
    
    const img = document.createElement('img');
    img.src = iconSvg;
    img.alt = messageType === 'user-message' ? 'User' : 'AI';
    iconDiv.appendChild(img);

    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('message-content');
    messageContentDiv.innerHTML = message;

    messageDiv.appendChild(iconDiv);
    messageDiv.appendChild(messageContentDiv);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    return messageDiv;
}

// Show browser notification
function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Fraud Alert', {
                body: message,
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ff5252"%3E%3Cpath d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/%3E%3C/svg%3E'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification(message);
                }
            });
        }
    }
}

////////////////////////////// OpenAI Functions //////////////////////////////

async function createAssistant() {
    const response = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            name: 'Health Insurance Fraud Detection Assistant',
            instructions: 'You are an AI assistant specialized in detecting fraud in health insurance claims. Analyze claims for patterns such as: duplicate claims, unusually high amounts for services, mismatched diagnosis and service types, and suspicious submission patterns. Provide clear, brief explanations when flagging potential fraud. When asked to analyze a claim, respond with either "FRAUD_DETECTED: [reason]" or "NO_FRAUD: [reason]".',
            model: CONFIG.ASSISTANT_MODEL,
            tools: [{ type: 'file_search' }],
            temperature: CONFIG.ASSISTANT_TEMPERATURE
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create assistant: ${response.status}`);
    }

    const data = await response.json();
    assistantId = data.id;
    console.log('Assistant created:', assistantId);
}

async function createVectorStore(name) {
    const response = await fetch('https://api.openai.com/v1/vector_stores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({ name })
    });

    if (!response.ok) {
        throw new Error(`Failed to create vector store: ${response.status}`);
    }

    const data = await response.json();
    vectorStoreId = data.id;
    console.log('Vector store created:', vectorStoreId);

    // Update assistant with vector store
    await updateAssistant();
}

async function updateAssistant() {
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } }
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to update assistant: ${response.status}`);
    }
}

async function updateVectorStoreWithClaims() {
    // Create a JSON file with all claims data
    const claimsData = JSON.stringify(claims, null, 2);
    const blob = new Blob([claimsData], { type: 'application/json' });
    
    // Upload to OpenAI
    const fileId = await uploadFileToOpenAI(blob, 'claims-database.json');
    
    // Add to vector store
    await addFileToVectorStore(fileId);
}

async function uploadFileToOpenAI(blob, fileName) {
    const formData = new FormData();
    formData.append('purpose', 'assistants');
    formData.append('file', blob, fileName);

    const response = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status}`);
    }

    const data = await response.json();
    console.log('File uploaded:', data.id);
    return data.id;
}

async function addFileToVectorStore(fileId) {
    const response = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({ file_id: fileId })
    });

    if (!response.ok) {
        throw new Error(`Failed to add file to vector store: ${response.status}`);
    }

    console.log('File added to vector store');
}

async function createThread() {
    const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`);
    }

    const data = await response.json();
    threadId = data.id;
    console.log('Thread created:', threadId);
}

async function createMessage(content) {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            role: 'user',
            content: content
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create message: ${response.status}`);
    }

    // Create a run
    await createRun();
}

async function createRun() {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            assistant_id: assistantId
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create run: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
}

async function getLLMResponse() {
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get messages: ${response.status}`);
        }

        const data = await response.json();
        const messages = data.data;

        if (messages.length > 0 && messages[0].role === 'assistant' && messages[0].content.length > 0) {
            const content = messages[0].content[0].text.value;
            // Remove citations
            return content.replace(/【\d+:\d+†.*?】/g, '');
        }

        attempts++;
    }

    throw new Error('Timeout waiting for response');
}