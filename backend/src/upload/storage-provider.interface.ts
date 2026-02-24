export interface StorageProvider {
  uploadImage(
    buffer: Buffer,
    filename: string,
    options?: {
      folder?: string;
      generateThumbnail?: boolean;
      generateMedium?: boolean;
    },
  ): Promise<{
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
  }>;

  uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder?: string,
  ): Promise<{
    url: string;
  }>;

  deleteFile(url: string): Promise<void>;
}
