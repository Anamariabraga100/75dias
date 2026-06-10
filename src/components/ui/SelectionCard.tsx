interface SelectionCardProps {
  label: string
  emoji?: string
  selected?: boolean
  onClick: () => void
  showRadio?: boolean
}

export function SelectionCard({
  label,
  emoji,
  selected = false,
  onClick,
  showRadio = true,
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'bg-surface-light ring-2 ring-white/20'
          : 'bg-surface hover:bg-surface-light'
      }`}
    >
      {emoji && <span className="text-2xl shrink-0">{emoji}</span>}
      <span className="flex-1 text-left text-white font-medium">{label}</span>
      {showRadio && (
        <div
          className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
            selected ? 'border-white bg-white' : 'border-neutral-600'
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
        </div>
      )}
    </button>
  )
}

export function MultiSelectCard({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string
  emoji: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <SelectionCard
      label={label}
      emoji={emoji}
      selected={selected}
      onClick={onClick}
      showRadio
    />
  )
}
