import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import { auth } from './config';
import toast from 'react-hot-toast';

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured');
  }

  if (!auth?.currentUser?.uid) {
    throw new Error('User must be logged in to upload images');
  }

  const toastId = toast.loading('Uploading image...');

  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Create a unique file path under user's directory
    const timestamp = Date.now();
    const uniquePath = `uploads/${auth.currentUser.uid}/${path.split('/').pop()}-${timestamp}`;
    const storageRef = ref(storage, uniquePath);
    
    // Upload with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        timestamp: timestamp.toString(),
        userId: auth.currentUser.uid
      },
    };

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    toast.success('Image uploaded successfully', { id: toastId });
    return downloadUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    console.error('Upload error:', error);
    toast.error(message, { id: toastId });
    throw error;
  }
}