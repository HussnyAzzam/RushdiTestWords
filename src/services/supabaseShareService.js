/**
 * Supabase Service
 * Handles all communication with Supabase backend
 * Client-side encryption ensures server never sees plaintext
 */

import { createClient } from '@supabase/supabase-js'
import WebCryptoEncryption from './webCryptoEncryption'

class SupabaseShareService {
  static client = null
  static initialized = false

  /**
   * Initialize Supabase client
   * Uses environment variables from .env
   */
  static initialize() {
    if (this.initialized) return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey)
    this.initialized = true
  }

  /**
   * Save encrypted message to Supabase
   * @param {string} plaintext - Plain text to encrypt
   * @param {string} pin - 6-digit PIN (used for key derivation)
   * @param {number} expirationHours - Hours until message expires
   * @returns {Promise<{pin: string, pinHash: string}>}
   */
  static async saveShare(plaintext, pin, expirationHours = 24) {
    try {
      this.initialize()

      // Validate input
      if (!plaintext || plaintext.trim().length === 0) {
        throw new Error('Message cannot be empty')
      }
      if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be 6 digits')
      }
      if (expirationHours < 1 || expirationHours > 48) {
        throw new Error('Expiration must be between 1 and 48 hours')
      }

      // Encrypt message client-side
      const { ciphertext, iv, salt } = await WebCryptoEncryption.encrypt(
        plaintext,
        pin
      )

      // Hash PIN for database lookup (server never sees actual PIN)
      const pinHash = await WebCryptoEncryption.hashPin(pin)

      // Calculate expiration timestamp
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + expirationHours)

      // Store encrypted data + IV + salt in Supabase
      // The ciphertext, iv, and salt are needed for decryption
      // PIN hash is used to find the record
      const { data, error } = await this.client
        .from('shares')
        .insert([
          {
            pin_hash: pinHash,
            content: JSON.stringify({
              ciphertext,
              salt
            }),
            iv: iv,
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to save share')
      }

      console.log('Share saved:', {
        id: data[0].id,
        expiresAt: data[0].expires_at
      })

      return {
        pin,
        pinHash,
        id: data[0].id
      }
    } catch (error) {
      console.error('Save share error:', error)
      throw error
    }
  }

  /**
   * Load and decrypt message from Supabase
   * @param {string} pin - 6-digit PIN
   * @returns {Promise<{plaintext: string, metadata: object}>}
   */
  static async loadShare(pin) {
    try {
      this.initialize()

      if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
        throw new Error('Invalid PIN format')
      }

      // Hash PIN to find record
      const pinHash = await WebCryptoEncryption.hashPin(pin)

      // Query database by pin_hash
      const { data, error } = await this.client
        .from('shares')
        .select('*')
        .eq('pin_hash', pinHash)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Share not found')
        }
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        throw new Error('Share not found')
      }

      // Check expiration
      const expiresAt = new Date(data.expires_at)
      if (expiresAt < new Date()) {
        // Delete expired record
        await this.deleteShare(pinHash)
        throw new Error('Share has expired')
      }

      // Parse stored content (contains ciphertext + salt)
      const { ciphertext, salt } = JSON.parse(data.content)
      const iv = data.iv

      // Decrypt client-side
      const plaintext = await WebCryptoEncryption.decrypt(
        ciphertext,
        iv,
        salt,
        pin
      )

      // Update access metadata
      await this.updateAccessMetadata(pinHash)

      return {
        plaintext,
        metadata: {
          createdAt: new Date(data.created_at),
          expiresAt: new Date(data.expires_at),
          accessCount: data.access_count,
          lastAccessed: data.last_accessed
        }
      }
    } catch (error) {
      console.error('Load share error:', error)
      throw error
    }
  }

  /**
   * Update access count and last accessed timestamp
   * @param {string} pinHash - PIN hash
   * @private
   */
  static async updateAccessMetadata(pinHash) {
    try {
      const { error } = await this.client
        .from('shares')
        .update({
          access_count: (prev) => prev + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('pin_hash', pinHash)

      if (error) {
        console.warn('Failed to update access metadata:', error)
      }
    } catch (err) {
      console.warn('Update metadata error:', err)
    }
  }

  /**
   * Delete share from database
   * @param {string} pinHash - PIN hash
   * @private
   */
  static async deleteShare(pinHash) {
    try {
      const { error } = await this.client
        .from('shares')
        .delete()
        .eq('pin_hash', pinHash)

      if (error && error.code !== 'PGRST116') {
        console.warn('Delete error:', error)
      }
    } catch (err) {
      console.warn('Delete share error:', err)
    }
  }

  /**
   * Cleanup all expired shares (optional, can be called periodically)
   * In production, use a Supabase Edge Function or cron job instead
   */
  static async cleanupExpired() {
    try {
      this.initialize()

      const { error } = await this.client
        .from('shares')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        console.warn('Cleanup error:', error)
        return 0
      }

      console.log('Expired shares cleaned up')
      return 1
    } catch (err) {
      console.warn('Cleanup error:', err)
      return 0
    }
  }
}

export default SupabaseShareService
