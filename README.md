# Insurance Fraud Detection - MVP

🛡️ An AI-powered fraud detection system for health insurance claims using OpenAI's Assistant API.

## Overview

This MVP demonstrates a simplified insurance fraud detection system that uses OpenAI's GPT-4 with Retrieval-Augmented Generation (RAG) to analyze health insurance claims for potential fraud patterns.

## Features

✅ **Submit Insurance Claims**: Add new health insurance claims with patient details, amounts, services, and diagnosis

✅ **AI Fraud Detection**: Automatically analyze claims for fraud patterns including:
- Duplicate claims
- Unusually high amounts for services
- Mismatched diagnosis and service types
- Suspicious submission patterns

✅ **Interactive Chatbot**: Ask the AI assistant questions about specific claims or fraud detection insights

✅ **Real-time Notifications**: Get browser notifications when suspicious claims are detected

✅ **Claims Dashboard**: View all submitted claims with their status (pending, approved, flagged)

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: OpenAI Assistant API (GPT-4o) with File Search (RAG)
- **Dependencies**: 
  - Axios (CDN) - HTTP client for API requests

## Differences from Parent Repository

This MVP simplifies the [original InsuranceFraudDetection](https://github.com/rubak3/InsuranceFraudDetection) project:

**Removed:**
- ❌ Blockchain integration (Ethereum smart contracts)
- ❌ Ethers.js for blockchain interaction
- ❌ File-saver library
- ❌ Complex transaction processing from blockchain
- ❌ MetaMask wallet integration

**Simplified:**
- ✅ In-memory storage instead of blockchain
- ✅ Direct OpenAI API integration (no backend required)
- ✅ Streamlined UI with modern design
- ✅ Focus on core fraud detection feature only

## Setup Instructions

### Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with access to GPT-4
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key in your [API Keys settings](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gitmvp-com/insurance-fraud-detection-mvp.git
   cd insurance-fraud-detection-mvp
   ```

2. **Configure your OpenAI API Key**:
   - Open `script.js`
   - Find the `CONFIG` object at the top of the file
   - Add your OpenAI API key:
     ```javascript
     const CONFIG = {
         OPENAI_API_KEY: 'sk-your-api-key-here', // Add your key here
         ASSISTANT_MODEL: 'gpt-4o',
         ASSISTANT_TEMPERATURE: 0.2
     };
     ```

3. **Run the application**:
   - Simply open `index.html` in a modern web browser
   - OR use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (with http-server)
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## Usage

### Submitting a Claim

1. Fill out the claim form with:
   - Patient name
   - Claim amount
   - Service type (Consultation, Surgery, etc.)
   - Diagnosis

2. Click "Submit Claim"

3. The AI will automatically analyze the claim and either:
   - ✅ Approve it as legitimate
   - 🚨 Flag it for potential fraud

### Using the Chatbot

Ask questions like:
- "Are there any duplicate claims?"
- "Show me all flagged claims"
- "Analyze claim #3 for fraud"
- "What are common fraud patterns?"

## How It Works

1. **Claims Storage**: Claims are stored in-memory (browser session)

2. **AI Assistant**: OpenAI Assistant is configured with:
   - **Model**: GPT-4o
   - **Tools**: File Search (RAG) for analyzing claims data
   - **Instructions**: Specialized in fraud detection patterns

3. **Vector Store**: All claims are uploaded as JSON to OpenAI's vector store, enabling semantic search and pattern analysis

4. **Fraud Detection**: When a claim is submitted:
   - Claims data is updated in the vector store
   - AI analyzes the claim against all existing claims
   - Looks for patterns like duplicates, unusual amounts, mismatches
   - Returns verdict with explanation

## Limitations (MVP Scope)

- ⚠️ **No data persistence**: Claims are lost when you refresh the page
- ⚠️ **No authentication**: Single-user system
- ⚠️ **No blockchain**: Removed for simplicity
- ⚠️ **API key in frontend**: Not suitable for production (should use backend)
- ⚠️ **No claim approval workflow**: Simplified status management

## Cost Considerations

**OpenAI API Costs:**
- GPT-4o: ~$5 per 1M input tokens, ~$15 per 1M output tokens
- File storage: Free for first 1GB
- Vector store: Free for first 1GB-day

Typical usage: Analyzing 100 claims costs approximately $0.10-0.50

## Future Enhancements

To make this production-ready, consider adding:

1. **Backend server** (Node.js/Python) to secure API keys
2. **Database** (PostgreSQL/MongoDB) for persistent storage
3. **User authentication** for multi-user support
4. **Claim approval workflow** with admin review
5. **Analytics dashboard** for fraud statistics
6. **Blockchain integration** for immutable audit trails (like parent repo)

## License

MIT License - Feel free to use this MVP as a learning resource or starting point for your own projects.

## Credits

Inspired by [rubak3/InsuranceFraudDetection](https://github.com/rubak3/InsuranceFraudDetection)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your OpenAI API key is valid
3. Ensure you have GPT-4 API access
4. Check OpenAI API status at [status.openai.com](https://status.openai.com)

---

**Made with ❤️ for demonstrating AI-powered fraud detection**