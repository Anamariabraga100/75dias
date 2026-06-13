import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ReadyPage } from './pages/onboarding/ReadyPage'
import { BenefitsPage } from './pages/onboarding/BenefitsPage'
import { IntroPage } from './pages/onboarding/IntroPage'
import { NamePage } from './pages/onboarding/NamePage'
import { GenderPage } from './pages/onboarding/GenderPage'
import { GoalsPage } from './pages/onboarding/GoalsPage'
import { RoutineQuestionPage } from './pages/onboarding/RoutineQuestionPage'
import { SciencePage } from './pages/onboarding/SciencePage'
import { ScorePage } from './pages/onboarding/ScorePage'
import { CreatingPage } from './pages/onboarding/CreatingPage'
import { DayProgressPage } from './pages/onboarding/DayProgressPage'
import { BlueprintPage } from './pages/onboarding/BlueprintPage'
import { TransformationPage } from './pages/onboarding/TransformationPage'
import { ContractPage } from './pages/onboarding/ContractPage'
import { PaywallPage } from './pages/onboarding/PaywallPage'
import { PaymentPage } from './pages/onboarding/PaymentPage'
import { PaymentSuccessPage } from './pages/onboarding/PaymentSuccessPage'
import { OfferPage } from './pages/onboarding/OfferPage'
import { ChallengeSelectPage } from './pages/onboarding/ChallengeSelectPage'
import { StartDatePage } from './pages/onboarding/StartDatePage'
import { HomePage } from './pages/app/HomePage'
import { ProgressPage } from './pages/app/ProgressPage'
import { GalleryPage } from './pages/app/GalleryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/onboarding/pronto" element={<ReadyPage />} />
        <Route path="/onboarding/beneficios" element={<BenefitsPage />} />
        <Route path="/onboarding/apresentacao" element={<IntroPage />} />
        <Route path="/onboarding/nome" element={<NamePage />} />
        <Route path="/onboarding/genero" element={<GenderPage />} />
        <Route path="/onboarding/objetivos" element={<GoalsPage />} />
        <Route path="/onboarding/rotina/:step" element={<RoutineQuestionPage />} />
        <Route path="/onboarding/ciencia" element={<SciencePage />} />
        <Route path="/onboarding/resultado" element={<ScorePage />} />
        <Route path="/onboarding/criando" element={<CreatingPage />} />
        <Route path="/onboarding/dia/:day" element={<DayProgressPage />} />
        <Route path="/onboarding/plano" element={<BlueprintPage />} />
        <Route path="/onboarding/transformacao" element={<TransformationPage />} />
        <Route path="/onboarding/contrato" element={<ContractPage />} />
        <Route path="/onboarding/planos" element={<PaywallPage />} />
        <Route path="/onboarding/pagamento" element={<PaymentPage />} />
        <Route path="/onboarding/pagamento/sucesso" element={<PaymentSuccessPage />} />
        <Route path="/onboarding/oferta" element={<OfferPage />} />
        <Route path="/onboarding/desafio" element={<ChallengeSelectPage />} />
        <Route path="/onboarding/niveis" element={<Navigate to="/onboarding/desafio" replace />} />
        <Route path="/onboarding/inicio" element={<StartDatePage />} />

        <Route path="/app" element={<HomePage />} />
        <Route path="/app/hoje" element={<Navigate to="/app" replace />} />
        <Route path="/app/insights" element={<Navigate to="/app" replace />} />
        <Route path="/app/progresso" element={<ProgressPage />} />
        <Route path="/app/galeria" element={<GalleryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
