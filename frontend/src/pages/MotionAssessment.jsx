import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AssessmentPageLayout from '../components/assessment/AssessmentPageLayout'
import AssessmentCard from '../components/assessment/AssessmentCard'
import { uploadMotion } from '../services/motionService'

const TOTAL_TARGETS = 10
const MIN_SAMPLE_COUNT = 100
const TARGET_TEMPLATE = [
  { x: 0.5, y: 0.5 },
  { x: 0.28, y: 0.24 },
  { x: 0.72, y: 0.24 },
  { x: 0.78, y: 0.5 },
  { x: 0.68, y: 0.76 },
  { x: 0.5, y: 0.82 },
  { x: 0.32, y: 0.74 },
  { x: 0.18, y: 0.5 },
  { x: 0.34, y: 0.32 },
  { x: 0.62, y: 0.38 },
]

function buildTargetSequence() {
  return TARGET_TEMPLATE.slice(0, TOTAL_TARGETS).map((target, index) => ({
    id: index + 1,
    x: target.x,
    y: target.y,
  }))
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatSeconds(milliseconds) {
  return `${(milliseconds / 1000).toFixed(1)} s`
}

function MotionAssessment() {
  const trackingAreaRef = useRef(null)
  const animationFrameRef = useRef(null)
  const phaseRef = useRef('idle')
  const countdownStartedAtRef = useRef(0)
  const trackingStartedAtRef = useRef(0)
  const samplePointsRef = useRef([])
  const currentTargetIndexRef = useRef(0)
  const completedTargetIndicesRef = useRef(new Set())
  const areaSizeRef = useRef({ width: 0, height: 0 })
  const targetsRef = useRef(buildTargetSequence())
  const latestPointerIdRef = useRef(null)
  const elapsedDisplayRef = useRef(0)
  const sampleCountDisplayRef = useRef(0)
  const countdownDisplayRef = useRef(3)

  const [phase, setPhase] = useState('idle')
  const [countdownValue, setCountdownValue] = useState(3)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [sampleCount, setSampleCount] = useState(0)
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [completedTargetIndices, setCompletedTargetIndices] = useState([])
  const [targets, setTargets] = useState(() => buildTargetSequence())
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    currentTargetIndexRef.current = currentTargetIndex
  }, [currentTargetIndex])

  useEffect(() => {
    areaSizeRef.current = areaSize
  }, [areaSize])

  useEffect(() => {
    targetsRef.current = targets
  }, [targets])

  useEffect(() => {
    const element = trackingAreaRef.current
    if (!element) {
      return undefined
    }

    const measure = () => {
      const rect = element.getBoundingClientRect()
      setAreaSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const observer = new ResizeObserver(() => {
      measure()
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const statusClassName =
    status.type === 'error'
      ? 'text-red-600'
      : status.type === 'success'
        ? 'text-emerald-700'
        : 'text-blue-700'

  const getAreaBounds = () => {
    const element = trackingAreaRef.current
    if (!element) {
      return null
    }

    return element.getBoundingClientRect()
  }

  const setSessionIdle = useCallback(
    (nextTargets = buildTargetSequence(), nextStatus = { type: '', message: '' }) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      phaseRef.current = 'idle'
      setPhase('idle')

      countdownStartedAtRef.current = 0
      trackingStartedAtRef.current = 0
      samplePointsRef.current = []
      currentTargetIndexRef.current = 0
      completedTargetIndicesRef.current = new Set()
      elapsedDisplayRef.current = 0
      sampleCountDisplayRef.current = 0
      countdownDisplayRef.current = 3
      latestPointerIdRef.current = null

      setCountdownValue(3)
      setElapsedMs(0)
      setSampleCount(0)
      setCurrentTargetIndex(0)
      setCompletedTargetIndices([])
      setTargets(nextTargets)
      setStatus(nextStatus)
    },
    [],
  )

  const finishSession = useCallback(
    (message = 'Assessment complete. Ready to submit.') => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      phaseRef.current = 'complete'
      setPhase('complete')

      const finalElapsed = trackingStartedAtRef.current
        ? performance.now() - trackingStartedAtRef.current
        : elapsedDisplayRef.current

      elapsedDisplayRef.current = finalElapsed
      sampleCountDisplayRef.current = samplePointsRef.current.length

      setCountdownValue(null)
      setElapsedMs(finalElapsed)
      setSampleCount(samplePointsRef.current.length)
      setCurrentTargetIndex(targetsRef.current.length)
      setCompletedTargetIndices(Array.from(completedTargetIndicesRef.current))
      setStatus({ type: 'success', message })
    },
    [],
  )

  const beginTracking = useCallback(() => {
    console.log('[Motion] beginTracking')
    phaseRef.current = 'tracking'
    setPhase('tracking')
    trackingStartedAtRef.current = performance.now()
    elapsedDisplayRef.current = 0
    sampleCountDisplayRef.current = samplePointsRef.current.length
    setCountdownValue(null)
    setElapsedMs(0)
    setSampleCount(samplePointsRef.current.length)
    setStatus({
      type: 'info',
      message: 'Tracking has started. Move naturally through each highlighted target.',
    })

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const tick = () => {
      if (phaseRef.current !== 'tracking') {
        animationFrameRef.current = null
        return
      }

      const now = performance.now()
      const nextElapsed = now - trackingStartedAtRef.current
      const roundedElapsed = Math.round(nextElapsed / 100) / 10
      const nextSampleCount = samplePointsRef.current.length

      if (roundedElapsed !== elapsedDisplayRef.current) {
        elapsedDisplayRef.current = roundedElapsed
        setElapsedMs(nextElapsed)
      }

      if (nextSampleCount !== sampleCountDisplayRef.current) {
        sampleCountDisplayRef.current = nextSampleCount
        setSampleCount(nextSampleCount)
      }

      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)
  }, [])

  const prepareSession = useCallback(
    (announce = false) => {
      const nextTargets = buildTargetSequence()
      setSessionIdle(nextTargets, announce ? { type: 'info', message: 'Prepare for the countdown.' } : { type: '', message: '' })
    },
    [setSessionIdle],
  )

  const startCountdown = useCallback(() => {
    console.log('[Motion] startCountdown')
    if (isUploading || phaseRef.current !== 'idle') {
      return
    }

    const nextTargets = buildTargetSequence()
    phaseRef.current = 'countdown'
    setPhase('countdown')
    countdownStartedAtRef.current = performance.now()
    countdownDisplayRef.current = 3
    setCountdownValue(3)
    setElapsedMs(0)
    setSampleCount(0)
    elapsedDisplayRef.current = 0
    sampleCountDisplayRef.current = 0
    samplePointsRef.current = []
    currentTargetIndexRef.current = 0
    completedTargetIndicesRef.current = new Set()
    setCurrentTargetIndex(0)
    setCompletedTargetIndices([])
    setTargets(nextTargets)
    setStatus({
      type: 'info',
      message: 'Prepare for the countdown. Keep your pointer near the center target.',
    })

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const tick = () => {
      if (phaseRef.current !== 'countdown') {
        animationFrameRef.current = null
        return
      }

      const elapsed = performance.now() - countdownStartedAtRef.current
      let nextCountdown = 3

      if (elapsed >= 3000 && elapsed < 3600) {
        nextCountdown = 'GO'
      } else if (elapsed >= 2000) {
        nextCountdown = 1
      } else if (elapsed >= 1000) {
        nextCountdown = 2
      }

      if (nextCountdown !== countdownDisplayRef.current) {
        countdownDisplayRef.current = nextCountdown
        setCountdownValue(nextCountdown)
      }

      if (elapsed >= 3600) {
        beginTracking()
        return
      }

      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)
  }, [beginTracking, isUploading])

  const recordSample = useCallback((event, bounds) => {
    console.log('[Motion] recordSample')
    const x = clamp(event.clientX - bounds.left, 0, bounds.width)
    const y = clamp(event.clientY - bounds.top, 0, bounds.height)

    samplePointsRef.current.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      timestamp: Number((performance.now() - trackingStartedAtRef.current).toFixed(2)),
      pointerType: event.pointerType || 'mouse',
    })

    const nextSampleCount = samplePointsRef.current.length
    if (nextSampleCount !== sampleCountDisplayRef.current) {
      sampleCountDisplayRef.current = nextSampleCount
      setSampleCount(nextSampleCount)
    }

    const targetIndex = currentTargetIndexRef.current
    const activeTarget = targetsRef.current[targetIndex]
    if (!activeTarget) {
      return
    }

    const targetX = activeTarget.x * bounds.width
    const targetY = activeTarget.y * bounds.height
    const minDimension = Math.min(areaSizeRef.current.width, areaSizeRef.current.height)
    const targetRadius = clamp(Math.round(minDimension * 0.045), 18, 28)
    const distance = Math.hypot(x - targetX, y - targetY)

    // Target reached
    if (distance > targetRadius) {
      return
    }

    console.log('[Motion] target completion check passed')

    if (!completedTargetIndicesRef.current.has(targetIndex)) {
      completedTargetIndicesRef.current.add(targetIndex)
      const completedIndices = Array.from(completedTargetIndicesRef.current)
      setCompletedTargetIndices(completedIndices)
    }

    const nextTargetIndex = targetIndex + 1
    currentTargetIndexRef.current = nextTargetIndex

    if (nextTargetIndex >= targetsRef.current.length) {
      finishSession()
      return
    }

    setCurrentTargetIndex(nextTargetIndex)
  }, [finishSession])

  const handlePointerMove = (event) => {
    console.log('[Motion] handlePointerMove')
    if (phaseRef.current !== 'tracking' || isUploading) {
      return
    }

    const bounds = getAreaBounds()
    if (!bounds) {
      return
    }

    recordSample(event, bounds)
  }

  const handlePointerDown = (event) => {
    console.log('[Motion] handlePointerDown')
    if (phaseRef.current !== 'tracking' || isUploading) {
      return
    }

    const bounds = getAreaBounds()
    if (!bounds) {
      return
    }

    latestPointerIdRef.current = event.pointerId

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is best-effort for accessibility and cross-browser support.
    }

    recordSample(event, bounds)
  }

  const handlePointerUp = (event) => {
    if (latestPointerIdRef.current === event.pointerId) {
      latestPointerIdRef.current = null
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Ignore capture release failures; the assessment remains functional without it.
    }
  }

  const handlePointerCancel = (event) => {
    if (latestPointerIdRef.current === event.pointerId) {
      latestPointerIdRef.current = null
    }
  }

  const handleReset = () => {
    if (isUploading) {
      return
    }

    prepareSession(false)
  }

  const handleSubmit = async () => {
    if (isUploading) {
      return
    }

    if (phaseRef.current === 'idle' || phaseRef.current === 'countdown') {
      setStatus({
        type: 'error',
        message: 'Start and complete the assessment before submitting.',
      })
      return
    }

    if (phaseRef.current !== 'complete' || completedTargetIndicesRef.current.size !== TOTAL_TARGETS) {
      setStatus({
        type: 'error',
        message: 'Complete all targets before submitting.',
      })
      return
    }

    if (samplePointsRef.current.length < MIN_SAMPLE_COUNT) {
      setStatus({
        type: 'error',
        message: 'Please complete the motion task with more movement before submitting.',
      })
      return
    }

    try {
      setIsUploading(true)
      setStatus({ type: 'info', message: 'Uploading motion data...' })

      const duration = Number((trackingStartedAtRef.current ? (elapsedDisplayRef.current || performance.now() - trackingStartedAtRef.current) : 0) / 1000)
        .toFixed(2)

      await uploadMotion({
        duration: Number(duration),
        sampleCount: samplePointsRef.current.length,
        targetsCompleted: completedTargetIndicesRef.current.size,
        totalTargets: targetsRef.current.length,
        areaWidth: areaSizeRef.current.width,
        areaHeight: areaSizeRef.current.height,
        points: samplePointsRef.current,
      })

      setStatus({
        type: 'success',
        message: 'Motion data uploaded successfully.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Motion upload failed.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const targetRadius = clamp(Math.round(Math.min(areaSize.width, areaSize.height) * 0.045), 18, 28)
  const trackingGlowClass =
    phase === 'tracking'
      ? 'border-blue-300 shadow-[0_0_0_1px_rgba(37,99,235,0.14),0_0_24px_rgba(59,130,246,0.18)]'
      : 'border-slate-200'

  const phaseLabel =
    phase === 'countdown' ? 'Countdown' : phase === 'tracking' ? 'Tracking' : phase === 'complete' ? 'Complete' : 'Ready'

  const countdownDisplay = countdownValue ?? 'GO'
  const progressLabel =
    phase === 'tracking' || phase === 'complete'
      ? `Target ${Math.min(currentTargetIndex + 1, TOTAL_TARGETS)} of ${TOTAL_TARGETS}`
      : `Target 1 of ${TOTAL_TARGETS}`

  const targetPositions = targets.map((target, index) => {
    const x = areaSize.width * target.x
    const y = areaSize.height * target.y
    const isCompleted = completedTargetIndices.includes(index)
    const isActive =
      phase === 'tracking' &&
      index === currentTargetIndex &&
      !isCompleted

    return {
      id: target.id,
      x,
      y,
      isCompleted,
      isActive,
    }
  })

  return (
    <AssessmentPageLayout
      eyebrow="Motion Assessment"
      title="Motion Analysis"
      description="Move your pointer naturally to each highlighted target after the countdown begins. Your movement will be securely recorded for AI-assisted motor analysis."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <AssessmentCard title="Tracking Area" icon={MotionIcon}>
          <p className="text-sm leading-6 text-slate-600">
            Follow the guided targets in order. Move smoothly, keep a comfortable pace, and let the
            session run until it completes or reaches the time limit.
          </p>

          <div
            ref={trackingAreaRef}
            aria-label="Guided motion tracking area"
            role="region"
            className={`mt-6 rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50 p-4 transition-all duration-300 ${trackingGlowClass}`}
          >
            <div
              className={`relative min-h-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-300 ${
                phase === 'tracking' ? 'border-blue-200' : 'border-slate-200'
              }`}
              style={{
                touchAction: 'none',
                backgroundImage:
                  'linear-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerLeave={handlePointerUp}
            >
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  {phaseLabel}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-700">{progressLabel}</div>
              </div>

              {(phase === 'idle' || phase === 'countdown') && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="absolute h-px w-28 bg-blue-200/70" />
                  <div className="absolute h-28 w-px bg-blue-200/70" />
                  <div className="h-4 w-4 rounded-full border-2 border-blue-400/80 bg-white shadow-sm" />
                </div>
              )}

              {targetPositions.map((target) => (
                <motion.div
                  key={target.id}
                  className="absolute"
                  style={{
                    left: target.x,
                    top: target.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={
                    target.isActive && phase !== 'complete'
                      ? { scale: [1, 1.12, 1], opacity: 1 }
                      : { scale: 1, opacity: target.isCompleted ? 0.55 : 0.8 }
                  }
                  transition={
                    target.isActive && phase !== 'complete'
                      ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.25 }
                  }
                >
                  <div
                    className={`flex items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300 ${
                      target.isCompleted
                        ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                        : target.isActive
                          ? 'border-blue-500 bg-blue-600 text-white shadow-blue-600/20'
                          : 'border-blue-200 bg-white text-blue-500'
                    }`}
                    style={{
                      width: `${targetRadius * 2}px`,
                      height: `${targetRadius * 2}px`,
                    }}
                  >
                    {target.isCompleted ? (
                      <span className="text-sm font-semibold">✓</span>
                    ) : target.isActive ? (
                      <span className="h-3 w-3 rounded-full bg-current" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-current/80" />
                    )}
                  </div>
                </motion.div>
              ))}

              {phase === 'complete' && (
                <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-6">
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                    Assessment complete. Ready to submit.
                  </div>
                </div>
              )}
            </div>
          </div>
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
              <li>Wait for the countdown, then move through the highlighted targets in order.</li>
              <li>Use a smooth, comfortable motion to produce a stable tracking pattern.</li>
              <li>The assessment ends automatically after every target has been completed.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Countdown
            </p>
            <div className="mt-4 rounded-2xl bg-white px-5 py-7 text-center shadow-sm">
              <motion.div
                key={`${phase}-${countdownDisplay}`}
                initial={{ opacity: 0, scale: 0.88, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <p className="text-4xl font-semibold tracking-tight text-slate-900">
                  {phase === 'countdown' ? countdownDisplay : phase === 'tracking' ? formatSeconds(elapsedMs) : phase === 'complete' ? 'Done' : 'Ready'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {phase === 'countdown'
                    ? 'The session will begin automatically.'
                    : phase === 'tracking'
                      ? `Elapsed time: ${formatSeconds(elapsedMs)}`
                      : phase === 'complete'
                        ? 'Assessment complete. Ready to submit.'
                        : 'Press Start Tracking to begin.'}
                </p>
              </motion.div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatPill label="Tracking status" value={phaseLabel} />
              <StatPill label="Target" value={`${Math.min(currentTargetIndex + 1, TOTAL_TARGETS)} / ${TOTAL_TARGETS}`} />
              <StatPill label="Elapsed" value={formatSeconds(elapsedMs)} />
              <StatPill label="Samples" value={String(sampleCount)} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startCountdown}
                disabled={isUploading || phase !== 'idle'}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-blue-600"
              >
                {phase === 'countdown' ? 'Counting Down...' : phase === 'tracking' ? 'Tracking...' : 'Start Tracking'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-slate-300 disabled:hover:bg-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-slate-300 disabled:hover:bg-white"
              >
                {isUploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
            {status.message ? (
              <p className={`mt-4 text-sm leading-6 ${statusClassName}`} aria-live="polite">
                {status.message}
              </p>
            ) : null}
          </div>
        </motion.aside>
      </div>
    </AssessmentPageLayout>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function MotionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 17h10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7l2 2-2 2" />
    </svg>
  )
}

export default MotionAssessment
