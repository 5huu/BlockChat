import React, { useEffect, useState } from 'react';
import './App.css';
import Chat from './components/Chat';
import MessageInput from './components/MessageInput';
import RecipientSelect from './components/RecipientSelect';
import { initWeb3, uploadToIPFS } from './utils/web3';
import contractDetails from './contracts/contract-address.json';
import styled from 'styled-components';
import NetworkSwitch from './components/NetworkSwitch';

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
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentNetwork, setCurrentNetwork] = useState('SEPOLIA');

    useEffect(() => {
        initializeWeb3();
    }, []);

    useEffect(() => {
        if (web3State.contract && selectedRecipient) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [web3State.contract, selectedRecipient]);

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

    const loadMessages = async () => {
        try {
            const { contract, account } = web3State;
            
            const response = await contract.methods
                .loadChat(selectedRecipient)
                .call({ from: account });

            // The response should be an object with '0' and '1' properties
            // where '0' is messages array and '1' is files array
            const messagesList = response[0] || [];
            const filesList = response[1] || [];
            
            // Format messages according to the contract's Message struct
            const formattedMessages = messagesList.map(msg => ({
                sender: msg.sender,
                receiver: msg.receiver,
                content: msg.content,
                timestamp: Number(msg.timestamp)
            }));

            // Format files according to the contract's File struct
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

        setIsLoading(true);
        try {
            const { contract, account } = web3State;
            const tx = await contract.methods
                .sendMessage(selectedRecipient, content)
                .send({ from: account });
            
            await decodeTransactionData(tx, 'sendMessage');
            
            setTimeout(async () => {
                await loadMessages();
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (file) => {
        if (!selectedRecipient || !file) return;

        setIsUploading(true);
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
                    await loadMessages();
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('Failed to upload file. Please try again.');
                } finally {
                    setIsUploading(false);
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error handling file:', error);
            setIsUploading(false);
            alert('Failed to process file. Please try again.');
        }
    };

    const handleAddRecipient = async (address) => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const handleNetworkSwitch = async (network) => {
        setIsLoading(true);
        try {
            setCurrentNetwork(network);
            await initializeWeb3();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!selectedRecipient) return;
        
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return (
        <AppWrapper>
            <NetworkSwitch
                currentNetwork={currentNetwork}
                onNetworkSwitch={handleNetworkSwitch}
                isLoading={isLoading}
            />
            <ChatWrapper>
                <AppTitle>BlockChat</AppTitle>
                <RecipientSelect
                    recipients={recipients}
                    selectedRecipient={selectedRecipient}
                    onRecipientChange={setSelectedRecipient}
                    onAddRecipient={handleAddRecipient}
                    isLoading={isLoading}
                />
                <Chat
                    messages={messages}
                    files={files}
                    currentAccount={web3State.account}
                    onClearChat={handleClearChat}
                    isLoading={isLoading}
                />
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onSendFile={handleFileSelect}
                    isLoading={isLoading || isUploading}
                />
            </ChatWrapper>
        </AppWrapper>
    );
}

export default App;
