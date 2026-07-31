import api from './api'

/**
 * Uploads a handwriting sample image for Parkinson's screening.
 *
 * @param {Blob} imageBlob - Image file or blob to upload.
 * @returns {Promise<any>} The backend response payload.
 */
export async function uploadHandwriting(imageBlob) {
  if (!imageBlob) {
    throw new Error('A handwriting image blob is required.')
  }

  const formData = new FormData()
  formData.append('file', imageBlob, imageBlob.name || 'handwriting-sample.png')

  try {
    return await api.post('/handwriting', formData)
  } catch (error) {
    throw new Error(`Handwriting upload failed: ${error.message}`, { cause: error })
  }
}
