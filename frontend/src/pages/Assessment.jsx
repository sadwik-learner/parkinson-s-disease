import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const assessmentModules = [
  {
    title: 'Spiral Drawing',
    description: 'Draw a spiral using your mouse or touchscreen.',
    to: '/assessment/spiral',
    buttonLabel: 'Start Spiral Test',
    icon: SpiralIcon,
  },
  {
    title: 'Handwriting Analysis',
    description: 'Upload or write a handwriting sample.',
    to: '/assessment/handwriting',
    buttonLabel: 'Start Handwriting Test',
    icon: PencilIcon,
  },
  {
    title: 'Motion Analysis',
    description: 'Analyze pointer movement and motor control.',
    to: '/assessment/motion',
    buttonLabel: 'Start Motion Test',
    icon: MotionIcon,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08, ease: 'easeOut' },
  }),
}

function Assessment() {
  const [progress] = useState(0)

  return (
    <main className="bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Assessment Dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Parkinson&apos;s Disease Assessment
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Complete the following AI-powered assessments to generate your personalized
            Parkinson&apos;s risk analysis.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {assessmentModules.map((module, index) => (
            <motion.article
              key={module.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <module.icon />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{module.title}</h2>
                    <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">{module.description}</p>

              <div className="mt-6">
                <Link
                  to={module.to}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                  {module.buttonLabel}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Overall Assessment Progress</h2>
            <span className="text-sm font-medium text-slate-500">{progress}%</span>
          </div>
          <div
            className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100"
            aria-label="Overall assessment progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Complete all assessments to generate your AI report.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            Before You Begin
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Complete assessments in any order.</li>
            <li>Use a quiet, well-lit space for the drawing and movement tasks.</li>
            <li>Draw naturally without rushing.</li>
            <li>Your data is processed securely.</li>
          </ul>
        </motion.section>
      </section>
    </main>
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

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4a2.1 2.1 0 0 0-3 0L3 14.5V20Z" />
    </svg>
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

export default Assessment
