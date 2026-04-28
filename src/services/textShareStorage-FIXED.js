// TextShare Storage Service
// Manages localStorage for encrypted messages

import appSettings from '../config/appSettings.json'

class TextShareStorage {
  static DB_KEY = 'textshare_messages'

  static initialize() {
    const db = this.getDB()
    if (!db.messages) {
      db.messages = []
      this.saveDB(db)
    }
    this.cleanupExpired()
  }

  static getDB() {
    try {
      const data = localStorage.getItem(this.DB_KEY)
      return data ? JSON.parse(data) : { version: 1, messages: [] }
    } catch {
      return { version: 1, messages: [] }
    }
  }

  static saveDB(db) {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db))
  }

  static storeMessage(pin, encryptedMessage, expirationHours = 24, options = {}) {
    const db = this.getDB()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000)

    const message = {
      pin,
      encryptedData: encryptedMessage,
      metadata: {
        created: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        accessCount: 0,
        isPasswordProtected: options.isPasswordProtected || false,
        originalCharCount: options.originalCharCount || 0,
        preserveFormat: options.preserveFormat || false
      }
    }

    db.messages.push(message)
    this.saveDB(db)
    return { success: true, message: 'Message stored successfully' }
  }

  static retrieveMessage(pin) {
    const db = this.getDB()
    const message = db.messages.find(m => m.pin === pin)

    if (!message) {
      throw new Error('PIN not found')
    }

    const expiresAt = new Date(message.metadata.expiresAt)
    if (new Date() > expiresAt) {
      this.deleteMessage(pin)
      throw new Error('Message has expired')
    }

    message.metadata.accessCount += 1
    this.saveDB(db)

    return message
  }

  static deleteMessage(pin) {
    const db = this.getDB()
    db.messages = db.messages.filter(m => m.pin !== pin)
    this.saveDB(db)
  }

  static pincodeExists(pin) {
    const db = this.getDB()
    return db.messages.some(m => m.pin === pin)
  }

  static cleanupExpired() {
    const db = this.getDB()
    const now = new Date()
    db.messages = db.messages.filter(m => new Date(m.metadata.expiresAt) > now)
    this.saveDB(db)
  }

  static getStatistics() {
    const db = this.getDB()
    return {
      totalMessages: db.messages.length,
      storageUsage: JSON.stringify(db).length
    }
  }
}

export default TextShareStorage
