import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in hex
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  },
  GANACHE: {
    chainId: '0x539', // 1337 in hex
    name: 'Ganache',
    rpcUrl: 'http://127.0.0.1:7545'
  }
};

export const initWeb3 = async () => {
    try {
        const provider = await detectEthereumProvider();
        
        if (!provider) {
            throw new Error('Please install MetaMask!');
        }

        await provider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No authorized accounts found!');
        }

        // Handle account changes
        provider.on('accountsChanged', (accounts) => {
            window.location.reload();
        });

        // Handle chain changes
        provider.on('chainChanged', (chainId) => {
            window.location.reload();
        });

        return { 
            web3, 
            account: accounts[0],
            provider
        };
    } catch (error) {
        console.error('Error initializing web3:', error);
        throw error;
    }
};

export const uploadToIPFS = async (fileBuffer) => {
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
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};

export const switchNetwork = async (networkType) => {
  try {
    const provider = await detectEthereumProvider();
    if (!provider) throw new Error('Please install MetaMask!');

    const network = NETWORKS[networkType];
    if (!network) throw new Error('Invalid network type');

    try {
      // Try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      // If the network is not added to MetaMask, add it
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
          }],
        });
      } else {
        throw switchError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error switching network:', error);
    throw error;
  }
};
