type Props = {
  label?: string
  tooltip?: string
}

// Not Button's `ghost` variant: its color model assumes a brand/dark fill
// behind it (--ot-btn-ghost-fg defaults to the always-light --ot-fg-on-brand,
// only flipping under an explicit data-surface="light" marker). This button
// sits on the form card's plain bg-surface, which already flips light/dark
// with the theme on its own — so it needs --ot-fg (theme-tracking), not a
// static light/dark opt-in that would go wrong in one of the two modes.
export default function ResetButton({ label, tooltip }: Props) {
  return (
    <div title={tooltip}>
      <button
        type="reset"
        className="inline-flex items-center justify-center rounded-ot-control border border-fg/25 px-7 py-3 text-label font-semibold tracking-label uppercase text-fg transition-[background-color,border-color] duration-150 ease-quick hover:border-fg/45 hover:bg-fg/5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-fg disabled:opacity-40 disabled:pointer-events-none"
      >
        {label ?? 'Reset'}
      </button>
    </div>
  )
}
