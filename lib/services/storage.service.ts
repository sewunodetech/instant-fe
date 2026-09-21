import { StorageServiceInterface } from "@/lib/interfaces/storage.interface";

class MockStorageService implements StorageServiceInterface {
  async upload(file: Buffer, key: string, contentType: string): Promise<string> {
    console.log(`[MockStorage] Upload: ${key} (${contentType}, ${file.length} bytes)`);
    return `https://mock-storage.instant.fun/${key}`;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return `https://mock-storage.instant.fun/${key}?expires=${expiresIn}`;
  }

  async delete(key: string): Promise<void> {
    console.log(`[MockStorage] Delete: ${key}`);
  }
}

export const StorageService: StorageServiceInterface = new MockStorageService();
