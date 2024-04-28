document.addEventListener('DOMContentLoaded', async () => {
    const contractABI = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "ChatCleared",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "fileName",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "ipfsUrl",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "FileSent",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "MessageSent",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "recipientAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "name": "RecipientAddressSet",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                }
            ],
            "name": "clearChat",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_fileName",
                    "type": "string"
                }
            ],
            "name": "clearFiles",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiver",
                    "type": "address"
                }
            ],
            "name": "getFiles",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "fileName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "ipfsUrl",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct SimpleChat.File[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiver",
                    "type": "address"
                }
            ],
            "name": "getMessages",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct SimpleChat.Message[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getRecipientAddresses",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                }
            ],
            "name": "loadChat",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct SimpleChat.Message[]",
                    "name": "",
                    "type": "tuple[]"
                },
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "fileName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "ipfsUrl",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct SimpleChat.File[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_ipfsUrl",
                    "type": "string"
                }
            ],
            "name": "sendFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                }
            ],
            "name": "sendMessage",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_receiverAddress",
                    "type": "address"
                }
            ],
            "name": "setRecipientAddress",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const contractAddress = '0x576d967bae9b63bd4195acc99a458f57de206f75';
    const web3 = new Web3(window.ethereum);
    const simpleChatContract = new web3.eth.Contract(contractABI, contractAddress);

    // Function to populate the recipient dropdown menu
    async function populateRecipientDropdown() {
        try {
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();

            // Get recipient addresses associated with the sender
            const recipientAddresses = await simpleChatContract.methods.getRecipientAddresses().call({ from: sender });

            const dropdown = document.getElementById('recipientDropdown');
            dropdown.innerHTML = ''; // Clear previous options

            recipientAddresses.forEach(address => {
                const option = document.createElement('option');
                option.value = address;
                option.innerText = address;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error populating recipient dropdown:', error);
        }
    }

    async function storeRecipientAddress() {
        try {
            const recipientAddressInput = document.getElementById('recipientAddress');
            const recipientAddress = recipientAddressInput.value.toLowerCase();
            if (!recipientAddress) {
                console.error('Recipient address cannot be empty');
                return;
            }
        
            const dropdown = document.getElementById('recipientDropdown');
            const existingOptions = Array.from(dropdown.options).map(option => option.value.toLowerCase());
        
            if (existingOptions.includes(recipientAddress)) {
                alert('Recipient address already exists');
                return;
            }

            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();
            await simpleChatContract.methods.setRecipientAddress(recipientAddress).send({ from: sender });
            alert('Recipient address stored: ' + recipientAddress);
            recipientAddressInput.value = ''; // Clear the input field
            await populateRecipientDropdown(); // Update recipient dropdown
        } catch (error) {
            console.error('Error storing recipient address:', error);
        }
    }

    // Function to load chat based on selected recipient
    async function loadChat() {
        try {
            const receiverAddress = document.getElementById('recipientDropdown').value.toLowerCase();
            if (!receiverAddress) {
                console.error('Recipient address cannot be empty');
                return;
            }
            await getMessagesAndFiles(receiverAddress);
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    // Function to display notification
    function displayNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification('New Message Received', {
                body: message,
            });
        }
    }

    async function uploadFileToIPFS(fileBuffer) {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([fileBuffer]));

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                body: formData,
                headers: {
                    'pinata_api_key': 'be6f4ce5eeb7b7f23773',
                    'pinata_secret_api_key': '4d864488e6baf93345c2f927f6c48fd56adb88da8f9816281bd563861ae588f2',
                },
            });

            const result = await response.json();
            return result.IpfsHash;
        } catch (error) {
            console.error('Error uploading file to Pinata IPFS gateway:', error);
            throw error;
        }
    }

    async function sendMessageOrFile() {
        try {
            const receiver = document.getElementById('recipientDropdown').value.toLowerCase();
            const content = document.getElementById('messageContent').value;
            const fileInput = document.getElementById('fileInput');

            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();

            if (!sender || !receiver) {
                console.error('Sender and receiver addresses cannot be empty');
                return;
            }

            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                const fileBuffer = await fileInput.files[0].arrayBuffer();
                const fileHash = await uploadFileToIPFS(fileBuffer);

                try {
                    await simpleChatContract.methods.sendFile(receiver, fileName, fileHash).send({ from: sender });
                    console.log('File sent!');
                    fileInput.value = '';
                    getMessagesAndFiles(receiver);
                } catch (error) {
                    console.error('Error sending file:', error);
                }
            } else {
                try {
                    await simpleChatContract.methods.sendMessage(receiver, content).send({ from: sender });
                    console.log('Message sent!');
		    document.getElementById('messageContent').value = '';
                    getMessagesAndFiles(receiver);
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }
        } catch (error) {
            console.error('Error sending message or file:', error);
        }
    }

    // Function to get messages and files
    async function getMessagesAndFiles(receiver) {
        try {
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();

            if (!sender || !receiver) {
                console.error('Sender and receiver addresses cannot be empty');
                return;
            }

            const messages = await simpleChatContract.methods.getMessages(receiver).call({ from: sender });
            const files = await simpleChatContract.methods.getFiles(receiver).call({ from: sender });

            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';

            let currentDate = null; // Track the current date

            const allItems = [...messages, ...files];
            allItems.sort((a, b) => a.timestamp - b.timestamp);

            allItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('message');

                // Get the date of the item
                const itemDate = new Date(item.timestamp * 1000).toLocaleDateString();

                // If the date of the item is different from the current date, display the date on top
                if (itemDate !== currentDate) {
                    const dateElement = document.createElement('div');
                    dateElement.classList.add('date');
                    dateElement.innerText = itemDate;
                    messagesContainer.prepend(dateElement);
                    currentDate = itemDate; // Update the current date
                }

                if (item.hasOwnProperty('content')) { // Check if it's a message
                    const contentElement = document.createElement('div');
                    contentElement.innerText = item.content;

                    const timestampElement = document.createElement('div');
                    timestampElement.classList.add('timestamp');
                    timestampElement.innerText = new Date(item.timestamp * 1000).toLocaleTimeString();

                    itemElement.prepend(contentElement);
                    itemElement.prepend(timestampElement);

                } else if (item.hasOwnProperty('fileName') && item.hasOwnProperty('ipfsUrl')) { // Check if it's a file
                    const fileLinkElement = document.createElement('a');
                    fileLinkElement.classList.add('fileLink');
                    fileLinkElement.href = `https://gateway.pinata.cloud/ipfs/${item.ipfsUrl}`;
                    fileLinkElement.target = "_blank";
                    fileLinkElement.innerText = item.fileName;

                    const timestampElement = document.createElement('div');
                    timestampElement.classList.add('timestamp');
                    timestampElement.innerText = new Date(item.timestamp * 1000).toLocaleTimeString();

                    itemElement.prepend(fileLinkElement);
                    itemElement.prepend(timestampElement);
                }

                if (item.sender.toLowerCase() === sender) {
                    itemElement.classList.add('sentMessage');
                } else {
                    itemElement.classList.add('receivedMessage');
                }

                messagesContainer.prepend(itemElement); // Append the item element
            });

        } catch (error) {
            console.error('Error getting messages and files:', error);
        }
    }

    // Function to auto-update messages and files
    async function autoUpdateMessagesAndFiles() {
        try {
            const receiverElement = document.getElementById('recipientDropdown');
            if (receiverElement && receiverElement.value) {
		const receiver = receiverElement.value.toLowerCase();
                await getMessagesAndFiles(receiver);
            }
        } catch (error) {
            console.error('Error updating messages and files:', error);
        }
        setTimeout(autoUpdateMessagesAndFiles, 2000);
    }

    async function clearChat() {
        try {
            const receiver = document.getElementById('recipientDropdown').value.toLowerCase();
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();

            if (!sender || !receiver) {
                console.error('Sender and receiver addresses cannot be empty');
                return;
            }

            await simpleChatContract.methods.clearChat(receiver).send({ from: sender });
            alert('Chat cleared!');

            document.getElementById('messagesContainer').innerHTML = '';
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }

    async function clearFiles(fileName) {
        try {
            const receiver = document.getElementById('recipientDropdown').value.toLowerCase();
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0].toLowerCase();

            if (!sender || !receiver) {
                console.error('Sender and receiver addresses cannot be empty');
                return;
            }

            await simpleChatContract.methods.clearFiles(receiver, fileName).send({ from: sender });
            console.log('Files cleared!');
        } catch (error) {
            console.error('Error clearing files:', error);
        }
    }

    // New function to connect to MetaMask
    async function connectToMetaMask() {
        try {
            // Check if MetaMask is installed
            if (window.ethereum) {
                // Request access to the user's MetaMask accounts
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                alert('Connected to MetaMask!');
            } else {
                alert('MetaMask is not installed');
            }
        } catch (error) {
            alert('Error connecting to MetaMask:', error);
        }
    }

    async function handleAccountChange() {
        try {
	    document.getElementById('messagesContainer').innerHTML = '';
            // Repopulate the recipient dropdown with the new account's recipient addresses
            await populateRecipientDropdown();
        } catch (error) {
            console.error('Error handling MetaMask account change:', error);
        }
    }

    // Check if MetaMask is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        alert('MetaMask is connected!');
    } else {
        // Automatically connect to MetaMask
        connectToMetaMask();
    }

    // Event listeners remain the same
    document.getElementById('storeRecipientBtn').addEventListener('click', storeRecipientAddress);
    document.getElementById('recipientDropdown').addEventListener('change', loadChat);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessageOrFile);
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);
    window.ethereum.on('accountsChanged', handleAccountChange);
    autoUpdateMessagesAndFiles();
    await populateRecipientDropdown();

});