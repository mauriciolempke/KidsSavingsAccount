/**
 * Local File Store
 * 
 * Provides a file-like interface over IndexedDB using idb-keyval.
 * All content supports UTF-8 encoding.
 * Maintains a single backup (.bak) for each file.
 */

import { get, set, del, keys, clear } from 'idb-keyval';
import { CONSTANTS } from '../domain/types';

// ============================================================================
// Local File Store
// ============================================================================

export class LocalFileStore {
  /**
   * Reads a file from storage.
   * Returns null if the file doesn't exist.
   */
  public static async getFile(filename: string): Promise<string | null> {
    try {
      const content = await get<string>(filename);
      return content || null;
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Writes a file to storage.
   * Creates a backup of the existing file before overwriting.
   */
  public static async putFile(filename: string, content: string): Promise<void> {
    try {
      // Create backup of existing file (if it exists)
      const existing = await this.getFile(filename);
      if (existing !== null) {
        const backupFilename = this.getBackupFilename(filename);
        await set(backupFilename, existing);
      }

      // Write new content
      await set(filename, content);
    } catch (error) {
      console.error(`Error writing file ${filename}:`, error);
      throw new Error(`Failed to write file: ${filename}`);
    }
  }

  /**
   * Deletes a file from storage.
   * Also deletes the backup file if it exists.
   */
  public static async deleteFile(filename: string): Promise<void> {
    try {
      await del(filename);
      
      // Also delete backup
      const backupFilename = this.getBackupFilename(filename);
      await del(backupFilename);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      throw new Error(`Failed to delete file: ${filename}`);
    }
  }

  /**
   * Lists all files in storage (excluding backups).
   * Returns an array of filenames.
   */
  public static async listFiles(): Promise<string[]> {
    try {
      const allKeys = await keys<string>();
      // Filter out backup files
      return allKeys.filter(key => !key.endsWith(CONSTANTS.BACKUP_SUFFIX));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Lists all files including backups.
   */
  public static async listAllFiles(): Promise<string[]> {
    try {
      return await keys<string>();
    } catch (error) {
      console.error('Error listing all files:', error);
      return [];
    }
  }

  /**
   * Checks if a file exists.
   */
  public static async fileExists(filename: string): Promise<boolean> {
    const content = await this.getFile(filename);
    return content !== null;
  }

  /**
   * Gets the backup filename for a given filename.
   */
  private static getBackupFilename(filename: string): string {
    return `${filename}${CONSTANTS.BACKUP_SUFFIX}`;
  }

  /**
   * Restores a file from its backup.
   * Returns true if restoration was successful.
   */
  public static async restoreFromBackup(filename: string): Promise<boolean> {
    try {
      const backupFilename = this.getBackupFilename(filename);
      const backupContent = await this.getFile(backupFilename);
      
      if (backupContent === null) {
        return false;
      }

      await set(filename, backupContent);
      return true;
    } catch (error) {
      console.error(`Error restoring file ${filename} from backup:`, error);
      return false;
    }
  }

  /**
   * Deletes all files from storage.
   * Use with caution!
   */
  public static async deleteEverything(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      console.error('Error deleting all files:', error);
      throw new Error('Failed to delete all files');
    }
  }

  /**
   * Gets all files as a manifest (for export).
   * Returns a map of filename → content.
   */
  public static async exportAll(): Promise<Record<string, string>> {
    try {
      const filenames = await this.listFiles();
      const manifest: Record<string, string> = {};

      for (const filename of filenames) {
        const content = await this.getFile(filename);
        if (content !== null) {
          manifest[filename] = content;
        }
      }

      return manifest;
    } catch (error) {
      console.error('Error exporting files:', error);
      throw new Error('Failed to export files');
    }
  }

  /**
   * Imports files from a manifest (atomic operation).
   * Backs up existing files before replacing.
   * If any error occurs, attempts to rollback (not guaranteed).
   */
  public static async importAll(manifest: Record<string, string>): Promise<void> {
    // Backup existing files
    const existingManifest = await this.exportAll();

    try {
      // Clear existing files
      await this.deleteEverything();

      // Import new files
      for (const [filename, content] of Object.entries(manifest)) {
        await set(filename, content);
      }
    } catch (error) {
      console.error('Error during import, attempting rollback:', error);
      
      // Attempt rollback
      try {
        await this.deleteEverything();
        for (const [filename, content] of Object.entries(existingManifest)) {
          await set(filename, content);
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }

      throw new Error('Import failed. Attempted rollback to previous state.');
    }
  }

  /**
   * Gets storage statistics.
   */
  public static async getStats(): Promise<StorageStats> {
    try {
      const allFiles = await this.listAllFiles();
      const regularFiles = allFiles.filter(f => !f.endsWith(CONSTANTS.BACKUP_SUFFIX));
      const backupFiles = allFiles.filter(f => f.endsWith(CONSTANTS.BACKUP_SUFFIX));

      let totalSize = 0;
      for (const filename of allFiles) {
        const content = await this.getFile(filename);
        if (content) {
          totalSize += content.length;
        }
      }

      return {
        totalFiles: regularFiles.length,
        backupFiles: backupFiles.length,
        totalSizeBytes: totalSize,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        backupFiles: 0,
        totalSizeBytes: 0,
      };
    }
  }
}

// ============================================================================
// Types
// ============================================================================

export interface StorageStats {
  totalFiles: number;
  backupFiles: number;
  totalSizeBytes: number;
}

