import { createClient } from './client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Upload a document to Supabase Storage
 * 
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @returns The public URL of the uploaded file or null on error
 */
export async function uploadDocument(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const supabase = createClient()

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Return the path (not public URL for security)
    return data.path
  } catch (error) {
    console.error('Upload exception:', error)
    return null
  }
}

/**
 * Delete a document from Supabase Storage
 * 
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 * @returns true if successful, false otherwise
 */
export async function deleteDocument(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

/**
 * Get a signed URL for a private document
 * 
 * @param bucket - The storage bucket name
 * @param path - The path of the file
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns The signed URL or null on error
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    // Use admin client to bypass storage RLS
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL exception:', error)
    return null
  }
}

/**
 * Validate file before upload
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @param allowedTypes - Array of allowed MIME types
 * @returns Error message if invalid, null if valid
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['application/pdf']
): string | null {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `Le fichier ne doit pas dépasser ${maxSizeMB} MB`
  }

  return null
}

/**
 * Generate a unique file path for storage
 * 
 * @param userId - The user ID
 * @param fileType - Type of file (e.g., 'diploma', 'cni')
 * @param originalFilename - Original filename
 * @returns Unique file path
 */
export function generateFilePath(
  userId: string,
  fileType: string,
  originalFilename: string
): string {
  const timestamp = Date.now()
  const extension = originalFilename.split('.').pop()
  return `${userId}/${fileType}_${timestamp}.${extension}`
}
