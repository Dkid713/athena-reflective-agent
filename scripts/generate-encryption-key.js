
const crypto = require('crypto');

// Generate a 256-bit (32 bytes) encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('Generated TOKEN_ENCRYPTION_KEY:');
console.log(encryptionKey);
console.log('\nAdd this to your Replit Secrets as TOKEN_ENCRYPTION_KEY');
