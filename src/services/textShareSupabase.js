import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Web Crypto API Service for client-side encryption/decryption
export class CryptoService {
  // Derive key from PIN using PBKDF2
  static async deriveKeyFromPin(pin) {
    const encoder = new TextEncoder()
    const pinBytes = encoder.encode(pin)
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      pinBytes,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('textshare-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Hash PIN for database lookup
  static async hashPin(pin) {
    const encoder = new TextEncoder()
    const pinBytes = encoder.encode(pin)
    const hashBuffer = await crypto.subtle.digest('SHA-256', pinBytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Encrypt text with PIN
  static async encrypt(plaintext, pin) {
    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      const key = await this.deriveKeyFromPin(pin)
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const textBytes = encoder.encode(plaintext)

      const encryptedBytes = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        textBytes
      )

      return {
        encryptedData: this._arrayToBase64(encryptedBytes),
        iv: this._arrayToBase64(iv)
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt text')
    }
  }

  // Decrypt text with PIN
  static async decrypt(encryptedData, iv, pin) {
    try {
      const decoder = new TextDecoder()
      
      const key = await this.deriveKeyFromPin(pin)
      const encryptedBytes = this._base64ToArray(encryptedData)
      const ivArray = this._base64ToArray(iv)

      const decryptedBytes = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        key,
        encryptedBytes
      )

      return decoder.decode(decryptedBytes)
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt text. Invalid PIN or corrupted data.')
    }
  }

  // Helper: Convert ArrayBuffer to Base64
  static _arrayToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Helper: Convert Base64 to ArrayBuffer
  static _base64ToArray(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

// TextShare Supabase Service
export class TextShareSupabaseService {
  // Save encrypted message
  static async saveMessage(plaintext, expirationHours = 24, password = null) {
    try {
      // Generate unique 6-digit PIN (numbers only)
      let pin = String(Math.floor(Math.random() * 900000) + 100000)
      let pinHash = await CryptoService.hashPin(pin)
      
      // Check if PIN already exists, retry if it does
      let retries = 0
      while (retries < 5) {
        const { data: existing, error: checkError } = await supabase
          .from('shares')
          .select('id', { count: 'exact' })
          .eq('pin_hash', pinHash)
        
        // If no error and no data, PIN is unique
        if (!checkError && (!existing || existing.length === 0)) break
        
        // Generate new PIN and try again
        pin = String(Math.floor(Math.random() * 900000) + 100000)
        pinHash = await CryptoService.hashPin(pin)
        retries++
      }

      if (retries >= 5) {
        throw new Error('Failed to generate unique PIN')
      }

      // Encrypt on client
      const { encryptedData, iv } = await CryptoService.encrypt(plaintext, pin)

      // Hash password if provided
      let passwordHash = null
      if (password) {
        passwordHash = await CryptoService.hashPin(password)
      }

      // Calculate expiration
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()

      // Insert into Supabase
      const { error } = await supabase.from('shares').insert([
        {
          pin_hash: pinHash,
          content: encryptedData,
          iv: iv,
          expires_at: expiresAt,
          password_hash: passwordHash
        }
      ])

      if (error) throw error

      // Generate share URL
      const shareUrl = `${window.location.origin}/#/textshare?pin=${pin}`
      
      return {
        success: true,
        pin,
        shareUrl,
        message: `Message created! Share this link: ${shareUrl}`,
        requiresPassword: !!password
      }
    } catch (error) {
      console.error('Save error:', error)
      throw new Error(error.message || 'Failed to save message')
    }
  }

  // Retrieve and decrypt message
  static async getMessage(pin) {
    try {
      const pinHash = await CryptoService.hashPin(pin)

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('shares')
        .select('content, iv, created_at, expires_at, password_hash')
        .eq('pin_hash', pinHash)

      if (error) throw error
      
      if (!data || data.length === 0) {
        throw new Error('Message not found')
      }

      const message = data[0]

      // Check expiration
      if (message.expires_at && new Date(message.expires_at) < new Date()) {
        throw new Error('Message has expired')
      }

      // Decrypt on client
      const plaintext = await CryptoService.decrypt(message.content, message.iv, pin)

      return {
        success: true,
        content: plaintext,
        createdAt: message.created_at,
        expiresAt: message.expires_at,
        requiresPassword: !!message.password_hash,
        passwordHash: message.password_hash
      }
    } catch (error) {
      console.error('Retrieve error:', error)
      throw error
    }
  }

  // Verify password for a message
  static async verifyPassword(password, passwordHash) {
    try {
      const inputHash = await CryptoService.hashPin(password)
      return inputHash === passwordHash
    } catch (error) {
      console.error('Password verification error:', error)
      throw error
    }
  }

  // Delete message
  static async deleteMessage(pin) {
    try {
      const pinHash = await CryptoService.hashPin(pin)
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('pin_hash', pinHash)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }
}

export default TextShareSupabaseService
