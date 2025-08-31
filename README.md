# BoxAI

BoxAI is a tool for comparing responses from different Large Language Models (LLMs). It provides a simple interface to query multiple LLM providers simultaneously and compare their responses, latency, and other metrics.

## Project Structure

```
boxai/
  backend/         # FastAPI server for LLM orchestration
  frontend/        # Next.js + React frontend
```

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- Python 3.8 or later
- API keys for OpenAI and/or Anthropic

### Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the `backend` directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Query multiple LLM providers simultaneously
- Compare response times and content
- Clean, responsive UI
- Easy to extend with new LLM providers

## License

MIT
