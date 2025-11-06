import { safeStorage, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface SecureCredentials {
  username: string;
  password: string;
  serverUrl: string;
}

/**
 * SecureStorageService - A service to handle secure credential storage using Electron's safeStorage
 */
export class SecureStorageService {
  private static instance: SecureStorageService;
  private credentialsPath: string;
  
  private constructor() {
    const userDataPath = app.getPath('userData');
    this.credentialsPath = path.join(userDataPath, 'credentials.json');
  }

  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Store credentials securely using safeStorage
   */
  public async storeCredentials(credentials: SecureCredentials): Promise<void> {
    try {
      // Check if safeStorage is available (only available on macOS and Windows)
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this platform');
      }

      // Encrypt the credentials
      const credentialsString = JSON.stringify(credentials);
      const encryptedCredentials = safeStorage.encryptString(credentialsString);

      // Store the encrypted credentials
      fs.writeFileSync(this.credentialsPath, encryptedCredentials);
    } catch (error) {
      console.error('Error storing credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve credentials securely using safeStorage
   */
  public async retrieveCredentials(): Promise<SecureCredentials | null> {
    try {
      // Check if safeStorage is available
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this platform');
      }

      // Check if credentials file exists
      if (!fs.existsSync(this.credentialsPath)) {
        return null;
      }

      // Read the encrypted credentials
      const encryptedCredentials = fs.readFileSync(this.credentialsPath);
      
      // Decrypt the credentials
      const decryptedCredentials = safeStorage.decryptString(encryptedCredentials);
      
      // Parse and return the credentials
      return JSON.parse(decryptedCredentials) as SecureCredentials;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      throw error;
    }
  }

  /**
   * Clear stored credentials
   */
  public async clearCredentials(): Promise<void> {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        fs.unlinkSync(this.credentialsPath);
      }
    } catch (error) {
      console.error('Error clearing credentials:', error);
      throw error;
    }
  }
}