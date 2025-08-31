import { useState, KeyboardEvent, useEffect } from 'react';
import Head from 'next/head';
import { FiSearch, FiSend, FiLoader, FiThumbsUp, FiThumbsDown, FiStar } from 'react-icons/fi';

interface LLMResponse {
  model: string;
  text: string;
  latency_ms: number;
  word_count: number;
  isUnsupported?: boolean;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [selectedModels, setSelectedModels] = useState({
    openai: true,   // Default enabled
    claude: true,   // Default enabled
    gpt4: false,    // Disabled by default
    llama: false,   // Not supported
    mistral: false  // Not supported
  });
  const [likedResponses, setLikedResponses] = useState<Record<string, boolean>>({});
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    // Set a random recommended response when responses change
    if (responses.length > 0) {
      const randomIndex = Math.floor(Math.random() * responses.length);
      setRecommendedId(responses[randomIndex].model);
    }
  }, [responses]);

  const handleModelToggle = (model: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  };

  const handleLike = (model: string, isLiked: boolean) => {
    setLikedResponses(prev => ({
      ...prev,
      [model]: isLiked
    }));
  };



  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const selectedModelEntries = Object.entries(selectedModels);
    const modelsToQuery = selectedModelEntries
      .filter(([_, isSelected]) => isSelected)
      .slice(0, 4) // Limit to 4 models
      .map(([model]) => model);

    if (modelsToQuery.length === 0) return;

    setIsLoading(true);
    setResponses([]);
    setRecommendedId(null);
    setLikedResponses({});

    try {
      // Get responses from supported models (OpenAI, GPT-4, and Claude)
      const supportedModels = modelsToQuery.filter(model => ['openai', 'gpt4', 'claude'].includes(model));
      let responses: LLMResponse[] = [];

      if (supportedModels.length > 0) {
        try {
          const response = await fetch('/api/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              models: supportedModels,
            }),
            credentials: 'include' // Important for cookies if using sessions
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to get responses');
          }
          responses = await response.json();
        } catch (error) {
          console.error('API Error:', error);
          throw error;
        }
      }

      // Add placeholders for unsupported models
      const unsupportedModels = modelsToQuery.filter(model => !['openai', 'gpt4', 'claude'].includes(model));
      const unsupportedResponses: LLMResponse[] = unsupportedModels.map(model => ({
        model,
        text: `This model (${getModelDisplayName(model)}) is currently not supported.`,
        latency_ms: 0,
        word_count: 0,
        isUnsupported: true
      }));

      setResponses([...responses, ...unsupportedResponses]);
      
      // Set a random recommended response from supported models only
      if (responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        setRecommendedId(responses[randomIndex].model);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get responses. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'openai': return 'GPT-3.5';
      case 'claude': return 'Claude';
      case 'gpt4': return 'GPT-4';
      case 'llama': return 'Llama 2 (Coming Soon)';
      case 'mistral': return 'Mistral (Coming Soon)';
      default: return model;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>BoxAI - Compare AI Responses</title>
        <meta name="description" content="Compare responses from different AI models" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BoxAI</h1>
          <p className="text-gray-500">Compare responses from different AI models</p>
        </div>

        {/* Model Selection */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select Models to Compare</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(selectedModels).map(([model, isSelected]) => (
              <button
                key={model}
                onClick={() => handleModelToggle(model)}
                disabled={model === 'llama' || model === 'mistral'}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : model === 'llama' || model === 'mistral'
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {getModelDisplayName(model)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full pl-12 pr-32 py-4 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Ask anything..."
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !query.trim()}
                className={`absolute right-2 px-6 py-2 rounded-full text-sm font-medium ${
                  isLoading || !query.trim()
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    Asking...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiSend className="mr-2" />
                    Ask
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {responses.map((response) => (
              <div
                key={response.model}
                className={`relative bg-white rounded-xl shadow-sm border-2 ${
                  response.model === recommendedId 
                    ? 'border-yellow-400' 
                    : response.isUnsupported
                      ? 'border-gray-200 opacity-75'
                      : 'border-transparent hover:border-gray-200'
                } transition-all duration-200`}
              >
                {response.model === recommendedId && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 rounded-full p-1">
                    <FiStar className="h-4 w-4" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getModelDisplayName(response.model)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {response.latency_ms}ms
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {response.word_count} words
                      </span>
                    </div>
                  </div>
                  <div className={`prose prose-sm max-w-none mb-4 ${response.isUnsupported ? 'text-gray-400' : 'text-gray-700'}`}>
                    {response.text.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {response.isUnsupported ? (
                          <span className="text-sm">{paragraph}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                    {response.isUnsupported && (
                      <p className="text-xs mt-2 text-gray-400">
                        Coming soon
                      </p>
                    )}
                  </div>
                  {!response.isUnsupported && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleLike(response.model, true)}
                        className={`p-2 rounded-full ${
                          likedResponses[response.model] === true 
                            ? 'text-green-500 bg-green-50' 
                            : 'text-gray-400 hover:text-green-500 hover:bg-gray-50'
                        }`}
                        aria-label="Like this response"
                      >
                        <FiThumbsUp className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleLike(response.model, false)}
                        className={`p-2 rounded-full ${
                          likedResponses[response.model] === false 
                            ? 'text-red-500 bg-red-50' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                        }`}
                        aria-label="Dislike this response"
                      >
                        <FiThumbsDown className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>BoxAI - Compare AI model responses</p>
        </div>
      </footer>
    </div>
  );
}
