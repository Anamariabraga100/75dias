# 75 Dias

App web de disciplina e desafios de 75 dias — frontend em PT-BR, inspirado no BEHARD.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Zustand (estado + localStorage)

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173)

## Fluxo

1. **Landing** → onboarding completo (nome, objetivos, score, jornada 75 dias, contrato)
2. **Paywall** → seleção de desafio → data de início
3. **App** → dashboard diário com tarefas

## Próximos passos (backend)

- [ ] Supabase — auth, perfil, progresso
- [ ] Gateway de pagamento — Pix + cartão (Stripe/Mercado Pago)
- [ ] Compartilhamento WhatsApp

## Estrutura

```
src/
  components/   # UI reutilizável
  pages/        # Telas (landing, onboarding, app)
  store/        # Estado global (Zustand)
```
