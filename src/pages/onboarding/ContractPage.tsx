import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { SignaturePad } from '../../components/ui/SignaturePad'
import { useAppStore } from '../../store/useAppStore'

const COMMITMENTS = [
  'Aparecer todos os dias',
  'Escolher disciplina em vez de motivação passageira',
  'Mover o corpo diariamente',
  'Registrar com honestidade',
  'Recomeçar se quebrar uma regra',
]

export function ContractPage() {
  const navigate = useNavigate()
  const { name, signed, setSigned, completeOnboarding } = useAppStore()
  const [localSigned, setLocalSigned] = useState(signed)
  const displayName = name || 'você'

  const handleSign = (s: boolean) => {
    setLocalSigned(s)
    setSigned(s)
  }

  return (
    <OnboardingLayout
      footer={
        <Button
          disabled={!localSigned}
          onClick={() => {
            completeOnboarding()
            navigate('/onboarding/planos')
          }}
        >
          Continuar
        </Button>
      }
    >
      <PageTitle
        title={`${displayName.charAt(0).toUpperCase() + displayName.slice(1)}, vamos firmar o compromisso?`}
        subtitle="A partir de hoje, eu me comprometo a:"
      />

      <ul className="space-y-3 mb-6">
        {COMMITMENTS.map((c) => (
          <li key={c} className="flex items-start gap-3 text-sm text-neutral-300">
            <span className="text-accent-yellow shrink-0">✓</span>
            {c}
          </li>
        ))}
      </ul>

      <SignaturePad onSign={handleSign} />
      <p className="text-neutral-600 text-xs mt-2 text-center">
        *Não armazenamos sua assinatura
      </p>
    </OnboardingLayout>
  )
}
