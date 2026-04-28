// Encryption service using TweetNaCl.js for strong browser-side encryption
// Uses XSalsa20-Poly1305 authenticated encryption

const nacl = require('tweetnacl')
const naclUtil = require('tweetnacl-util')
const appSettings = require('../config/appSettings.json')

class TextShareEncryption {ption service using TweetNaCl.js for strong browser-side encryption
// Uses XSalsa20-Poly1305 authenticated encryption

const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const appSettings = require('../config/appSettings.json');

class TextShareEncryption {
  // Generate a random encryption key
  static generateKey() {
    return nacl.randomBytes(32); // 256-bit key for XSalsa20-Poly1305
  }

  // Generate nonce (number used once)
  static generateNonce() {
    return nacl.randomBytes(24); // 192-bit nonce for XSalsa20-Poly1305
  }

  // Encrypt text with optional password
  static encryptText(plaintext, password = null) {
    try {
      // Ensure UTF-8 encoding
      const textBytes = nacl.util.decodeUTF8(plaintext);
      
      // Generate key and nonce
      const key = this.generateKey();
      const nonce = this.generateNonce();

      // Encrypt
      const ciphertext = nacl.secretbox(textBytes, nonce, key);
      
      if (!ciphertext) {
        throw new Error('Encryption failed');
      }

      // If password provided, encrypt the key with password-derived key
      let encryptedKey = null;
      if (password) {
        encryptedKey = this.encryptKeyWithPassword(key, password);
      }

      return {
        ciphertext: nacl.util.encodeBase64(ciphertext),
        nonce: nacl.util.encodeBase64(nonce),
        key: password ? null : nacl.util.encodeBase64(key),
        encryptedKey: encryptedKey,
        isPasswordProtected: !!password,
        algorithm: appSettings.security.encryptionAlgorithm,
        encoding: appSettings.security.textEncoding
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt text: ' + error.message);
    }
  }

  // Decrypt text
  static decryptText(encryptedData, password = null) {
    try {
      const nonce = nacl.util.decodeBase64(encryptedData.nonce);
      const ciphertext = nacl.util.decodeBase64(encryptedData.ciphertext);

      let key;
      if (encryptedData.isPasswordProtected && password) {
        key = this.decryptKeyWithPassword(encryptedData.encryptedKey, password);
        if (!key) {
          throw new Error('Invalid password');
        }
      } else if (!encryptedData.isPasswordProtected) {
        key = nacl.util.decodeBase64(encryptedData.key);
      } else {
        throw new Error('Password required but not provided');
      }

      // Decrypt
      const plaintext = nacl.secretbox.open(ciphertext, nonce, key);
      
      if (!plaintext) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      return nacl.util.encodeUTF8(plaintext);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt text: ' + error.message);
    }
  }

  // Encrypt key with password-derived key (using PBKDF2-like approach)
  static encryptKeyWithPassword(key, password) {
    try {
      // Derive key from password
      const passwordBytes = nacl.util.decodeUTF8(password);
      const salt = nacl.randomBytes(16);
      
      // Simple key derivation - in production, use argon2 or similar
      const derivedKey = this.pbkdf2Simple(passwordBytes, salt, 32, 100000);
      
      // Encrypt the key
      const nonce = this.generateNonce();
      const encryptedKey = nacl.secretbox(key, nonce, derivedKey);

      return nacl.util.encodeBase64(salt) + ':' + nacl.util.encodeBase64(nonce) + ':' + nacl.util.encodeBase64(encryptedKey);
    } catch (error) {
      console.error('Key encryption error:', error);
      throw error;
    }
  }

  // Decrypt key with password
  static decryptKeyWithPassword(encryptedKeyStr, password) {
    try {
      const [saltB64, nonceB64, encryptedKeyB64] = encryptedKeyStr.split(':');
      
      const salt = nacl.util.decodeBase64(saltB64);
      const nonce = nacl.util.decodeBase64(nonceB64);
      const encryptedKey = nacl.util.decodeBase64(encryptedKeyB64);

      const passwordBytes = nacl.util.decodeUTF8(password);
      const derivedKey = this.pbkdf2Simple(passwordBytes, salt, 32, 100000);

      const decryptedKey = nacl.secretbox.open(encryptedKey, nonce, derivedKey);
      
      return decryptedKey;
    } catch (error) {
      console.error('Key decryption error:', error);
      return null;
    }
  }

  // Simple PBKDF2-like function (for browser - not as optimized as native)
  static pbkdf2Simple(password, salt, keyLength, iterations) {
    let result = new Uint8Array(keyLength);
    let block = new Uint8Array(32);
    
    // This is a simplified version - use crypto-subtle for production
    for (let i = 0; i < iterations; i++) {
      const input = new Uint8Array(password.length + salt.length);
      input.set(password, 0);
      input.set(salt, password.length);
      
      block = nacl.hash(input);
    }
    
    result = block.slice(0, keyLength);
    return result;
  }

  // Generate random PIN
  static generatePin(length = 6) {
    const alphabet = appSettings.textShare.pincodeAlphabet;
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return pin;
  }
}

export default TextShareEncryption;
