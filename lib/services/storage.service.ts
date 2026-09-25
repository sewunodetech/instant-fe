import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { HttpError } from "@/lib/api-response";
import type { StorageServiceInterface, StoredObject } from "@/lib/interfaces/storage.interface";

const endpoint =
  process.env.AWS_ENDPOINT_URL_S3 || process.env.STORAGE_ENDPOINT || "";
const region = process.env.AWS_REGION || "ap-southeast-1";
const bucket =
  process.env.STORAGE_BUCKET || process.env.AWS_S3_BUCKET || "posts";
const accessKeyId =
  process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY || "";
const secretAccessKey =
  process.env.AWS_SECRET_ACCESS_KEY || process.env.STORAGE_SECRET_KEY || "";

/** Public path served by app/api/media/[...key]/route.ts. */
export const MEDIA_PREFIX = "/api/media/";

function requireCredentials() {
  if (!endpoint) {
    throw new HttpError(
      500,
      "Storage endpoint missing. Set AWS_ENDPOINT_URL_S3 in .env"
    );
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new HttpError(
      500,
      "Storage keys missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env"
    );
  }
}

function createClient() {
  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

class NeonStorageService implements StorageServiceInterface {
  private client: S3Client | null = null;

  private getClient() {
    if (!this.client) this.client = createClient();
    return this.client;
  }

  async upload(file: Buffer, key: string, contentType: string): Promise<string> {
    requireCredentials();

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    // Presigned URLs expire; stored images go through our media proxy instead.
    return `${MEDIA_PREFIX}${key}`;
  }

  async read(key: string): Promise<StoredObject | null> {
    requireCredentials();
    try {
      const res = await this.getClient().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!res.Body) return null;
      return {
        body: res.Body.transformToWebStream(),
        contentType: res.ContentType || "application/octet-stream",
        contentLength: res.ContentLength,
      };
    } catch (error) {
      if (error instanceof Error && (error.name === "NoSuchKey" || error.name === "NotFound")) return null;
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    if (!endpoint || !accessKeyId || !secretAccessKey) return;
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key })
    );
  }
}

export const StorageService: StorageServiceInterface = new NeonStorageService();
