import { useState } from 'react'
import { Lock, Plus, X, ArrowRight } from 'lucide-react'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { BottomSheet, BottomSheetPanel } from '../../components/ui/BottomSheet'
import { useAppStore } from '../../store/useAppStore'
import {
  PHOTO_INTERVAL_DAYS,
  daysUntilNextPhoto,
  getPhotoDaysUpTo,
  getAllWeeklySlots,
  getActiveComparisonIndex,
  isPhotoDay,
  MONTHLY_COMPARISONS,
} from '../../lib/photoSchedule'
import { getDisplayDay } from '../../lib/demoProgress'

/** Fotos ilustrativas — pessoas treinando (assets locais) */
const GALLERY_PHOTOS = [
  '/gallery/train-1.jpg',
  '/gallery/train-2.jpg',
  '/gallery/train-3.jpg',
  '/gallery/train-4.jpg',
  '/gallery/train-5.jpg',
  '/gallery/train-6.jpg',
]

const MIRROR_START = GALLERY_PHOTOS[0]
const MIRROR_PROGRESS = GALLERY_PHOTOS[1]

const MIRROR_GALLERY = GALLERY_PHOTOS

function photoUrlForDay(day: number): string {
  return MIRROR_GALLERY[Math.floor((day - 1) / PHOTO_INTERVAL_DAYS) % MIRROR_GALLERY.length]
}

function buildExamplePhotos(maxDay = 90) {
  return getPhotoDaysUpTo(maxDay).map((day) => ({
    day,
    url: photoUrlForDay(day),
    label: day === 1 ? 'Início' : day % 30 === 0 ? `Dia ${day}` : `Registro`,
  }))
}

const ALL_EXAMPLE_PHOTOS = buildExamplePhotos(90)

