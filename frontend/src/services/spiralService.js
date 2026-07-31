import api from './api'

/**
 * Uploads a spiral drawing image for Parkinson's screening.
 *
 * @param {Blob} imageBlob - Image file or blob to upload.
 * @returns {Promise<any>} The backend response payload.
 */
export async function uploadSpiral(imageBlob) {
  if (!imageBlob) {
    throw new Error('A spiral image blob is required.')
  }

  const formData = new FormData()
  formData.append('file', imageBlob, imageBlob.name || 'spiral-drawing.png')

  try {
    return await api.post('/spiral', formData)
  } catch (error) {
    throw new Error(`Spiral upload failed: ${error.message}`, { cause: error })
  }
}
