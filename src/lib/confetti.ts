import confetti from 'canvas-confetti'

/** Dispara confetes intensos ao completar o dia. */
export function fireDayCompleteConfetti() {
  const defaults = {
    startVelocity: 45,
    spread: 360,
    ticks: 90,
    zIndex: 9999,
    disableForReducedMotion: true,
  }

  const shoot = (originX: number, particleCount: number) => {
    confetti({
      ...defaults,
      particleCount,
      origin: { x: originX, y: 0.55 },
      colors: ['#22c55e', '#4ade80', '#fbbf24', '#38bdf8', '#f472b6', '#ffffff'],
    })
  }

  shoot(0.2, 80)
  shoot(0.5, 120)
  shoot(0.8, 80)

  window.setTimeout(() => {
    shoot(0.15, 60)
    shoot(0.85, 60)
  }, 220)

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 160,
      spread: 100,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.35 },
      colors: ['#22c55e', '#a3e635', '#facc15', '#ffffff'],
    })
  }, 450)

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 100,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
    })
    confetti({
      ...defaults,
      particleCount: 100,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
    })
  }, 700)
}
