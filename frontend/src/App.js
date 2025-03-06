import React, { useEffect, useState } from 'react';
import './App.css';
import Chat from './components/Chat';
import MessageInput from './components/MessageInput';
import RecipientSelect from './components/RecipientSelect';
import { initWeb3, uploadToIPFS } from './utils/web3';
import contractDetails from './contracts/contract-address.json';
import styled from 'styled-components';
import NetworkSwitch from './components/NetworkSwitch';
import { encryptMessage, decryptMessage } from './utils/encryption';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const AppWrapper = styled.div`
  min-height: 100vh;
  background: #121212;
  padding: 2rem;
  color: white;
`;

const ChatWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: #1e1e1e;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AppTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #fff;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const EncryptionToggle = styled(FormControlLabel)`
  margin: 1rem 0;
  color: #fff;
  .MuiSwitch-track {
    background-color: #333 !important;
  }
  .Mui-checked {
    color: #4CAF50 !important;
  }
  .Mui-checked + .MuiSwitch-track {
    background-color: #4CAF50 !important;
    opacity: 0.5;
  }
`;

function App() {
    const [web3State, setWeb3State] = useState({
        web3: null,
        contract: null,
        account: null,
    });
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        messages: false,
        sending: false,
        uploading: false,
        clearing: false
    });
    const [currentNetwork, setCurrentNetwork] = useState('SEPOLIA');
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(true);

    useEffect(() => {
        initializeWeb3();
    }, []);

    useEffect(() => {
        if (web3State.contract && web3State.account && selectedRecipient) {
            // Initial load without showing loading indicator
            loadMessages(false);
            
            // Set up polling with silent updates
            const interval = setInterval(() => loadMessages(true), 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [web3State.contract, web3State.account, selectedRecipient]);

    useEffect(() => {
        if (isEncryptionEnabled && web3State.contract && web3State.account && selectedRecipient) {
            // Show loading when encryption is toggled
            loadMessages(false);
        }
    }, [isEncryptionEnabled]);

    const initializeWeb3 = async () => {
        try {
            const { web3, account } = await initWeb3();
            const networkId = await web3.eth.net.getId();
            
            // Set initial network and get correct contract address
            let networkType;
            if (networkId === 11155111) {
                networkType = 'SEPOLIA';
                setCurrentNetwork('SEPOLIA');
            } else if (networkId === 1337) {
                networkType = 'GANACHE';
                setCurrentNetwork('GANACHE');
            }

            // Get the correct contract address for the current network
            const contractAddress = contractDetails[networkType]?.SimpleChat;
            if (!contractAddress) {
                throw new Error('Contract address not found for this network');
            }

            const contract = new web3.eth.Contract(
                contractDetails.SimpleChatABI,
                contractAddress
            );
            
            setWeb3State({ web3, contract, account });
            await loadRecipients(contract, account);
        } catch (error) {
            console.error('Failed to initialize Web3:', error);
            alert('Failed to connect to MetaMask. Please make sure it is installed and unlocked.');
        }
    };

    const loadRecipients = async (contract, account) => {
        try {
            const recipientList = await contract.methods
                .getRecipientAddresses()
                .call({ from: account });
            setRecipients(recipientList);
        } catch (error) {
            console.error('Error loading recipients:', error);
        }
    };

    const loadMessages = async (silent = false) => {
        try {
            const { contract, account } = web3State;
            
            // Check if contract or account is null
            if (!contract || !account) {
                console.log('Contract or account not initialized yet');
                return;
            }

            // Only show loading indicator if not silent
            if (!silent) {
                setLoadingStates(prev => ({ ...prev, messages: true }));
            }
            
            const response = await contract.methods
                .loadChat(selectedRecipient)
                .call({ from: account });

            const messagesList = response[0] || [];
            const filesList = response[1] || [];
            
            // Process messages based on their format
            const formattedMessages = await Promise.all(messagesList.map(async msg => {
                const content = msg.content;
                let processedContent;
                let isEncrypted = false;
                
                // Check if message has encryption prefix
                if (content.startsWith('ENC:')) {
                    isEncrypted = true;
                    const encryptedContent = content.substring(4); // Remove 'ENC:' prefix
                    processedContent = await decryptMessage(
                        encryptedContent, 
                        account,
                        msg.sender.toLowerCase() === account.toLowerCase() 
                            ? msg.receiver 
                            : msg.sender
                    );
                } else if (content.startsWith('PLAIN:')) {
                    // Handle plaintext messages
                    processedContent = content.substring(6); // Remove 'PLAIN:' prefix
                } else {
                    // Handle legacy messages (for backward compatibility)
                    if (isEncryptionEnabled) {
                        try {
                            processedContent = await decryptMessage(
                                content, 
                                account,
                                msg.sender.toLowerCase() === account.toLowerCase() 
                                    ? msg.receiver 
                                    : msg.sender
                            );
                            isEncrypted = true;
                        } catch (error) {
                            processedContent = content; // If decryption fails, show as is
                        }
                    } else {
                        processedContent = content;
                    }
                }
                
                return {
                    sender: msg.sender,
                    receiver: msg.receiver,
                    content: processedContent,
                    isEncrypted,
                    timestamp: Number(msg.timestamp)
                };
            }));

            const formattedFiles = filesList.map(file => ({
                sender: file.sender,
                receiver: file.receiver,
                fileName: file.fileName,
                ipfsUrl: file.ipfsUrl,
                timestamp: Number(file.timestamp)
            }));

            setMessages(formattedMessages);
            setFiles(formattedFiles);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            // Only update loading state if not silent
            if (!silent) {
                setLoadingStates(prev => ({ ...prev, messages: false }));
            }
        }
    };

    const decodeTransactionData = async (tx, functionName) => {
        if (currentNetwork !== 'GANACHE') return;
        
        try {
            const { contract, web3 } = web3State;
            
            // Get transaction
            const transaction = await web3.eth.getTransaction(tx.transactionHash);
            
            // Get function signature from ABI
            const functionAbi = contract.options.jsonInterface.find(
                (abi) => abi.name === functionName
            );

            if (!functionAbi) {
                throw new Error(`Function ${functionName} not found in ABI`);
            }

            // Get the raw input data
            console.log('\nRaw Transaction Data:', transaction.input);

            // Decode the input data
            const decodedParameters = web3.eth.abi.decodeParameters(
                functionAbi.inputs,
                '0x' + transaction.input.slice(10)
            );

            // Simplify the decoded output
            const simplifiedOutput = {};
            functionAbi.inputs.forEach((input, index) => {
                simplifiedOutput[input.name] = decodedParameters[index];
            });

            console.log('Decoded Data:', JSON.stringify(simplifiedOutput, null, 2));
            console.log('----------------------------------------\n');
        } catch (error) {
            console.error('Error decoding transaction:', error);
        }
    };

    const handleSendMessage = async (content) => {
        if (!selectedRecipient || !content.trim()) return;

        setLoadingStates(prev => ({ ...prev, sending: true }));
        try {
            const { contract, account } = web3State;
            
            // Add a prefix to indicate if the message is encrypted
            let messageContent;
            if (isEncryptionEnabled) {
                const encryptedContent = await encryptMessage(content, selectedRecipient, account);
                messageContent = `ENC:${encryptedContent}`; // Add prefix to indicate encryption
            } else {
                messageContent = `PLAIN:${content}`; // Add prefix to indicate plaintext
            }
            
            const tx = await contract.methods
                .sendMessage(selectedRecipient, messageContent)
                .send({ from: account });
            
            await decodeTransactionData(tx, 'sendMessage');
            
            // Load messages silently after sending
            await loadMessages(true);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setLoadingStates(prev => ({ ...prev, sending: false }));
        }
    };

    const handleFileSelect = async (file) => {
        if (!selectedRecipient || !file) return;

        setLoadingStates(prev => ({ ...prev, uploading: true }));
        try {
            const { contract, account } = web3State;
            const reader = new FileReader();
            
            reader.onload = async () => {
                try {
                    const fileHash = await uploadToIPFS(reader.result);
                    const tx = await contract.methods
                        .sendFile(selectedRecipient, file.name, fileHash)
                        .send({ from: account });
                    
                    await decodeTransactionData(tx, 'sendFile');
                    // Load messages silently after uploading
                    await loadMessages(true);
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('Failed to upload file. Please try again.');
                } finally {
                    setLoadingStates(prev => ({ ...prev, uploading: false }));
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error handling file:', error);
            setLoadingStates(prev => ({ ...prev, uploading: false }));
            alert('Failed to process file. Please try again.');
        }
    };

    const handleAddRecipient = async (address) => {
        setLoadingStates(prev => ({ ...prev, messages: true }));
        try {
            const { contract, account } = web3State;
            const tx = await contract.methods
                .setRecipientAddress(address)
                .send({ from: account });
            
            await decodeTransactionData(tx, 'setRecipientAddress');
            await loadRecipients(contract, account);
        } catch (error) {
            console.error('Error adding recipient:', error);
            alert('Failed to add recipient. Please try again.');
        } finally {
            setLoadingStates(prev => ({ ...prev, messages: false }));
        }
    };

    const handleNetworkSwitch = async (network) => {
        setLoadingStates(prev => ({ ...prev, messages: true }));
        try {
            setCurrentNetwork(network);
            await initializeWeb3();
        } finally {
            setLoadingStates(prev => ({ ...prev, messages: false }));
        }
    };

    const handleClearChat = async () => {
        if (!selectedRecipient) return;
        
        setLoadingStates(prev => ({ ...prev, clearing: true }));
        try {
            const { contract, account } = web3State;
            
            const tx = await contract.methods
                .clearChat(selectedRecipient)
                .send({ from: account });
            
            await decodeTransactionData(tx, 'clearChat');
            
            setMessages([]);
            setFiles([]);
            
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Failed to clear chat. Please try again.');
        } finally {
            setLoadingStates(prev => ({ ...prev, clearing: false }));
        }
    };

    const handleEncryptionToggle = async (e) => {
        const newState = e.target.checked;
        setIsEncryptionEnabled(newState);
        
        // Optional: Show a warning when disabling encryption
        if (!newState && messages.length > 0) {
            const confirm = window.confirm(
                'Disabling encryption will make your messages visible to anyone. Are you sure?'
            );
            if (!confirm) {
                setIsEncryptionEnabled(true);
                return;
            }
        }
        
        await loadMessages(); // Reload messages with new encryption state
    };

    return (
        <AppWrapper>
            <NetworkSwitch
                currentNetwork={currentNetwork}
                onNetworkSwitch={handleNetworkSwitch}
                isLoading={loadingStates.messages}
            />
            <ChatWrapper>
                <AppTitle>BlockChat</AppTitle>
                <EncryptionToggle
                    control={
                        <Switch
                            checked={isEncryptionEnabled}
                            onChange={handleEncryptionToggle}
                            color="primary"
                        />
                    }
                    label={`Encryption ${isEncryptionEnabled ? 'On' : 'Off'}`}
                />
                <RecipientSelect
                    recipients={recipients}
                    selectedRecipient={selectedRecipient}
                    onRecipientChange={setSelectedRecipient}
                    onAddRecipient={handleAddRecipient}
                    isLoading={loadingStates.messages}
                />
                <Chat
                    messages={messages}
                    files={files}
                    currentAccount={web3State.account}
                    onClearChat={handleClearChat}
                    isLoading={loadingStates.messages}
                    isClearingChat={loadingStates.clearing}
                    isEncrypted={isEncryptionEnabled}
                />
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onSendFile={handleFileSelect}
                    isLoading={loadingStates.sending}
                    isUploading={loadingStates.uploading}
                />
            </ChatWrapper>
        </AppWrapper>
    );
}

export default App;
