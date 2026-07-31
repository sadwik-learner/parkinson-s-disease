import api from './api'

/**
 * Uploads motion analysis data for Parkinson's screening.
 *
 * @param {object} data - Motion tracking payload.
 * @returns {Promise<any>} The backend response payload.
 */
export async function uploadMotion(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Motion data must be provided as an object.')
  }

  try {
    return await api.post('/motion', data)
  } catch (error) {
    throw new Error(`Motion upload failed: ${error.message}`, { cause: error })
  }
}
