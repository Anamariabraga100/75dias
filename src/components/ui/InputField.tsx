interface InputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

export function InputField({
  value,
  onChange,
  placeholder = '',
  type = 'text',
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-surface rounded-2xl px-5 py-4 text-white text-lg outline-none focus:ring-2 focus:ring-white/20 placeholder:text-neutral-600 transition-all"
    />
  )
}
