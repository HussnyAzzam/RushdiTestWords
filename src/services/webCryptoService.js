/**
 * Web Crypto Service - Browser-side encryption using AES-GCM
 * Uses Web Crypto API for secure client-side encryption
 * PIN is used to derive the encryption key via PBKDF2
 */

class WebCryptoService {
  // Algorithm constants
  static ALGORITHM = 'AES-GCM'
  static KEY_LENGTH = 256 // bits
  static IV_LENGTH = 12 // bytes (96 bits recommended for GCM)
  static TAG_LENGTH = 128 // bits
  static PBKDF2_ITERATIONS = 100000
  static PBKDF2_HASH = 'SHA-256'

  /**
   * Derive encryption key from PIN using PBKDF2
   * @param {string} pin - User's PIN
   * @param {Uint8Array} salt - Random salt for key derivation
   * @returns {Promise<CryptoKey>} - Derived encryption key
   */
  static async deriveKeyFromPin(pin, salt) {
    try {
      // Convert PIN to bytes
      const pinBytes = new TextEncoder().encode(pin)

      // Import PIN as PBKDF2 key material
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        pinBytes,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )

      // Derive AES key from PIN
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.PBKDF2_ITERATIONS,
          hash: this.PBKDF2_HASH
        },
        keyMaterial,
        { name: 'AES-GCM', length: this.KEY_LENGTH },
        true, // extractable for export if needed
        ['encrypt', 'decrypt']
      )

      return derivedKey
    } catch (error) {
      console.error('Key derivation error:', error)
      throw new Error('Failed to derive encryption key from PIN')
    }
  }

  /**
   * Encrypt text using AES-GCM
   * @param {string} plaintext - Text to encrypt
   * @param {string} pin - User's PIN
   * @returns {Promise<Object>} - {ciphertext, iv, salt, algorithm}
   */
  static async encryptText(plaintext, pin) {
    try {
      // Validate inputs
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext')
      }
      if (!pin || typeof pin !== 'string' || pin.length < 4) {
        throw new Error('PIN must be at least 4 characters')
      }

      // Generate random salt and IV
      const salt = window.crypto.getRandomValues(new Uint8Array(16))
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

      // Derive key from PIN
      const key = await this.deriveKeyFromPin(pin, salt)

      // Convert plaintext to bytes
      const plaintextBytes = new TextEncoder().encode(plaintext)

      // Encrypt
      const cipherBytes = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: this.TAG_LENGTH
        },
        key,
        plaintextBytes
      )

      // Return encrypted payload as Base64 strings
      return {
        ciphertext: this._arrayBufferToBase64(cipherBytes),
        iv: this._arrayBufferToBase64(iv),
        salt: this._arrayBufferToBase64(salt),
        algorithm: this.ALGORITHM,
        encoding: 'UTF-8'
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Encryption failed: ' + error.message)
    }
  }

  /**
   * Decrypt text using AES-GCM
   * @param {string} ciphertext - Base64-encoded ciphertext
   * @param {string} iv - Base64-encoded IV
   * @param {string} salt - Base64-encoded salt
   * @param {string} pin - User's PIN
   * @returns {Promise<string>} - Decrypted plaintext
   */
  static async decryptText(ciphertext, iv, salt, pin) {
    try {
      // Validate inputs
      if (!ciphertext || !iv || !salt || !pin) {
        throw new Error('Missing required decryption parameters')
      }

      // Convert from Base64
      const cipherBytes = this._base64ToArrayBuffer(ciphertext)
      const ivBytes = this._base64ToArrayBuffer(iv)
      const saltBytes = this._base64ToArrayBuffer(salt)

      // Derive key from PIN using same salt
      const key = await this.deriveKeyFromPin(pin, saltBytes)

      // Decrypt
      const plaintextBytes = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
          tagLength: this.TAG_LENGTH
        },
        key,
        cipherBytes
      )

      // Convert bytes back to string
      const plaintext = new TextDecoder().decode(plaintextBytes)
      return plaintext
    } catch (error) {
      console.error('Decryption error:', error)
      if (error.name === 'OperationError') {
        throw new Error('Decryption failed - invalid PIN or corrupted data')
      }
      throw new Error('Decryption failed: ' + error.message)
    }
  }

  /**
   * Generate SHA-256 hash of PIN for storage (not for encryption key derivation)
   * Used for PIN verification without storing the PIN itself
   * @param {string} pin - User's PIN
   * @returns {Promise<string>} - Base64-encoded SHA-256 hash
   */
  static async hashPin(pin) {
    try {
      if (!pin || typeof pin !== 'string') {
        throw new Error('Invalid PIN')
      }

      const pinBytes = new TextEncoder().encode(pin)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', pinBytes)
      return this._arrayBufferToBase64(hashBuffer)
    } catch (error) {
      console.error('PIN hashing error:', error)
      throw new Error('Failed to hash PIN: ' + error.message)
    }
  }

  /**
   * Convert ArrayBuffer to Base64 string
   * @param {ArrayBuffer} buffer
   * @returns {string} Base64-encoded string
   */
  static _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Convert Base64 string to ArrayBuffer
   * @param {string} base64String
   * @returns {ArrayBuffer}
   */
  static _base64ToArrayBuffer(base64String) {
    const binary = atob(base64String)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Generate random PIN
   * @param {number} length - PIN length (default 6)
   * @returns {string} - Random PIN
   */
  static generatePin(length = 6) {
    const chars = '0123456789'
    let pin = ''
    const randomValues = new Uint8Array(length)
    window.crypto.getRandomValues(randomValues)
    
    for (let i = 0; i < length; i++) {
      pin += chars[randomValues[i] % chars.length]
    }
    return pin
  }

  /**
   * Check if Web Crypto API is available
   * @returns {boolean}
   */
  static isAvailable() {
    return !!(
      window.crypto &&
      window.crypto.subtle &&
      typeof window.crypto.subtle.encrypt === 'function'
    )
  }
}

export default WebCryptoService
