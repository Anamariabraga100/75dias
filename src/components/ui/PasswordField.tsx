import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  autoComplete?: string
  hint?: string
}

export function PasswordField({
  value,
  onChange,
  label,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-400 px-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-surface rounded-2xl px-5 py-4 pr-14 text-white text-lg outline-none focus:ring-2 focus:ring-white/20 placeholder:text-neutral-600 transition-all"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {hint && <p className="text-xs text-neutral-500 px-1">{hint}</p>}
    </div>
  )
}

interface PasswordChecklistProps {
  password: string
  confirmPassword?: string
  showMatch?: boolean
}

export function PasswordChecklist({ password, confirmPassword, showMatch }: PasswordChecklistProps) {
  const minLength = password.length >= 6
  const matches =
    showMatch && confirmPassword !== undefined
      ? confirmPassword.length > 0 && password === confirmPassword
      : null

  return (
    <ul className="space-y-1.5 px-1 text-sm">
      <CheckItem ok={minLength} label="Pelo menos 6 caracteres" />
      {showMatch && confirmPassword !== undefined && (
        <CheckItem
          ok={matches === true}
          pending={confirmPassword.length > 0 && !matches}
          label="Senhas iguais"
        />
      )}
    </ul>
  )
}

function CheckItem({
  ok,
  pending,
  label,
}: {
  ok: boolean
  pending?: boolean
  label: string
}) {
  const color = ok ? 'text-emerald-400' : pending ? 'text-red-400' : 'text-neutral-500'

  return (
    <li className={`flex items-center gap-2 ${color}`}>
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          ok
            ? 'bg-emerald-500/20 text-emerald-400'
            : pending
              ? 'bg-red-500/20 text-red-400'
              : 'bg-neutral-800 text-neutral-500'
        }`}
        aria-hidden
      >
        {ok ? '✓' : pending ? '!' : '·'}
      </span>
      {label}
    </li>
  )
}
