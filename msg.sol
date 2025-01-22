// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleChat {
    struct Message {
        address sender;
        address receiver;
        string content;
        uint timestamp;
    }

    struct File {
        address sender;
        address receiver;
        string fileName;
        string ipfsUrl;
        uint timestamp;
    }

    mapping(address => mapping(address => Message[])) private messages;
    mapping(address => mapping(address => File[])) private files;
    mapping(address => address[]) private recipientAddresses;

    event MessageSent(address indexed sender, address indexed receiver, string content, uint timestamp);
    event FileSent(address indexed sender, address indexed receiver, string fileName, string ipfsUrl, uint timestamp);
    event ChatCleared(address indexed sender, address indexed receiver, uint timestamp);
    event RecipientAddressSet(address indexed sender, address recipientAddress, uint timestamp);

    function sendMessage(address _receiverAddress, string memory _content) public {
        require(_receiverAddress != address(0), "Recipient address cannot be zero");
        require(_receiverAddress != msg.sender, "Cannot send message to yourself");

        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: _receiverAddress,
            content: _content,
            timestamp: block.timestamp
        });

        messages[msg.sender][_receiverAddress].push(newMessage);
        messages[_receiverAddress][msg.sender].push(newMessage);

        emit MessageSent(msg.sender, _receiverAddress, _content, block.timestamp);
    }

    function sendFile(address _receiverAddress, string memory _fileName, string memory _ipfsUrl) public {
        require(_receiverAddress != address(0), "Recipient address cannot be zero");
        require(_receiverAddress != msg.sender, "Cannot send file to yourself");

        File memory newFile = File({
            sender: msg.sender,
            receiver: _receiverAddress,
            fileName: _fileName,
            ipfsUrl: _ipfsUrl,
            timestamp: block.timestamp
        });

        files[msg.sender][_receiverAddress].push(newFile);
        files[_receiverAddress][msg.sender].push(newFile);

        emit FileSent(msg.sender, _receiverAddress, _fileName, _ipfsUrl, block.timestamp);
    }

    function setRecipientAddress(address _receiverAddress) public {
        require(_receiverAddress != address(0), "Recipient address cannot be zero");
        recipientAddresses[msg.sender].push(_receiverAddress);
        emit RecipientAddressSet(msg.sender, _receiverAddress, block.timestamp);
    }

    function getRecipientAddresses() public view returns (address[] memory) {
        return recipientAddresses[msg.sender];
    }

    function loadChat(address _receiverAddress) public view returns (Message[] memory, File[] memory) {
        return (messages[msg.sender][_receiverAddress], files[msg.sender][_receiverAddress]);
    }

    function clearChat(address _receiverAddress) public {
        require(_receiverAddress != msg.sender, "Cannot clear chat for yourself");

        delete messages[msg.sender][_receiverAddress];
        delete files[msg.sender][_receiverAddress];

        emit ChatCleared(msg.sender, _receiverAddress, block.timestamp);
    }

    function clearFiles(address _receiverAddress, string memory _fileName) public {
        require(_receiverAddress != msg.sender, "Cannot clear files for yourself");

        File[] storage userFiles = files[msg.sender][_receiverAddress];
        for (uint i = 0; i < userFiles.length; i++) {
            if (keccak256(bytes(userFiles[i].fileName)) == keccak256(bytes(_fileName))) {
                delete userFiles[i];
                break;
            }
        }
    }

    function getMessages(address _receiver) public view returns (Message[] memory) {
        require(msg.sender != _receiver, "Cannot get messages for yourself");
        require(msg.sender != address(0), "Invalid sender address");
        
        return messages[msg.sender][_receiver];
    }

    function getFiles(address _receiver) public view returns (File[] memory) {
        require(msg.sender != _receiver, "Cannot get files for yourself");
        require(msg.sender != address(0), "Invalid sender address");
        
        return files[msg.sender][_receiver];
    }
}
