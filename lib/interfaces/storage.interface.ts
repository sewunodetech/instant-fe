export type StoredObject = {
  body: ReadableStream;
  contentType: string;
  contentLength?: number;
};

export interface StorageServiceInterface {
  /** Stores the object and returns its permanent public path (`/api/media/<key>`). */
  upload(file: Buffer, key: string, contentType: string): Promise<string>;
  /** Reads an object for the media proxy; null when it doesn't exist. */
  read(key: string): Promise<StoredObject | null>;
  delete(key: string): Promise<void>;
}
