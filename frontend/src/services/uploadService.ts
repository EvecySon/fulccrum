import { uploadAPI } from './api';

/**
 * Image/file upload service using expo-image-picker.
 * Handles picking images from camera or gallery and uploading to backend.
 */

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

/**
 * Pick an image from the device gallery.
 */
export async function pickImage(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<string | null> {
  try {
    const ImagePicker = require('expo-image-picker');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  } catch (error) {
    console.error('Failed to pick image:', error);
    return null;
  }
}

/**
 * Take a photo with the device camera.
 */
export async function takePhoto(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<string | null> {
  try {
    const ImagePicker = require('expo-image-picker');

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  } catch (error) {
    console.error('Failed to take photo:', error);
    return null;
  }
}

/**
 * Upload a local file URI to the backend.
 */
export async function uploadFile(
  uri: string,
  fieldName = 'file',
): Promise<UploadResult | null> {
  try {
    const filename = uri.split('/').pop() || 'upload';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

    const formData = new FormData();
    formData.append(fieldName, {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const result = await uploadAPI.uploadImage(formData);
    return result as UploadResult;
  } catch (error) {
    console.error('Failed to upload file:', error);
    return null;
  }
}

/**
 * Pick and upload an image in one step.
 */
export async function pickAndUpload(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<UploadResult | null> {
  const uri = await pickImage(options);
  if (!uri) return null;
  return uploadFile(uri);
}
