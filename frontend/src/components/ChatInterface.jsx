// frontend/src/components/ChatInterface.js
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const chatContainerStyles = {
  maxWidth: '700px',
  margin: '20px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  fontFamily: 'Arial, sans-serif',
};

const conversationStyles = {
  maxHeight: '400px',
  overflowY: 'auto',
  marginBottom: '20px',
  padding: '10px',
  backgroundColor: '#fff',
  borderRadius: '6px',
  border: '1px solid #ddd',
};

const messageStyles = {
  marginBottom: '15px',
};

const questionStyles = {
  marginBottom: '5px',
  color: '#333',
};

const answerStyles = {
  backgroundColor: '#e1f5fe',
  padding: '10px',
  borderRadius: '6px',
  color: '#01579b',
};

const sourcesStyles = {
  marginTop: '8px',
  fontSize: '12px',
  color: '#555',
};

const formStyles = {
  display: 'flex',
  gap: '10px',
};

const inputStyles = {
  flexGrow: 1,
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyles = {
  padding: '10px 20px',
  backgroundColor: '#0288d1',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const ChatInterface = ({ document }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        question: question
      }, {
        withCredentials: true,
      });
      
      const newEntry = {
        question: question,
        answer: response.data.answer,
        sources: response.data.sources
      };
      
      setConversation([...conversation, newEntry]);
      setQuestion('');
    } catch (error) {
      console.error('Chat error:', error);
      alert('Error processing your question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={chatContainerStyles}>
      <h2>Chat with {document?.file}</h2>
      
      <div style={conversationStyles}>
        {conversation.map((item, index) => (
          <div key={index} style={messageStyles}>
            <div style={questionStyles}>
              <strong>You:</strong> {item.question}
            </div>
            <div style={answerStyles}>
              <strong>Assistant:</strong> 
              <ReactMarkdown>{item.answer}</ReactMarkdown>
              {item.sources && item.sources.length > 0 && (
                <div style={sourcesStyles}>
                  <small>Sources: {item.sources.join(', ')}</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} style={formStyles}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document..."
          style={inputStyles}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={buttonStyles}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
