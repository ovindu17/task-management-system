import React, { useState } from 'react';
import './FunctionCallTest.css';

export default function FunctionCallTest() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/function-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      if (data.response) {
        setResult(data.response);
      } else {
        setResult(data.error || 'Error: No response received');
      }
    } catch (error) {
      console.error('Error calling function:', error);
      setResult('Error: Unable to call function');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="function-call-container">
      <h1>Function Call Test Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter message for function call"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Calling...' : 'Call Function'}
        </button>
      </form>
      {result && (
        <div className="result">
          <h3>Response:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
} 