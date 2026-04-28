// Simplified TextShare Encryption Service
// Using TweetNaCl.js for XSalsa20-Poly1305 encryption

import nacl from 'tweetnacl'
import * as naclUtil from 'tweetnacl-util'
import appSettings from '../config/appSettings.json'

class TextShareEncryption {
  static generateKey() {
    return nacl.randomBytes(32)
  }

  static generateNonce() {
    return nacl.randomBytes(24)
  }

  static encryptText(plaintext, password = null) {
    try {
      const textBytes = naclUtil.decodeUTF8(plaintext)
      const key = this.generateKey()
      const nonce = this.generateNonce()
      const ciphertext = nacl.secretbox(textBytes, nonce, key)

      if (!ciphertext) {
        throw new Error('Encryption failed')
      }

      let encryptedKey = null
      if (password && password.length > 0) {
        encryptedKey = this.encryptKeyWithPassword(key, password)
      }

      return {
        ciphertext: naclUtil.encodeBase64(ciphertext),
        nonce: naclUtil.encodeBase64(nonce),
        key: encryptedKey ? null : naclUtil.encodeBase64(key),
        encryptedKey: encryptedKey,
        isPasswordProtected: !!encryptedKey
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt text: ' + error.message)
    }
  }

  static decryptText(encryptedData, password = null) {
    if (!encryptedData || !encryptedData.nonce) {
      throw new Error('Invalid encrypted data')
    }
    
    try {
      const nonce = naclUtil.decodeBase64(encryptedData.nonce)
      const ciphertext = naclUtil.decodeBase64(encryptedData.ciphertext)

      let key
      if (encryptedData.isPasswordProtected) {
        if (!password) {
          throw new Error('Password required but not provided')
        }
        key = this.decryptKeyWithPassword(encryptedData.encryptedKey, password)
        if (!key) {
          throw new Error('Invalid password')
        }
      } else {
        if (!encryptedData.key) {
          throw new Error('No key found in encrypted data')
        }
        key = naclUtil.decodeBase64(encryptedData.key)
      }

      const plaintext = nacl.secretbox.open(ciphertext, nonce, key)
      
      if (!plaintext) {
        throw new Error('Decryption failed - invalid password or corrupted data')
      }

      return naclUtil.encodeUTF8(plaintext)
    } catch (error) {
      console.error('Decryption error:', error)
      throw error
    }
  }

  static encryptKeyWithPassword(key, password) {
    try {
      const passwordBytes = naclUtil.decodeUTF8(password)
      const salt = nacl.randomBytes(16)
      const derivedKey = this.pbkdf2Simple(passwordBytes, salt, 32, 100000)
      const nonce = this.generateNonce()
      const encryptedKey = nacl.secretbox(key, nonce, derivedKey)

      if (!encryptedKey) {
        throw new Error('Key encryption failed')
      }

      return naclUtil.encodeBase64(salt) + ':' + naclUtil.encodeBase64(nonce) + ':' + naclUtil.encodeBase64(encryptedKey)
    } catch (error) {
      console.error('Key encryption error:', error)
      throw error
    }
  }

  static decryptKeyWithPassword(encryptedKeyStr, password) {
    try {
      if (!encryptedKeyStr || typeof encryptedKeyStr !== 'string') {
        console.error('Invalid encrypted key string')
        return null
      }

      const parts = encryptedKeyStr.split(':')
      if (parts.length !== 3) {
        console.error('Invalid encrypted key format')
        return null
      }

      const [saltB64, nonceB64, encryptedKeyB64] = parts
      const salt = naclUtil.decodeBase64(saltB64)
      const nonce = naclUtil.decodeBase64(nonceB64)
      const encryptedKey = naclUtil.decodeBase64(encryptedKeyB64)
      const passwordBytes = naclUtil.decodeUTF8(password)
      const derivedKey = this.pbkdf2Simple(passwordBytes, salt, 32, 100000)
      const decryptedKey = nacl.secretbox.open(encryptedKey, nonce, derivedKey)
      
      return decryptedKey
    } catch (error) {
      console.error('Key decryption error:', error)
      return null
    }
  }

  static generatePin(length = 6) {
    const alphabet = '0123456789'
    let pin = ''
    for (let i = 0; i < length; i++) {
      pin += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return pin
  }

  static pbkdf2Simple(password, salt, keyLength, iterations) {
    let block = new Uint8Array(32)
    for (let i = 0; i < iterations; i++) {
      const input = new Uint8Array(password.length + salt.length)
      input.set(password, 0)
      input.set(salt, password.length)
      block = nacl.hash(input)
    }
    return block.slice(0, keyLength)
  }
}

export default TextShareEncryption
