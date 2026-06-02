# Grupo TRIO — Report de Campanhas WhatsApp

Dashboard interno para análise de campanhas WhatsApp exportadas do GoHighLevel.

## Configuração de variáveis de ambiente

O dashboard busca automaticamente quem respondeu via API do GoHighLevel após o upload do CSV. Para isso, é necessário criar o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do GHL:

```
GHL_API_TOKEN=seu_token_aqui
GHL_LOCATION_ID=seu_location_id_aqui
```

> O token fica apenas no servidor (API Route do Next.js) e nunca é exposto ao cliente.
> Se as variáveis não forem configuradas, o dashboard funciona normalmente sem a coluna de respostas.

Para deploy no Vercel, adicione as mesmas variáveis em **Settings → Environment Variables** do projeto.

## Como rodar localmente

### Pré-requisitos

- Node.js 18+ instalado
- npm, yarn ou pnpm

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no browser.

## Como usar

1. Na página inicial, arraste e solte um ou mais arquivos `.csv` exportados do GoHighLevel (tela "WhatsApp em massa estatísticas" → botão "Baixar")
2. Os arquivos são lidos localmente — nenhum dado é enviado para servidores
3. Clique em **Ver Dashboard** para acessar os relatórios
4. Use o seletor no header para alternar entre campanhas ou ver o consolidado "Todas"

### Formato esperado do CSV

| Nome | Telefone | Status | Data da atualização |
|------|----------|--------|---------------------|
| João Silva | 5511999999999 | Read | 27/05/2025 14:32 |

Status suportados: `Read`, `Delivered`, `Sent`, `Failed`, `Pending`, `Ignored`

O nome da campanha é extraído automaticamente do nome do arquivo (ex: `campanha_feiras_27-05.csv` → "Campanha Feiras 27 05").

## Deploy no Vercel

### Via CLI

```bash
# Instalar a CLI do Vercel (se ainda não tiver)
npm i -g vercel

# Fazer deploy
vercel

# Deploy em produção
vercel --prod
```

### Via GitHub

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
3. Importe o repositório
4. Clique em **Deploy** — o Vercel detecta automaticamente Next.js

Nenhuma variável de ambiente é necessária (100% client-side).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (componentes)
- [Recharts](https://recharts.org/) (gráficos)
- [Radix UI](https://www.radix-ui.com/) (primitivos de UI)
- [Lucide React](https://lucide.dev/) (ícones)

## Estrutura do projeto

```
├── app/
│   ├── layout.tsx          # Layout raiz com fontes e provider
│   ├── globals.css         # Estilos globais
│   ├── page.tsx            # Página de upload (/)
│   └── dashboard/
│       └── page.tsx        # Dashboard (/dashboard)
├── components/
│   ├── ui/                 # Componentes base (button, card, etc.)
│   └── dashboard/          # Componentes do dashboard
├── context/
│   └── CampaignContext.tsx # Context API para dados em memória
├── lib/
│   ├── csvParser.ts        # Parser de CSV do GHL
│   └── utils.ts            # Utilitários e cálculo de métricas
└── types/
    └── index.ts            # Tipos TypeScript
```
