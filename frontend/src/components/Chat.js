import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  height: 500px;
  overflow-y: auto;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 12px;
  margin-bottom: 1rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

const DateDivider = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.75rem;
  margin: 1.5rem 0;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #333;
  }
  
  &::before { left: 0; }
  &::after { right: 0; }
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.isSent ? 'flex-end' : 'flex-start'};
  margin: 0.5rem 0;
  padding: 0 1rem;
`;

const Message = styled.div`
  min-width: 60px;
  max-width: min(65%, 400px);
  width: fit-content;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: ${props => props.isSent ? '#2D3748' : '#1A365D'};
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  
  ${props => props.isSent ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageContent = styled.div`
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const Timestamp = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.3rem;
  text-align: right;
`;

const FileLink = styled.a`
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M15.5 2H8.6c-1.2 0-2.1 1-2.1 2.1v15.8c0 1.2 1 2.1 2.1 2.1h9.8c1.2 0 2.1-1 2.1-2.1V6.5L15.5 2z"/>
    <path d="M15 7V2l5 5h-5z"/>
  </svg>
);

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ClearButton = styled.button`
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #bd2130;
  }

  &:disabled {
    background-color: #444444;
    cursor: not-allowed;
  }
`;

const Chat = ({ messages, files, currentAccount, onClearChat, isLoading }) => {
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        console.log('Chat component updated:', { messages, files }); // Debug log
        // Scroll to bottom when messages update
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, files]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Combine and sort messages and files by timestamp
    const sortedItems = [...messages, ...files].sort((a, b) => a.timestamp - b.timestamp);

    // Group items by date
    const groupedItems = sortedItems.reduce((groups, item) => {
        const date = formatDate(item.timestamp);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
        return groups;
    }, {});

    return (
        <>
            <ChatHeader>
                <ClearButton 
                    onClick={onClearChat}
                    disabled={isLoading || (!messages.length && !files.length)}
                >
                    {isLoading ? 'Clearing...' : 'Clear Chat'}
                </ClearButton>
            </ChatHeader>
            <ChatContainer ref={messagesContainerRef}>
                {Object.entries(groupedItems).map(([date, items]) => (
                    <div key={date}>
                        <DateDivider>{date}</DateDivider>
                        {items.map((item, index) => {
                            const isOwnMessage = item.sender.toLowerCase() === currentAccount.toLowerCase();
                            
                            return (
                                <MessageWrapper
                                    key={`${item.timestamp}-${index}`}
                                    isSent={isOwnMessage}
                                >
                                    <Message isSent={isOwnMessage}>
                                        {item.hasOwnProperty('content') ? (
                                            <>
                                                <MessageContent>{item.content}</MessageContent>
                                                <Timestamp>{formatTimestamp(item.timestamp)}</Timestamp>
                                            </>
                                        ) : (
                                            <>
                                                <FileLink
                                                    href={`https://gateway.pinata.cloud/ipfs/${item.ipfsUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileIcon />
                                                    {item.fileName}
                                                </FileLink>
                                                <Timestamp>{formatTimestamp(item.timestamp)}</Timestamp>
                                            </>
                                        )}
                                    </Message>
                                </MessageWrapper>
                            );
                        })}
                    </div>
                ))}
            </ChatContainer>
        </>
    );
};

export default Chat;
