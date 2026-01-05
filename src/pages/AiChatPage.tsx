import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // GoogleGenerativeAI를 올바르게 가져옵니다.

interface ImportMeta {
  env: {
    VITE_GEMINI_API_KEY: string;
  };
}

const AiChatPage = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  // API 키를 환경 변수에서 가져옵니다.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // GoogleGenerativeAI 인스턴스를 생성합니다.
  const genAI = new GoogleGenerativeAI(apiKey);

  const handleChat = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(input);
      const text = result.response.text();
      setResponse(text);
    } catch (error) {
      console.error('Error generating content:', error);
      setResponse('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>AI Chatbot</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="AI에게 물어보세요..."
      />
      <button onClick={handleChat}>전송</button>
      <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
        <strong>응답:</strong> {response}
      </div>
    </div>
  );
};

export default AiChatPage;