import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #1e1e1e;
  border-radius: 8px;
  flex: 1;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  background-color: #333333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #444444;
    cursor: not-allowed;
  }
`;

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <InputContainer onSubmit={handleSubmit}>
            <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
            />
            <SendButton
                type="submit"
                disabled={!message.trim() || isLoading}
            >
                {isLoading ? 'Sending...' : 'Send'}
            </SendButton>
        </InputContainer>
    );
};

export default MessageInput;
