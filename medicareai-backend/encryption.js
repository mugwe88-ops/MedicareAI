const crypto = require('crypto');

// The key must be exactly 32 bytes for aes-256-cbc
// Store this in your Render environment variables as MASTER_ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY; 
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Store IV with the encrypted data so we can use it for decryption later
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };