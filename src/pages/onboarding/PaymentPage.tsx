import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Rota legada — checkout vai direto da página de planos. */
export function PaymentPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/onboarding/planos', { replace: true })
  }, [navigate])

  return null
}
