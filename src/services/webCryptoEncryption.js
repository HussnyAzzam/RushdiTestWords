/**
 * Web Crypto API Encryption Service
 * Uses AES-GCM for authenticated encryption
 * PIN is used as the basis for key derivation
 */

class WebCryptoEncryption {
  // Algorithm configuration
  static ALGORITHM = 'AES-GCM'
  static KEY_LENGTH = 256
  static IV_LENGTH = 12 // 96-bit IV for GCM
  static TAG_LENGTH = 128
  static PBKDF2_ITERATIONS = 100000
  static PBKDF2_HASH = 'SHA-256'

  /**
   * Derive encryption key from PIN using PBKDF2
   * @param {string} pin - 6-digit PIN code
   * @param {Uint8Array} salt - Salt for key derivation
   * @returns {Promise<CryptoKey>}
   */
  static async deriveKey(pin, salt = null) {
    // Generate salt if not provided
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16))
    }

    // Convert PIN to bytes
    const pinBytes = new TextEncoder().encode(pin)

    // Import PIN as a key for PBKDF2
    const importedKey = await crypto.subtle.importKey(
      'raw',
      pinBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Derive key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: this.PBKDF2_HASH
      },
      importedKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true, // extractable for debugging
      ['encrypt', 'decrypt']
    )

    return { key: derivedKey, salt }
  }

  /**
   * Encrypt plaintext with PIN-derived key
   * @param {string} plaintext - Text to encrypt
   * @param {string} pin - 6-digit PIN
   * @returns {Promise<{ciphertext: string, iv: string, salt: string}>}
   */
  static async encrypt(plaintext, pin) {
    try {
      // Derive key from PIN
      const { key, salt } = await this.deriveKey(pin)

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

      // Convert plaintext to bytes
      const plaintextBytes = new TextEncoder().encode(plaintext)

      // Encrypt
      const ciphertextBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH
        },
        key,
        plaintextBytes
      )

      // Convert to Base64 for storage
      const ciphertextBytes = new Uint8Array(ciphertextBuffer)
      const ciphertext = this.base64Encode(ciphertextBytes)
      const ivBase64 = this.base64Encode(iv)
      const saltBase64 = this.base64Encode(salt)

      return {
        ciphertext,
        iv: ivBase64,
        salt: saltBase64
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error(`Failed to encrypt: ${error.message}`)
    }
  }

  /**
   * Decrypt ciphertext with PIN
   * @param {string} ciphertext - Encrypted data (Base64)
   * @param {string} iv - Initialization vector (Base64)
   * @param {string} salt - Salt (Base64)
   * @param {string} pin - 6-digit PIN
   * @returns {Promise<string>} Decrypted plaintext
   */
  static async decrypt(ciphertext, iv, salt, pin) {
    try {
      // Decode Base64
      const ciphertextBytes = this.base64Decode(ciphertext)
      const ivBytes = this.base64Decode(iv)
      const saltBytes = this.base64Decode(salt)

      // Derive key from PIN using same salt
      const { key } = await this.deriveKey(pin, saltBytes)

      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: ivBytes,
          tagLength: this.TAG_LENGTH
        },
        key,
        ciphertextBytes
      )

      // Convert to string
      const plaintext = new TextDecoder().decode(decryptedBuffer)
      return plaintext
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error(`Failed to decrypt: ${error.message}`)
    }
  }

  /**
   * Hash PIN using SHA-256 (for database lookup)
   * PIN hash allows us to find the record without storing the PIN
   * @param {string} pin - 6-digit PIN
   * @returns {Promise<string>} SHA-256 hash (Base64)
   */
  static async hashPin(pin) {
    try {
      const pinBytes = new TextEncoder().encode(pin)
      const hashBuffer = await crypto.subtle.digest('SHA-256', pinBytes)
      return this.base64Encode(new Uint8Array(hashBuffer))
    } catch (error) {
      console.error('Hash error:', error)
      throw new Error(`Failed to hash PIN: ${error.message}`)
    }
  }

  /**
   * Generate random 6-digit PIN
   * @returns {string}
   */
  static generatePin() {
    let pin = ''
    for (let i = 0; i < 6; i++) {
      pin += Math.floor(Math.random() * 10)
    }
    return pin
  }

  /**
   * Utility: Encode bytes to Base64
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  static base64Encode(bytes) {
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Utility: Decode Base64 to bytes
   * @param {string} base64String
   * @returns {Uint8Array}
   */
  static base64Decode(base64String) {
    const binary = atob(base64String)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

export default WebCryptoEncryption
