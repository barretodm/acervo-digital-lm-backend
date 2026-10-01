# acervo-digital-lm-backend

API REST do projeto Acervo Digital LM — camada de aplicação do LM Escritório de Arte. Consumida pelo [`acervo-digital-lm-frontend`](../acervo-digital-lm-frontend), orquestra a lógica de negócio (funil de status, histórico interno, notificação por e-mail) e integra com o Supabase (banco de dados, storage e autenticação).

## Stack

- Node.js + Express
- Supabase (`@supabase/supabase-js`) — PostgreSQL, Storage e Auth
- Nodemailer — notificação por e-mail ao galerista
- Deploy como função serverless na Vercel

## Estrutura de pastas

```
api/                 # entrypoint serverless (Vercel)
src/
├── app.js            # configuracao do Express (middlewares, rotas)
├── server.js          # entrypoint local (npm run dev)
├── config/             # configuracao de ambiente e cliente Supabase
├── routes/              # definicao das rotas (obras, interesses, auth)
├── controllers/           # tratamento das requisicoes HTTP
├── services/                # regras de negocio (funil de status, historico, e-mail)
├── repositories/              # acesso a dados (Supabase)
├── middlewares/                 # autenticacao, tratamento de erros, validacao
├── validators/                   # schemas de validacao de entrada
├── utils/                         # funcoes utilitarias
└── constants/                      # constantes compartilhadas (status, etc.)
```

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

A API sobe em `http://localhost:3333`. Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e as credenciais SMTP no `.env`.
