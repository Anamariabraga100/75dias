import { ChevronRight, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AchievementStatus } from '../../../lib/homeMetrics'

type HomeAchievementsProps = {
  achievements: AchievementStatus[]
}

export function HomeAchievements({ achievements }: HomeAchievementsProps) {
  const navigate = useNavigate()
  const preview = achievements.slice(0, 3)

  return (
    <section className="home-section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Conquistas</h2>
        <button
          type="button"
          onClick={() => navigate('/app/progresso')}
          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 flex items-center gap-0.5 transition-colors"
        >
          Ver todas
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-2.5">
        {preview.map((achievement, index) => (
          <div
            key={achievement.id}
            className={`rounded-2xl border p-4 flex items-center gap-3 home-achievement-card ${
              achievement.unlocked
                ? 'border-accent-green/25 bg-gradient-to-r from-accent-green/8 to-transparent'
                : 'border-neutral-800/80 bg-[#111111]'
            }`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                achievement.unlocked ? 'bg-accent-green/15' : 'bg-neutral-900 grayscale opacity-50'
              }`}
            >
              {achievement.unlocked ? achievement.emoji : <Lock size={16} className="text-neutral-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${achievement.unlocked ? 'text-white' : 'text-neutral-400'}`}>
                {achievement.title}
              </p>
              <p className="text-neutral-500 text-xs mt-0.5 truncate">{achievement.description}</p>
              {!achievement.unlocked && (
                <div className="mt-2 h-1 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-neutral-600 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round((achievement.progress / achievement.days) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {achievement.unlocked ? (
              <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2 py-1 rounded-full shrink-0">
                Conquistada
              </span>
            ) : (
              <span className="text-[10px] font-bold text-neutral-600 tabular-nums shrink-0">
                {achievement.progress}/{achievement.days}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
