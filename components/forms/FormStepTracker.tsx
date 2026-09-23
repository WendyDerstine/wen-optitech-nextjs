type Props = {
  total: number
  current: number
}

/** A single-step form is just a form — no progress bar of one. */
export default function FormStepTracker({ total, current }: Props) {
  if (total < 2) return null

  return (
    <div className="mb-lg space-y-2">
      <p className="text-label font-medium text-fg-muted tracking-label uppercase">
        Step {current + 1} of {total}
      </p>
      <ol className="flex items-center" aria-label="Form progress">
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < current
          const isCurrent   = index === current
          return (
            <li
              key={index}
              className={`flex items-center ${index < total - 1 ? 'flex-1' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-label font-semibold',
                  isCompleted ? 'bg-brand text-fg-on-brand'
                  : isCurrent ? 'bg-surface text-brand ring-2 ring-brand'
                  : 'bg-surface text-fg-muted ring-1 ring-fg/15',
                ].join(' ')}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              {index < total - 1 && (
                <span className={`mx-2 h-px flex-1 ${isCompleted ? 'bg-brand' : 'bg-fg/15'}`} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
