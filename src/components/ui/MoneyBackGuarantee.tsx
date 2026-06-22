import { ShieldCheck } from 'lucide-react'

interface MoneyBackGuaranteeProps {
  className?: string
  compact?: boolean
}

export function MoneyBackGuarantee({ className = '', compact = false }: MoneyBackGuaranteeProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-xl border border-accent-green/25 bg-accent-green/10 text-accent-green ${
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
      } ${className}`}
    >
      <ShieldCheck size={compact ? 14 : 16} className="shrink-0" />
      <span className="font-medium leading-tight text-center">
        Garantia de 7 dias · dinheiro de volta
      </span>
    </div>
  )
}
