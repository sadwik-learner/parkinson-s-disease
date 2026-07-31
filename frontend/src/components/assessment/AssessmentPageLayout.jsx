import { motion } from 'framer-motion'

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

function AssessmentPageLayout({ eyebrow, title, description, children }) {
  return (
    <main className="bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageVariants}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>
        </motion.div>

        <div className="mt-10">{children}</div>
      </section>
    </main>
  )
}

export default AssessmentPageLayout
