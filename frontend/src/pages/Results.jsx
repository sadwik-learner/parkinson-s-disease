import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const assessmentResults = [
  {
    title: 'Spiral Drawing',
    score: '34%',
    confidence: '93%',
    icon: SpiralIcon,
  },
  {
    title: 'Motion Analysis',
    score: '36%',
    confidence: '94%',
    icon: MotionIcon,
  },
]

const recommendations = [
  {
    title: 'Consult Neurologist',
    description:
      'Review this screening result with a neurologist or qualified clinician for medical evaluation.',
    icon: DoctorIcon,
  },
  {
    title: 'Repeat Assessment',
    description:
      'Run the screening again later to compare trends and reduce the impact of temporary factors.',
    icon: RefreshIcon,
  },
  {
    title: 'Monitor Symptoms',
    description:
      'Monitor symptoms over time and consult a healthcare professional if symptoms persist or worsen.',
    icon: MonitorIcon,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const overallScore = 32
const confidence = 94
const riskLevel = 'Low'

function Results() {
  return (
    <main className="bg-gradient-to-b from-white via-slate-50 to-blue-50 text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute right-[-6rem] top-16 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600"
            >
              Screening Output
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
            >
              Assessment Results
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
            >
              This screening result is a risk estimate only and is not a medical diagnosis.
              Clinical evaluation by a qualified professional is required for interpretation.
            </motion.p>
          </motion.div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Overall Risk
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                    AI Screening Summary
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    The current result combines Spiral Drawing and Motion Assessment data into a
                    screening estimate that supports follow-up discussion.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <CircularProgress score={overallScore} />
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {riskLevel} Risk
                    </span>
                    <span className="text-sm font-medium text-slate-500">Confidence {confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricPill label="Estimated Risk" value={`${overallScore}%`} />
                <MetricPill label="Risk Level" value={riskLevel} />
                <MetricPill label="Confidence" value={`${confidence}%`} />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.12 }}
              className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                AI Summary
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Multimodal screening insight
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                The AI-assisted screening estimate combines spiral drawing and motion assessment
                data to analyze motor patterns associated with Parkinson&apos;s risk. The result can
                help inform next steps, but it is not a medical diagnosis and should not replace a
                clinical evaluation by a qualified neurologist or healthcare professional.
              </p>
              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Screening interpretation</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This AI-assisted screening estimate reflects motor patterns observed during the
                  completed assessments. It is intended to support early awareness and should be
                  interpreted alongside professional medical advice.
                </p>
              </div>
            </motion.section>
          </div>

          <section className="mt-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              <motion.div variants={fadeUp} className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                  Individual Assessment Results
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
                  Module-level screening details
                </h2>
              </motion.div>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {assessmentResults.map((result) => (
                  <motion.article
                    key={result.title}
                    variants={fadeUp}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                          <result.icon />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{result.title}</h3>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Completed
                          </p>
                        </div>
                      </div>
                      <StatusIcon />
                    </div>

                    <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                      <ResultRow label="Score" value={result.score} />
                      <ResultRow label="Confidence" value={result.confidence} />
                      <ResultRow label="Status" value="Completed" />
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                Recommendations
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Suggested next steps</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {recommendations.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <item.icon />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.article>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
              className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                Actions
              </p>
              <div className="mt-5 space-y-3">
                <Link
                  to="/assessment"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  New Assessment
                </Link>
                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
                >
                  Back to Home
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Medical Disclaimer</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This application is intended for educational and preliminary screening purposes
                  only. The results generated by this AI system are not a medical diagnosis and
                  should not replace consultation with a qualified neurologist or healthcare
                  professional.
                </p>
              </div>
            </motion.aside>
          </section>
        </div>
      </section>
    </main>
  )
}

function CircularProgress({ score }) {
  const radius = 58
  const strokeWidth = 12
  const size = radius * 2 + strokeWidth
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" aria-label={`Risk score ${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-slate-100"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-blue-600"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-950">{score}%</span>
        <span className="mt-1 text-sm font-medium text-slate-500">Risk</span>
      </div>
    </div>
  )
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function SpiralIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.1 7 7 7c3.5 0 6.5-2.8 6.5-6.3 0-3.1-2.5-5.7-5.7-5.7-2.8 0-5.1 2.2-5.1 5 0 2.4 1.9 4.4 4.3 4.4 2.1 0 3.8-1.7 3.8-3.8 0-1.8-1.4-3.3-3.2-3.3-1.4 0-2.6 1.1-2.6 2.5 0 1.1.9 2 2 2"
      />
    </svg>
  )
}

function MotionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 17h10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7l2 2-2 2" />
    </svg>
  )
}

function DoctorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-6h-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 8a8 8 0 0 0-14-3M4 16a8 8 0 0 0 14 3" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h4l2-4 4 8 2-4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function StatusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-emerald-600 stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  )
}

export default Results