function LockModal({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-orange/20 flex items-center justify-center">
            <Lock size={22} className="text-accent-orange" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="font-bold text-lg mb-2">Recurso exclusivo Implacável</h3>
        <p className="text-neutral-400 text-sm leading-relaxed mb-4">
          A galeria com foto a cada 3 dias e relatórios visuais só está disponível no nível{' '}
          <span className="text-accent-orange font-semibold">Implacável</span>.
        </p>

        <div className="bg-neutral-900 rounded-xl p-3 mb-4">
          <p className="text-neutral-500 text-xs mb-1">O que você ganha no Implacável:</p>
          <ul className="text-neutral-300 text-sm space-y-1">
            <li>📷 Foto obrigatória a cada 3 dias</li>
            <li>📊 Comparação visual de 7 em 7 dias</li>
            <li>🏆 Destaque de evolução a cada 30 dias</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm"
        >
          Entendi
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}

function ComparisonPair({
  fromDay,
  toDay,
  locked,
  onLockedClick,
  highlighted,
  fromUrl = MIRROR_START,
  toUrl = MIRROR_PROGRESS,
}: {
  fromDay: number
  toDay: number
  locked?: boolean
  onLockedClick?: () => void
  highlighted?: boolean
  fromUrl?: string
  toUrl?: string
}) {
  const wrapperClass = highlighted
    ? 'border-accent-orange/40 bg-accent-orange/5'
    : 'border-neutral-800 bg-surface'

  return (
    <div
      className={`rounded-2xl border p-3 ${wrapperClass} ${locked ? 'cursor-pointer' : ''}`}
      onClick={locked ? onLockedClick : undefined}
      role={locked ? 'button' : undefined}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 relative rounded-xl overflow-hidden aspect-[3/4]">
          <img
            src={fromUrl}
            alt={`Dia ${fromDay}`}
            className="w-full h-full object-cover"
          />
          {locked && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
          <p className="absolute bottom-2 left-2 right-2 text-xs font-bold z-[1]">Dia {fromDay}</p>
          {locked && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center z-[1]">
              <Lock size={12} className="text-white" />
            </div>
          )}
        </div>

        <ArrowRight size={18} className="text-neutral-600 shrink-0" />

        <div className="flex-1 relative rounded-xl overflow-hidden aspect-[3/4]">
          <img
            src={toUrl}
            alt={`Dia ${toDay}`}
            className="w-full h-full object-cover"
          />
          {locked && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
          <p className="absolute bottom-2 left-2 right-2 text-xs font-bold z-[1]">Dia {toDay}</p>
          {locked && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center z-[1]">
              <Lock size={12} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineLockedRow({
  label,
  unlockLabel,
  onClick,
  showContinues,
}: {
  label: string
  unlockLabel: string
  onClick?: () => void
  showContinues?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-3">
        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
          <Lock size={13} className="text-neutral-500" />
        </div>
        {showContinues && (
          <div className="flex flex-col items-center mt-1">
            <div className="w-px h-3 bg-neutral-800" />
            <div className="flex flex-col gap-1 py-1">
              <div className="w-1 h-1 rounded-full bg-neutral-700" />
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <div className="w-1 h-1 rounded-full bg-neutral-900" />
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex-1 mb-2 rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-3 text-left hover:bg-neutral-900/50 transition-colors"
      >
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{unlockLabel}</p>
      </button>
    </div>
  )
}

function ProgressLockModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <h3 className="font-bold text-lg mb-2">Ainda bloqueado</h3>
        <p className="text-neutral-400 text-sm leading-relaxed mb-4">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm"
        >
          Entendi
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}

export function GalleryPage() {
  const { challengeAccepted, currentDay, challengeId } = useAppStore()
  const [showLockModal, setShowLockModal] = useState(false)
  const [progressLockMsg, setProgressLockMsg] = useState<string | null>(null)

  const isImplacavel = challengeAccepted && challengeId === 'implacavel'
  const planLocked = !isImplacavel
  const openPlanLock = () => setShowLockModal(true)
  const openProgressLock = (msg: string) => setProgressLockMsg(msg)

  const handleTimelineClick = (unlockDay: number, label: string) => {
    if (planLocked) {
      openPlanLock()
      return
    }
    openProgressLock(
      `${label} desbloqueia quando você chegar no dia ${unlockDay}. Continue registrando suas fotos a cada 3 dias.`
    )
  }

  const effectiveDay = getDisplayDay(challengeAccepted, currentDay)
  const photoDays = getPhotoDaysUpTo(isImplacavel ? effectiveDay : 90)
  const userPhotos = ALL_EXAMPLE_PHOTOS.filter((p) => photoDays.includes(p.day))
  const displayPhotos = isImplacavel ? userPhotos : ALL_EXAMPLE_PHOTOS.slice(0, 6)

  const allWeeklySlots = getAllWeeklySlots()
  const monthlyIdx = getActiveComparisonIndex(MONTHLY_COMPARISONS, effectiveDay)
  const weeklyIdx = getActiveComparisonIndex(allWeeklySlots, effectiveDay)

  const activeMonthly = MONTHLY_COMPARISONS[monthlyIdx]
  const nextMonthly = MONTHLY_COMPARISONS[monthlyIdx + 1]
  const hasMoreMonthly = monthlyIdx + 2 < MONTHLY_COMPARISONS.length

  const activeWeekly = allWeeklySlots[weeklyIdx]
  const nextWeekly = allWeeklySlots[weeklyIdx + 1]
  const hasMoreWeekly = weeklyIdx + 2 < allWeeklySlots.length

  const nextPhotoIn = daysUntilNextPhoto(effectiveDay)
  const photoDueToday = isImplacavel && isPhotoDay(effectiveDay)

  return (
    <AppShell>
      <AppHeader />
      <div className="px-4 pt-2 pb-4 space-y-5">
        <div>
          <h1 className="text-xl font-bold">Galeria</h1>
          <p className="text-neutral-500 text-sm">
            {isImplacavel
              ? `Foto a cada ${PHOTO_INTERVAL_DAYS} dias · relatórios automáticos`
              : 'Evolução no espelho · exclusivo no Implacável'}
          </p>
        </div>

        {planLocked && (
          <button
            type="button"
            onClick={openPlanLock}
            className="w-full flex items-center gap-3 bg-accent-orange/10 border border-accent-orange/30 rounded-xl px-4 py-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-orange/20 flex items-center justify-center shrink-0">
              <Lock size={18} className="text-accent-orange" />
            </div>
            <div>
              <p className="font-semibold text-sm text-accent-orange">Galeria bloqueada</p>
              <p className="text-neutral-500 text-xs">
                Foto a cada 3 dias + relatórios — só no Implacável
              </p>
            </div>
          </button>
        )}

        {isImplacavel && (
          <div
            className={`rounded-xl px-4 py-3 border ${
              photoDueToday
                ? 'bg-teal-500/10 border-teal-500/40'
                : 'bg-surface border-neutral-800'
            }`}
          >
            <p className={`text-sm font-semibold ${photoDueToday ? 'text-teal-400' : 'text-white'}`}>
              {photoDueToday
                ? '📷 Hoje é dia de foto — registro obrigatório'
                : `Próxima foto em ${nextPhotoIn} dia${nextPhotoIn !== 1 ? 's' : ''}`}
            </p>
            <p className="text-neutral-500 text-xs mt-0.5">
              Dias de registro: 1, 4, 7, 10, 13… (a cada {PHOTO_INTERVAL_DAYS} dias)
            </p>
          </div>
        )}

        {/* Relatórios — linha do tempo */}
        <section>
          <p className="text-neutral-400 text-xs uppercase tracking-wide mb-2">Relatórios</p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent-orange text-xs font-bold uppercase tracking-wide">
                  ★ Destaque · 30 dias
                </span>
              </div>
              <p className="text-neutral-500 text-xs mb-2">{activeMonthly.label}</p>
              <ComparisonPair
                fromDay={activeMonthly.from}
                toDay={activeMonthly.to}
                highlighted
                locked={planLocked}
                onLockedClick={openPlanLock}
              />
              {nextMonthly && (
                <div className="mt-3 ml-1">
                  <TimelineLockedRow
                    label={nextMonthly.label}
                    unlockLabel={`Desbloqueia no dia ${nextMonthly.to}`}
                    showContinues={hasMoreMonthly}
                    onClick={() => handleTimelineClick(nextMonthly.to, nextMonthly.label)}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide mb-2">
                Comparação de 7 em 7 dias
              </p>
              <p className="text-neutral-500 text-xs mb-2">
                Semana {activeWeekly.week} · Dia {activeWeekly.from} → Dia {activeWeekly.to}
              </p>
              <ComparisonPair
                fromDay={activeWeekly.from}
                toDay={activeWeekly.to}
                locked={planLocked}
                onLockedClick={openPlanLock}
              />
              {nextWeekly && (
                <div className="mt-3 ml-1">
                  <TimelineLockedRow
                    label={`Semana ${nextWeekly.week} · Dia ${nextWeekly.from} → Dia ${nextWeekly.to}`}
                    unlockLabel={`Desbloqueia no dia ${nextWeekly.to}`}
                    showContinues={hasMoreWeekly}
                    onClick={() =>
                      handleTimelineClick(nextWeekly.to, `Semana ${nextWeekly.week}`)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Grid de fotos */}
        <section>
          <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
            {isImplacavel ? 'Registros' : 'Foto a cada 3 dias'}
          </p>
          {!isImplacavel && (
            <p className="text-neutral-600 text-xs mb-3">
              Mesmo ângulo no espelho para ver sua evolução real
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {displayPhotos.map((photo) => (
              <button
                key={photo.day}
                type="button"
                onClick={planLocked ? openPlanLock : undefined}
                className={`relative rounded-xl overflow-hidden aspect-[3/4] text-left ${
                  planLocked ? 'cursor-pointer' : ''
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Dia ${photo.day}`}
                  className="w-full h-full object-cover"
                />
                {planLocked && (
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                {planLocked && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center z-[1]">
                    <Lock size={10} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 z-[1]">
                  <p className="text-[10px] font-bold leading-none">D{photo.day}</p>
                </div>
              </button>
            ))}

            {isImplacavel && photoDueToday && (
              <button
                type="button"
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-teal-500/50 flex flex-col items-center justify-center gap-1 text-teal-400"
              >
                <Plus size={20} />
                <span className="text-[10px] font-medium">Hoje</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {showLockModal && <LockModal onClose={() => setShowLockModal(false)} />}
      {progressLockMsg && (
        <ProgressLockModal message={progressLockMsg} onClose={() => setProgressLockMsg(null)} />
      )}
    </AppShell>
  )
}
