/**
 * Manifest Import/Export
 * 
 * Handles exporting and importing data as JSON manifests.
 * Provides atomic import with validation.
 */

import { StorageManifest } from '../domain/types';
import { LocalFileStore } from './LocalFileStore';

// ============================================================================
// Manifest IO
// ============================================================================

export class ManifestIO {
  private static readonly MANIFEST_VERSION = '1.0.0';

  /**
   * Exports all data as a JSON manifest.
   * Returns a JSON string ready for download.
   */
  public static async exportToManifest(): Promise<string> {
    try {
      const files = await LocalFileStore.exportAll();

      const manifest: StorageManifest = {
        version: this.MANIFEST_VERSION,
        exportedAt: Date.now(),
        files,
      };

      const json = JSON.stringify(manifest, null, 2);

      return json;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Imports data from a JSON manifest.
   * Validates manifest structure and content before importing.
   * Import is atomic: either all data is imported or none.
   */
  public static async importFromManifest(manifestJson: string): Promise<void> {
    try {
      // Parse JSON
      const manifest = JSON.parse(manifestJson) as StorageManifest;

      // Validate manifest structure
      this.validateManifest(manifest);

      // Import files (atomic operation)
      await LocalFileStore.importAll(manifest.files);
    } catch (error) {
      console.error('Import failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to import data');
    }
  }

  /**
   * Validates a manifest structure.
   * Throws an error if validation fails.
   */
  private static validateManifest(manifest: any): asserts manifest is StorageManifest {
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Invalid manifest: not an object');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      throw new Error('Invalid manifest: missing or invalid version');
    }

    if (!manifest.exportedAt || typeof manifest.exportedAt !== 'number') {
      throw new Error('Invalid manifest: missing or invalid exportedAt timestamp');
    }

    if (!manifest.files || typeof manifest.files !== 'object') {
      throw new Error('Invalid manifest: missing or invalid files object');
    }

    // Validate each file entry
    for (const [filename, content] of Object.entries(manifest.files)) {
      if (typeof filename !== 'string') {
        throw new Error('Invalid manifest: file key is not a string');
      }

      if (typeof content !== 'string') {
        throw new Error(`Invalid manifest: content for file "${filename}" is not a string`);
      }
    }

    // Check version compatibility
    if (!this.isVersionCompatible(manifest.version)) {
      throw new Error(`Incompatible manifest version: ${manifest.version} (expected ${this.MANIFEST_VERSION})`);
    }
  }

  /**
   * Checks if a manifest version is compatible with the current version.
   */
  private static isVersionCompatible(version: string): boolean {
    // For now, we only support exact version match
    // In the future, we can add migration logic here
    return version === this.MANIFEST_VERSION;
  }

  /**
   * Triggers a browser download of the manifest JSON.
   */
  public static async downloadManifest(filename: string = 'kids-savings-backup.json'): Promise<void> {
    try {
      const manifestJson = await this.exportToManifest();
      const blob = new Blob([manifestJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download backup');
    }
  }

  /**
   * Reads a manifest from a File object (from file input).
   */
  public static async readManifestFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Uploads and imports a manifest from a File object.
   */
  public static async uploadAndImport(file: File): Promise<void> {
    try {
      const manifestJson = await this.readManifestFromFile(file);
      await this.importFromManifest(manifestJson);
    } catch (error) {
      console.error('Upload and import failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload and import data');
    }
  }

  /**
   * Gets metadata from a manifest without importing.
   */
  public static getManifestInfo(manifestJson: string): ManifestInfo {
    try {
      const manifest = JSON.parse(manifestJson) as StorageManifest;
      
      return {
        version: manifest.version,
        exportedAt: new Date(manifest.exportedAt),
        fileCount: Object.keys(manifest.files).length,
        isValid: true,
      };
    } catch (error) {
      return {
        version: 'unknown',
        exportedAt: new Date(0),
        fileCount: 0,
        isValid: false,
      };
    }
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ManifestInfo {
  version: string;
  exportedAt: Date;
  fileCount: number;
  isValid: boolean;
}

