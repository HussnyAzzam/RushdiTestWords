// TextShare Storage Service - manages JSON database and expiration
import appSettings from '../config/appSettings.json';

class TextShareStorage {
  static DB_KEY = 'textshare_messages';
  static CLEANUP_KEY// Auto-initialize on import
if (typeof window !== 'undefined') {
  TextShareStorage.initialize()
}

export default TextShareStoragextshare_lastcleanup';

  // Initialize storage
  static initialize() {
    const existing = localStorage.getItem(this.DB_KEY);
    if (!existing) {
      localStorage.setItem(this.DB_KEY, JSON.stringify({
        messages: [],
        version: 1,
        created: new Date().toISOString()
      }));
    }
    this.cleanupExpired();
  }

  // Get the database
  static getDatabase() {
    try {
      const data = localStorage.getItem(this.DB_KEY);
      return data ? JSON.parse(data) : { messages: [], version: 1, created: new Date().toISOString() };
    } catch (error) {
      console.error('Database read error:', error);
      return { messages: [], version: 1, created: new Date().toISOString() };
    }
  }

  // Save the database
  static saveDatabase(db) {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('Storage quota exceeded or unavailable');
    }
  }

  // Store encrypted message
  static storeMessage(pincode, encryptedData, durationHours, metadata = {}) {
    try {
      const db = this.getDatabase();
      
      // Check storage limit
      if (db.messages.length >= appSettings.textShare.maxStoredMessages) {
        this.cleanupExpired();
        if (db.messages.length >= appSettings.textShare.maxStoredMessages) {
          throw new Error('Storage limit reached - delete some messages first');
        }
      }

      const message = {
        pincode,
        encryptedData,
        metadata: {
          ...metadata,
          created: new Date().toISOString(),
          expiresAt: new Date(Date.now() + durationHours * 3600000).toISOString(),
          durationHours,
          originalCharCount: metadata.originalCharCount || 0,
          isPasswordProtected: metadata.isPasswordProtected || false,
          preserveFormat: metadata.preserveFormat || false,
          accessCount: 0
        }
      };

      db.messages.push(message);
      db.lastModified = new Date().toISOString();
      this.saveDatabase(db);

      return {
        success: true,
        pincode,
        message: `Message stored successfully. Expires in ${durationHours} hour(s).`
      };
    } catch (error) {
      console.error('Store message error:', error);
      throw error;
    }
  }

  // Retrieve message by pincode
  static retrieveMessage(pincode) {
    try {
      const db = this.getDatabase();
      const message = db.messages.find(m => m.pincode === pincode);

      if (!message) {
        throw new Error('Message not found');
      }

      // Check expiration
      const expiresAt = new Date(message.metadata.expiresAt);
      if (expiresAt < new Date()) {
        // Remove expired message
        db.messages = db.messages.filter(m => m.pincode !== pincode);
        this.saveDatabase(db);
        throw new Error('Message has expired');
      }

      // Increment access count
      message.metadata.accessCount = (message.metadata.accessCount || 0) + 1;
      message.metadata.lastAccessed = new Date().toISOString();
      this.saveDatabase(db);

      return message;
    } catch (error) {
      console.error('Retrieve message error:', error);
      throw error;
    }
  }

  // Delete message by pincode
  static deleteMessage(pincode) {
    try {
      const db = this.getDatabase();
      const initialLength = db.messages.length;
      db.messages = db.messages.filter(m => m.pincode !== pincode);

      if (db.messages.length === initialLength) {
        throw new Error('Message not found');
      }

      this.saveDatabase(db);
      return { success: true, message: 'Message deleted successfully' };
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  // Cleanup expired messages (lightweight, frontend-based)
  static cleanupExpired() {
    try {
      const now = new Date();
      const db = this.getDatabase();
      const before = db.messages.length;

      db.messages = db.messages.filter(m => {
        const expiresAt = new Date(m.metadata.expiresAt);
        return expiresAt >= now;
      });

      if (db.messages.length < before) {
        db.lastModified = new Date().toISOString();
        this.saveDatabase(db);
      }

      localStorage.setItem(this.CLEANUP_KEY, new Date().toISOString());
      return before - db.messages.length; // Return number of deleted messages
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  // Get all messages (for admin/debug only)
  static getAllMessages() {
    this.cleanupExpired();
    const db = this.getDatabase();
    return db.messages.map(m => ({
      pincode: m.pincode,
      metadata: m.metadata
    }));
  }

  // Check if pincode exists
  static pincodeExists(pincode) {
    const db = this.getDatabase();
    return db.messages.some(m => m.pincode === pincode);
  }

  // Get message info without decryption
  static getMessageInfo(pincode) {
    try {
      const message = this.retrieveMessage(pincode);
      return {
        pincode,
        isPasswordProtected: message.metadata.isPasswordProtected,
        created: message.metadata.created,
        expiresAt: message.metadata.expiresAt,
        originalCharCount: message.metadata.originalCharCount,
        accessCount: message.metadata.accessCount,
        preserveFormat: message.metadata.preserveFormat
      };
    } catch (error) {
      throw error;
    }
  }

  // Export statistics
  static getStatistics() {
    this.cleanupExpired();
    const db = this.getDatabase();
    return {
      totalMessages: db.messages.length,
      maxMessages: appSettings.textShare.maxStoredMessages,
      storageUsage: `${(new Blob([JSON.stringify(db)]).size / 1024).toFixed(2)} KB`,
      lastCleanup: localStorage.getItem(this.CLEANUP_KEY) || 'Never',
      dbVersion: db.version
    };
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  TextShareStorage.initialize();
}

export default TextShareStorage;
