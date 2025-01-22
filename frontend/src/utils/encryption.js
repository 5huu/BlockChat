import CryptoJS from 'crypto-js';

export const encryptMessage = async (message, recipientAddress, senderAddress) => {
    try {
        // Create a unique encryption key by sorting addresses to ensure consistent order
        const addresses = [
            senderAddress.toLowerCase(),
            recipientAddress.toLowerCase()
        ].sort(); // Sort to ensure same key regardless of sender/receiver order
        
        const encryptionKey = addresses.join('');
        
        // Encrypt the message
        const encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey).toString();
        
        return encryptedMessage;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
};

export const decryptMessage = async (encryptedMessage, userAddress, otherAddress) => {
    try {
        // Create key in same way as encryption - sort addresses to ensure consistent order
        const addresses = [
            userAddress.toLowerCase(),
            otherAddress.toLowerCase()
        ].sort();
        
        const decryptionKey = addresses.join('');
        
        // Decrypt the message
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, decryptionKey);
        const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        return decryptedMessage || 'Unable to decrypt message';
    } catch (error) {
        console.error('Decryption error:', error);
        return 'Unable to decrypt message';
    }
}; 