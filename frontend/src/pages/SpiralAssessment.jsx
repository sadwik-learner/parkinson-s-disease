import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AssessmentPageLayout from '../components/assessment/AssessmentPageLayout'
import AssessmentCard from '../components/assessment/AssessmentCard'
import { uploadSpiral } from '../services/spiralService'

const STROKE_WIDTH = 4
const MIN_SEGMENT_DISTANCE = 2
const MIN_MEANINGFUL_DISTANCE = 40

function SpiralAssessment() {
  const guideCanvasRef = useRef(null)
  const drawingCanvasRef = useRef(null)
  const canvasWrapperRef = useRef(null)
  const showGuideRef = useRef(true)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const pendingPointsRef = useRef([])
  const rafRef = useRef(null)
  const currentStrokeDistanceRef = useRef(0)
  const totalStrokeDistanceRef = useRef(0)
  const hasMeaningfulDrawingRef = useRef(false)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [showGuide, setShowGuide] = useState(true)

  const flushPendingPoints = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const canvas = drawingCanvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      pendingPointsRef.current = []
      return
    }

    while (pendingPointsRef.current.length > 0) {
      const nextPoint = pendingPointsRef.current.shift()
      const lastPoint = lastPointRef.current

      if (!nextPoint) {
        continue
      }

      if (!lastPoint) {
        lastPointRef.current = nextPoint
        continue
      }

      const segmentDistance = Math.hypot(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y)
      if (segmentDistance < MIN_SEGMENT_DISTANCE) {
        continue
      }

      context.beginPath()
      context.moveTo(lastPoint.x, lastPoint.y)
      context.lineTo(nextPoint.x, nextPoint.y)
      context.stroke()

      currentStrokeDistanceRef.current += segmentDistance
      totalStrokeDistanceRef.current += segmentDistance
      lastPointRef.current = nextPoint
    }
  }, [])

  const scheduleDrawingFlush = useCallback(() => {
    if (rafRef.current !== null) {
      return
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      flushPendingPoints()
    })
  }, [flushPendingPoints])

  useEffect(() => {
    const guideCanvas = guideCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    const wrapper = canvasWrapperRef.current

    if (!guideCanvas || !drawingCanvas || !wrapper) {
      return undefined
    }

    const getDisplaySize = () => {
      const rect = wrapper.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return null
      }

      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
    }

    const configureCanvas = (canvas, width, height) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const context = canvas.getContext('2d')
      if (!context) {
        return null
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      return context
    }

    const drawGuide = (context, width, height) => {
      if (!context) {
        return
      }

      context.clearRect(0, 0, width, height)

      if (!showGuideRef.current) {
        return
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.strokeStyle = 'rgba(148, 163, 184, 0.34)'
      context.lineWidth = 1.5
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.beginPath()

      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) * 0.34
      const turns = 3.4
      const totalSteps = 320

      for (let step = 0; step <= totalSteps; step += 1) {
        const progress = step / totalSteps
        const angle = progress * turns * Math.PI * 2
        const radius = progress * maxRadius
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (step === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }

      context.stroke()
    }

    const restoreDrawing = (snapshot, width, height) => {
      const context = drawingCanvas.getContext('2d')
      if (!context) {
        return
      }

      context.clearRect(0, 0, width, height)

      if (!snapshot) {
        return
      }

      const image = new Image()
      image.onload = () => {
        context.drawImage(image, 0, 0, width, height)
      }
      image.src = snapshot
    }

    const syncCanvases = () => {
      const size = getDisplaySize()
      if (!size) {
        return
      }

      const drawingSnapshot = drawingCanvas.toDataURL('image/png')

      const guideContext = configureCanvas(guideCanvas, size.width, size.height)
      const drawingContext = configureCanvas(drawingCanvas, size.width, size.height)

      if (drawingContext) {
        drawingContext.strokeStyle = '#111111'
        drawingContext.lineWidth = STROKE_WIDTH
        drawingContext.lineCap = 'round'
        drawingContext.lineJoin = 'round'
        drawingContext.clearRect(0, 0, size.width, size.height)
      }

      drawGuide(guideContext, size.width, size.height)
      restoreDrawing(drawingSnapshot, size.width, size.height)
    }

    syncCanvases()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (isDrawingRef.current) {
              flushPendingPoints()
              isDrawingRef.current = false
            }

            syncCanvases()
          })
        : null

    resizeObserver?.observe(wrapper)

    return () => {
      resizeObserver?.disconnect()
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [flushPendingPoints])

  useEffect(() => {
    showGuideRef.current = showGuide

    const guideCanvas = guideCanvasRef.current
    const wrapper = canvasWrapperRef.current
    if (!guideCanvas || !wrapper) {
      return
    }

    const rect = wrapper.getBoundingClientRect()
    if (!rect.width || !rect.height) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    guideCanvas.width = Math.round(rect.width) * dpr
    guideCanvas.height = Math.round(rect.height) * dpr
    guideCanvas.style.width = `${Math.round(rect.width)}px`
    guideCanvas.style.height = `${Math.round(rect.height)}px`

    const context = guideCanvas.getContext('2d')
    if (!context) {
      return
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)

    if (!showGuide) {
      return
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, rect.width, rect.height)
    context.strokeStyle = 'rgba(148, 163, 184, 0.34)'
    context.lineWidth = 1.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const maxRadius = Math.min(rect.width, rect.height) * 0.34
    const turns = 3.4
    const totalSteps = 320

    for (let step = 0; step <= totalSteps; step += 1) {
      const progress = step / totalSteps
      const angle = progress * turns * Math.PI * 2
      const radius = progress * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      if (step === 0) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }
    }

    context.stroke()
  }, [showGuide])

  const statusClassName =
    status.type === 'error'
      ? 'text-red-600'
      : status.type === 'success'
        ? 'text-emerald-700'
        : 'text-blue-700'

  const getDrawingContext = () => {
    const canvas = drawingCanvasRef.current
    if (!canvas) {
      return null
    }

    return canvas.getContext('2d')
  }

  const getCanvasPoint = (event) => {
    const canvas = drawingCanvasRef.current
    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height)

    return { x, y }
  }

  const startStroke = (point) => {
    if (!point) {
      return
    }

    isDrawingRef.current = true
    lastPointRef.current = point
    pendingPointsRef.current = []
    currentStrokeDistanceRef.current = 0

    const context = getDrawingContext()
    if (context) {
      context.beginPath()
      context.moveTo(point.x, point.y)
    }
  }

  const continueStroke = (point) => {
    if (!point || !isDrawingRef.current) {
      return
    }

    pendingPointsRef.current.push(point)
    scheduleDrawingFlush()
  }

  const endStroke = () => {
    flushPendingPoints()
    isDrawingRef.current = false
    lastPointRef.current = null

    if (currentStrokeDistanceRef.current >= MIN_MEANINGFUL_DISTANCE) {
      hasMeaningfulDrawingRef.current = true
    }
  }

  const clearCanvas = () => {
    const canvas = drawingCanvasRef.current
    const context = getDrawingContext()

    if (!canvas || !context) {
      return
    }

    const wrapper = canvasWrapperRef.current
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(rect.width) * dpr
      canvas.height = Math.round(rect.height) * dpr
      canvas.style.width = `${Math.round(rect.width)}px`
      canvas.style.height = `${Math.round(rect.height)}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const clearWidth = wrapper ? Math.round(wrapper.getBoundingClientRect().width) : canvas.width
    const clearHeight = wrapper ? Math.round(wrapper.getBoundingClientRect().height) : canvas.height
    context.clearRect(0, 0, clearWidth, clearHeight)
    context.strokeStyle = '#111111'
    context.lineWidth = STROKE_WIDTH
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.globalCompositeOperation = 'source-over'

    isDrawingRef.current = false
    lastPointRef.current = null
    pendingPointsRef.current = []
    currentStrokeDistanceRef.current = 0
    totalStrokeDistanceRef.current = 0
    hasMeaningfulDrawingRef.current = false

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleClearDrawing = () => {
    if (isUploading) {
      return
    }

    clearCanvas()
    setStatus({ type: '', message: '' })
  }

  const handleSubmitDrawing = async () => {
    if (isUploading) {
      return
    }

    if (!hasMeaningfulDrawingRef.current || totalStrokeDistanceRef.current < MIN_MEANINGFUL_DISTANCE) {
      setStatus({
        type: 'error',
        message: 'Please draw a spiral before submitting.',
      })
      return
    }

    try {
      setIsUploading(true)
      setStatus({ type: 'info', message: 'Uploading spiral drawing...' })
      const file = await new Promise((resolve, reject) => {
        const canvas = drawingCanvasRef.current
        if (!canvas) {
          reject(new Error('Canvas is not available.'))
          return
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Unable to export spiral drawing.'))
              return
            }

            resolve(
              new File([blob], 'spiral.png', {
                type: 'image/png',
              }),
            )
          },
          'image/png',
        )
      })

      const response = await uploadSpiral(file)
      setStatus({
        type: 'success',
        message: `Spiral drawing uploaded successfully. File: ${response.filename}`,
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Spiral upload failed.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleMouseDown = (event) => {
    if (isUploading) {
      return
    }

    const point = getCanvasPoint(event)
    if (!point) {
      return
    }

    startStroke(point)
  }

  const handleMouseMove = (event) => {
    if (!isDrawingRef.current || isUploading) {
      return
    }

    const point = getCanvasPoint(event)
    if (!point) {
      return
    }

    continueStroke(point)
  }

  const handleMouseUp = () => {
    endStroke()
  }

  const handleTouchStart = (event) => {
    if (isUploading) {
      return
    }

    event.preventDefault()

    const touch = event.touches[0]
    if (!touch) {
      return
    }

    const canvas = drawingCanvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const point = {
      x: Math.min(Math.max(touch.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(touch.clientY - rect.top, 0), rect.height),
    }

    startStroke(point)
  }

  const handleTouchMove = (event) => {
    if (!isDrawingRef.current || isUploading) {
      return
    }

    event.preventDefault()

    const touch = event.touches[0]
    if (!touch) {
      return
    }

    const canvas = drawingCanvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const point = {
      x: Math.min(Math.max(touch.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(touch.clientY - rect.top, 0), rect.height),
    }

    continueStroke(point)
  }

  const handleTouchEnd = (event) => {
    event.preventDefault()
    endStroke()
  }

  return (
    <AssessmentPageLayout
      eyebrow="Spiral Assessment"
      title="Spiral Drawing"
      description="Draw a spiral using your mouse or touchscreen."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <AssessmentCard title="Drawing Canvas" icon={SpiralIcon}>
          <p className="text-sm leading-6 text-slate-600">
            Use the square area below for spiral input.
          </p>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowGuide((current) => !current)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
            >
              {showGuide ? 'Hide Guide' : 'Show Guide'}
            </button>
          </div>

          <div className="mt-6 aspect-square rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50 p-4">
            <div
              ref={canvasWrapperRef}
              className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <canvas
                ref={guideCanvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              <canvas
                ref={drawingCanvasRef}
                aria-label="Spiral drawing canvas"
                className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClearDrawing}
              disabled={isUploading}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-slate-300 disabled:hover:bg-white"
            >
              Clear Drawing
            </button>
            <button
              type="button"
              onClick={handleSubmitDrawing}
              disabled={isUploading}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Submit Drawing'}
            </button>
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
              <li>Draw a spiral using the full canvas area.</li>
              <li>Keep your movement natural and steady.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Helper Tips
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>• Sit comfortably with your screen centered.</p>
              <p>• Use the same hand you normally write with.</p>
              <p>• Avoid rushing so motion data stays natural.</p>
            </div>
          </div>
        </motion.aside>
      </div>
    </AssessmentPageLayout>
  )
}

function SpiralIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.1 7 7 7c3.5 0 6.5-2.8 6.5-6.3 0-3.1-2.5-5.7-5.7-5.7-2.8 0-5.1 2.2-5.1 5 0 2.4 1.9 4.4 4.3 4.4 2.1 0 3.8-1.7 3.8-3.8 0-1.8-1.4-3.3-3.2-3.3-1.4 0-2.6 1.1-2.6 2.5 0 1.1.9 2 2 2"
      />
    </svg>
  )
}

export default SpiralAssessment
