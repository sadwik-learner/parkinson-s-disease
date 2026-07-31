import api from './api'

/**
 * Requests a consolidated Parkinson's screening prediction.
 *
 * @returns {Promise<{
 *   overallRisk: number,
 *   confidence: number,
 *   spiral: number,
 *   handwriting: number,
 *   motion: number
 * }>} The screening prediction payload.
 */
export async function getPrediction() {
  try {
    return await api.post('/predict')
  } catch (error) {
    throw new Error(`Prediction request failed: ${error.message}`, { cause: error })
  }
}
