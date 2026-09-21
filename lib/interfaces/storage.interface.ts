export interface StorageServiceInterface {
  upload(file: Buffer, key: string, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
