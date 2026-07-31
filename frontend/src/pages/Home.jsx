import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Spiral Drawing',
    description:
      'Reviews spiral sketches for tremor, pressure variation, and motion irregularity.',
    icon: SpiralIcon,
  },
  {
    title: 'Handwriting',
    description:
      'Examines pen strokes, spacing, and writing rhythm to detect fine motor changes.',
    icon: PencilIcon,
  },
  {
    title: 'Motion Analysis',
    description:
      'Tracks pointer movement to understand coordination, stability, and movement smoothness.',
    icon: MouseIcon,
  },
]

const steps = [
  'Upload Data',
  'AI Analysis',
  'Risk Prediction',
  'Generate Report',
]

const advantages = [
  {
    title: 'Multi-Modal AI',
    description:
      'Combines spiral drawing, handwriting, and motion signals for a broader screening view.',
  },
  {
    title: 'Fast Screening',
    description:
      'Delivers a quick digital assessment that is suitable for demos and early triage workflows.',
  },
  {
    title: 'Privacy Focused',
    description:
      'Designed to minimize data exposure and keep the screening experience user-centered.',
  },
  {
    title: 'Clinical Decision Support',
    description:
      'Provides an interpretable risk summary that can support follow-up discussions with clinicians.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

function Home() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm"
            >
              AI-Powered Early Screening
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Early Parkinson&apos;s Screening Using Artificial Intelligence
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
            >
              This platform analyzes multiple digital biomarkers, including spiral drawings,
              handwriting, and pointer movement, to estimate Parkinson&apos;s risk and support early
              screening.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/assessment"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30"
              >
                Start Assessment
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="relative mx-auto flex w-full max-w-xl items-center justify-center"
          >
            <div className="relative h-[28rem] w-full max-w-xl">
              <div className="absolute left-10 top-8 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="absolute right-10 top-20 h-44 w-44 rounded-full bg-slate-400/20 blur-2xl" />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-6 top-8 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur"
              >
                <div className="text-xs font-medium uppercase tracking-[0.24em] text-blue-600">
                  Signal Layer
                </div>
                <div className="mt-2 h-2 w-24 rounded-full bg-gradient-to-r from-blue-500 to-sky-300" />
                <div className="mt-3 h-2 w-16 rounded-full bg-slate-200" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-12 left-0 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <BrainGlyph />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">AI Risk Model</div>
                    <div className="text-xs text-slate-500">Multimodal screening engine</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                className="absolute right-2 top-10 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-xl backdrop-blur"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Screening Output
                </div>
                <div className="mt-3 text-3xl font-bold text-blue-700">87%</div>
                <div className="mt-1 text-sm text-slate-600">Confidence indicator</div>
              </motion.div>

              <div className="absolute inset-0 rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white via-blue-50 to-slate-100 shadow-2xl shadow-blue-100/50" />

              <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-blue-200">
                      Digital Biomarkers
                    </div>
                    <div className="mt-2 text-2xl font-semibold">AI Screening Overview</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-blue-100">
                    Live Demo
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-blue-100">Pattern Stability</div>
                    <div className="mt-3 h-24 rounded-xl bg-gradient-to-t from-blue-500/40 to-transparent p-3">
                      <div className="flex h-full items-end gap-1">
                        <div className="h-6 w-2 rounded-full bg-blue-300" />
                        <div className="h-12 w-2 rounded-full bg-blue-200" />
                        <div className="h-9 w-2 rounded-full bg-blue-300" />
                        <div className="h-16 w-2 rounded-full bg-blue-100" />
                        <div className="h-10 w-2 rounded-full bg-blue-300" />
                        <div className="h-14 w-2 rounded-full bg-blue-200" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-blue-100">Motion Pattern</div>
                    <div className="mt-3 flex h-24 items-center justify-center rounded-xl bg-white/5">
                      <div className="h-14 w-14 rounded-full border border-blue-200/70 bg-blue-400/20" />
                      <div className="ml-3 h-1 w-12 rounded-full bg-blue-300/80" />
                      <div className="ml-2 h-2 w-2 rounded-full bg-blue-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              AI Assessment Modules
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Multiple screening signals in one streamlined experience
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors duration-200 group-hover:bg-blue-100">
                  <feature.icon />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.div variants={fadeUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                How It Works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                A simple workflow from data capture to report generation
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {index < steps.length - 1 ? (
                    <div className="absolute right-[-1.25rem] top-1/2 hidden h-px w-10 bg-gradient-to-r from-blue-400 to-transparent md:block" />
                  ) : null}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{step}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step === 'Upload Data' &&
                      'Collect digital tasks and screening inputs from a guided, user-friendly flow.'}
                    {step === 'AI Analysis' &&
                      'Run the multimodal model to evaluate patterns across the uploaded signals.'}
                    {step === 'Risk Prediction' &&
                      'Translate the AI output into a clear, easy-to-read screening estimate.'}
                    {step === 'Generate Report' &&
                      'Create a structured summary that can be shared or reviewed later.'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Why Choose Our System
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Built for practical screening demos and meaningful clinical conversations
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {advantages.map((item) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-gradient-to-b from-white to-blue-50 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
          >
            Take Your AI Screening Today
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Start an early screening session to explore how multimodal AI can help estimate risk
            and support timely next steps.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/35"
            >
              Start Free Assessment
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
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

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4a2.1 2.1 0 0 0-3 0L3 14.5V20Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13.5 6.5 4 4" />
    </svg>
  )
}

function MouseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
    </svg>
  )
}

function BrainGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V7a2 2 0 0 1 1.5 1.9V9a2 2 0 0 1 0 4v.1A2 2 0 0 1 15 15v.5A2.5 2.5 0 0 1 12.5 18h-1A2.5 2.5 0 0 1 9 15.5V15a2 2 0 0 1-1.5-1.9V13a2 2 0 0 1 0-4V8.9A2 2 0 0 1 9 7v-.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5c.7 0 1.3.6 1.3 1.3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 9.5c-.7 0-1.3.6-1.3 1.3" />
    </svg>
  )
}

export default Home
