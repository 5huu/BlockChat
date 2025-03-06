import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #1e1e1e;
  border-radius: 8px;
  align-items: center;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #333333;
  border-radius: 4px;
  padding: 0 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  background-color: transparent;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  min-width: 80px;
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

const FileUploadLabel = styled.label`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  color: #777;
  
  &:hover {
    color: #fff;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  font-size: 14px;
  color: #999;
  margin-left: 8px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// New File Icon component
const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 2H6.75C5.23 2 4 3.23 4 4.75v14.5C4 20.77 5.23 22 6.75 22h10.5c1.52 0 2.75-1.23 2.75-2.75V7.5L12.5 2zm0 2.5V8h3.5v11.25c0 .14-.11.25-.25.25H6.75c-.14 0-.25-.11-.25-.25V4.75c0-.14.11-.25.25-.25h5.75z"/>
  </svg>
);

const MessageInput = ({ onSendMessage, onSendFile, isLoading, isUploading }) => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading || isUploading) return;

        if (selectedFile) {
            await onSendFile(selectedFile);
            setSelectedFile(null);
        } else if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage(''); // Clear message when file is selected
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const isInputDisabled = isLoading || isUploading;
    const buttonText = isUploading ? 'Uploading...' : isLoading ? 'Sending...' : 'Send';

    return (
        <InputContainer onSubmit={handleSubmit}>
            <InputWrapper>
                <FileUploadLabel>
                    <FileInput
                        type="file"
                        onChange={handleFileSelect}
                        disabled={isInputDisabled}
                    />
                    <FileIcon />
                </FileUploadLabel>
                
                {selectedFile ? (
                    <FileName title={selectedFile.name}>
                        {selectedFile.name}
                    </FileName>
                ) : (
                    <Input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isInputDisabled}
                    />
                )}
            </InputWrapper>
            
            <SendButton
                type="submit"
                disabled={(!message.trim() && !selectedFile) || isInputDisabled}
            >
                {buttonText}
            </SendButton>
        </InputContainer>
    );
};

export default MessageInput;
