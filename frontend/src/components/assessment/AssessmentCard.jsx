import { motion } from 'framer-motion'

function AssessmentCard({ title, icon: Icon, children, className = '' }) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-xl ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Placeholder
          </span>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.article>
  )
}

export default AssessmentCard
