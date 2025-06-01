// frontend/src/components/ChatInterface.js
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

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

// Styles omitted for brevity (similar to previous example)

export default ChatInterface;