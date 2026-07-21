import { useState } from 'react'
import { ArrowRight, Camera, Lock } from 'lucide-react'
import { PhotoCheckInSheet } from './PhotoCheckInSheet'
import { useAppStore } from '../../store/useAppStore'
import {
  getPhotoDaysUpTo,
  isPhotoDay,
  MONTHLY_COMPARISONS,
} from '../../lib/photoSchedule'

function ComparisonHero({
  fromDay,
  toDay,
  fromUrl,
  toUrl,
}: {
  fromDay: number
  toDay: number
  fromUrl: string
  toUrl: string
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-app-border bg-surface shadow-sm">
      <div className="flex items-stretch">
        <div className="flex-1 relative aspect-[3/4]">
          <img src={fromUrl} alt={`Dia ${fromDay}`} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Início</p>
            <p className="text-sm font-bold text-white">Dia {fromDay}</p>
          </div>
        </div>
        <div className="w-10 flex items-center justify-center bg-app-track shrink-0">
          <ArrowRight size={16} className="text-app-muted" />
        </div>
        <div className="flex-1 relative aspect-[3/4]">
          <img src={toUrl} alt={`Dia ${toDay}`} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Agora</p>
            <p className="text-sm font-bold text-white">Dia {toDay}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface EvolutionMirrorProps {
  displayDay: number
}

export function EvolutionMirror({ displayDay }: EvolutionMirrorProps) {
  const { challengeId, challengeAccepted, mirrorPhotos, registerMirrorPhoto } = useAppStore()
  const [showCheckIn, setShowCheckIn] = useState(false)

  const isImplacavel = challengeAccepted && challengeId === 'implacavel'

  if (!isImplacavel) return null

  const photoDueToday = isPhotoDay(displayDay)
  const registeredDays = getPhotoDaysUpTo(displayDay).filter((d) => mirrorPhotos[d])
  const latestDay =
    registeredDays.length > 0 ? Math.max(...registeredDays) : displayDay >= 1 ? 1 : 1
  const startUrl = mirrorPhotos[1]
  const latestUrl = mirrorPhotos[latestDay] ?? startUrl
  const hasComparison = Boolean(startUrl && latestUrl && latestDay > 1)
  const nextMonthly = MONTHLY_COMPARISONS.find((m) => displayDay < m.to)
  const hasAnyPhoto = registeredDays.length > 0

  // Fora do dia de foto: só mostra o espelho se já existir foto registrada.
  if (!photoDueToday && !hasAnyPhoto) return null

  return (
    <>
      <section id="evolucao" className="space-y-3">
        <div>
          <p className="text-app-muted text-xs uppercase tracking-wide mb-0.5">Evolução no espelho</p>
          <p className="text-app-subtle text-xs">
            {photoDueToday
              ? 'Tire a foto do shape hoje — mesmo ângulo e luz'
              : 'Suas fotos de evolução'}
          </p>
        </div>

        {photoDueToday && !mirrorPhotos[displayDay] && (
          <button
            type="button"
            onClick={() => setShowCheckIn(true)}
            className="w-full flex items-center gap-3 rounded-xl bg-teal-500/10 border border-teal-500/40 px-4 py-3 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
              <Camera size={18} className="text-teal-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-teal-600">Tire a foto do shape</p>
              <p className="text-app-muted text-xs">Dia {displayDay} — toque para registrar</p>
            </div>
          </button>
        )}

        {startUrl && (
          <ComparisonHero
            fromDay={1}
            toDay={hasComparison ? latestDay : 1}
            fromUrl={startUrl}
            toUrl={latestUrl ?? startUrl}
          />
        )}

        {hasAnyPhoto && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {getPhotoDaysUpTo(Math.min(displayDay, 90)).map((day) => {
              const url = mirrorPhotos[day]
              const isFuture = day > displayDay
              const isToday = day === displayDay
              const isMissed = day < displayDay && !url && isPhotoDay(day)

              return (
                <div
                  key={day}
                  className={`shrink-0 w-[72px] rounded-xl overflow-hidden border ${
                    isToday && photoDueToday && !url
                      ? 'border-teal-500 ring-2 ring-teal-500/30'
                      : url
                        ? 'border-app-border'
                        : 'border-dashed border-app-border'
                  }`}
                >
                  <div className="aspect-[3/4] relative bg-app-track">
                    {url ? (
                      <img src={url} alt={`Dia ${day}`} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-app-subtle">
                        {isFuture ? (
                          <Lock size={12} />
                        ) : isMissed ? (
                          <span className="text-[9px]">—</span>
                        ) : (
                          <Camera size={14} className="opacity-40" />
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center">
                      <span className="text-[9px] font-bold text-white">D{day}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {nextMonthly && hasAnyPhoto && (
          <p className="text-app-subtle text-[11px] text-center pt-1">
            Próximo destaque: {nextMonthly.label.toLowerCase()} (dia {nextMonthly.to})
          </p>
        )}
      </section>

      {showCheckIn && (
        <PhotoCheckInSheet
          day={displayDay}
          onRegister={(photoUrl) => {
            registerMirrorPhoto(displayDay, photoUrl)
            setShowCheckIn(false)
          }}
          onClose={() => setShowCheckIn(false)}
        />
      )}
    </>
  )
}
