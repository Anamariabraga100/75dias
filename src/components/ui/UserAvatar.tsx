interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ring?: boolean
}

const sizeClasses = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  ring = false,
}: UserAvatarProps) {
  const initial = (name || 'R').charAt(0).toUpperCase()
  const sizeClass = sizeClasses[size]
  const ringClass = ring ? 'ring-2 ring-accent-blue/50 border-2 border-neutral-600' : 'border-2 border-neutral-700'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${ringClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-accent-blue to-cyan-600 flex items-center justify-center font-bold text-white shrink-0 ${sizeClass} ${ringClass} ${className}`}
    >
      {initial}
    </div>
  )
}
