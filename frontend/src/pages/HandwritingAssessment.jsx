import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AssessmentPageLayout from '../components/assessment/AssessmentPageLayout'
import AssessmentCard from '../components/assessment/AssessmentCard'
import { uploadHandwriting } from '../services/handwritingService'

function HandwritingAssessment() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const imageName = selectedFile?.name ?? 'No file selected'

  const statusClassName =
    status.type === 'error'
      ? 'text-red-600'
      : status.type === 'success'
        ? 'text-emerald-700'
        : 'text-blue-700'

  const openFilePicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setStatus({
      type: file ? 'info' : '',
      message: file ? `${file.name} selected. Ready to upload.` : '',
    })
  }

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) {
      openFilePicker()
      return
    }

    try {
      setIsUploading(true)
      setStatus({ type: 'info', message: 'Uploading handwriting sample...' })
      const response = await uploadHandwriting(selectedFile)
      setStatus({
        type: 'success',
        message: `Handwriting sample uploaded successfully. File: ${response.filename}`,
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Handwriting upload failed.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AssessmentPageLayout
      eyebrow="Handwriting Assessment"
      title="Handwriting Analysis"
      description="Upload or write a handwriting sample for AI-assisted screening. File upload and handwriting feature extraction will be connected to the FastAPI backend later."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <AssessmentCard title="Handwriting Upload" icon={PencilIcon}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-sm leading-6 text-slate-600">
            Provide a handwriting sample for later image analysis and signal extraction. This page
            keeps the backend touchpoints as placeholders for now.
          </p>

          <div className="mt-6 rounded-3xl border border-dashed border-blue-200 bg-blue-50/70 p-6">
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
                ✍️
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">Drag and drop area</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Drop a handwriting image here or connect the upload flow to FastAPI later.
              </p>
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isUploading}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Upload handwriting'}
              </button>
            </div>
          </div>
          {status.message ? (
            <p className={`mt-4 text-sm leading-6 ${statusClassName}`}>{status.message}</p>
          ) : null}
        </AssessmentCard>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Instructions</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Write naturally or upload a clear handwriting sample.</li>
              <li>Image preview and OCR analysis will be added later.</li>
              <li>Backend endpoints will validate and score the sample.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Image Preview</h2>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                🖼️
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">{imageName}</p>
              <p className="mt-2 text-sm text-slate-500">Preview placeholder</p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Backend Note
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Image preprocessing, handwriting feature extraction, and report generation will be
              connected to the FastAPI backend later.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </motion.aside>
      </div>
    </AssessmentPageLayout>
  )
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4a2.1 2.1 0 0 0-3 0L3 14.5V20Z" />
    </svg>
  )
}

export default HandwritingAssessment
