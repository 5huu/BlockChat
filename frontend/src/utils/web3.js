import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

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
