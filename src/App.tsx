import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { NamePage } from './pages/onboarding/NamePage'
import { GoalsPage } from './pages/onboarding/GoalsPage'
import { RoutineQuestionPage } from './pages/onboarding/RoutineQuestionPage'
import { ScorePage } from './pages/onboarding/ScorePage'
import { CreatingPage } from './pages/onboarding/CreatingPage'
import { PaywallPage } from './pages/onboarding/PaywallPage'
import { PaymentPage } from './pages/onboarding/PaymentPage'
import { PaymentSuccessPage } from './pages/onboarding/PaymentSuccessPage'
import { OfferPage } from './pages/onboarding/OfferPage'
import { ContractPage } from './pages/onboarding/ContractPage'
import { ChallengeSelectPage } from './pages/onboarding/ChallengeSelectPage'
import { StartDatePage } from './pages/onboarding/StartDatePage'
import { LegacyRotinaRedirect } from './pages/onboarding/OnboardingRedirects'
import { HomePage } from './pages/app/HomePage'
import { ProgressPage } from './pages/app/ProgressPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { EmailAuthPage } from './pages/EmailAuthPage'

import { AuthSessionSync } from './components/auth/AuthSessionSync'

import { AdminGuard } from './components/admin/AdminGuard'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminSubscribersPage } from './pages/admin/AdminSubscribersPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthSessionSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/email" element={<EmailAuthPage />} />

        {/* Funil comercial enxuto */}
        <Route path="/onboarding/nome" element={<NamePage />} />
        <Route path="/onboarding/objetivos" element={<GoalsPage />} />
        <Route path="/onboarding/quiz/:step" element={<RoutineQuestionPage />} />
        <Route path="/onboarding/resultado" element={<ScorePage />} />
        <Route path="/onboarding/criando" element={<CreatingPage />} />
        <Route path="/onboarding/planos" element={<PaywallPage />} />
        <Route path="/onboarding/pagamento" element={<PaymentPage />} />
        <Route path="/onboarding/pagamento/sucesso" element={<PaymentSuccessPage />} />
        <Route path="/onboarding/oferta" element={<OfferPage />} />
        <Route path="/onboarding/inicio" element={<StartDatePage />} />

        {/* Atalhos do funil antigo */}
        <Route path="/onboarding/pronto" element={<Navigate to="/onboarding/nome" replace />} />
        <Route path="/onboarding/beneficios" element={<Navigate to="/onboarding/nome" replace />} />
        <Route path="/onboarding/apresentacao" element={<Navigate to="/onboarding/nome" replace />} />
        <Route path="/onboarding/genero" element={<Navigate to="/onboarding/objetivos" replace />} />
        <Route path="/onboarding/rotina/:step" element={<LegacyRotinaRedirect />} />
        <Route path="/onboarding/ciencia" element={<Navigate to="/onboarding/resultado" replace />} />
        <Route path="/onboarding/dia/:day" element={<Navigate to="/onboarding/planos" replace />} />
        <Route path="/onboarding/plano" element={<Navigate to="/onboarding/planos" replace />} />
        <Route path="/onboarding/transformacao" element={<Navigate to="/onboarding/planos" replace />} />
        <Route path="/onboarding/contrato" element={<ContractPage />} />
        <Route path="/onboarding/desafio" element={<ChallengeSelectPage />} />
        <Route path="/onboarding/niveis" element={<Navigate to="/app" replace />} />

        <Route path="/app" element={<HomePage />} />
        <Route path="/app/hoje" element={<Navigate to="/app" replace />} />
        <Route path="/app/insights" element={<Navigate to="/app" replace />} />
        <Route path="/app/progresso" element={<ProgressPage />} />
        <Route path="/app/galeria" element={<Navigate to="/app/progresso#evolucao" replace />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="assinantes" element={<AdminSubscribersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
