## Dia 1 — Fundamentos de Teste e Convenções
### Objetivo
- Habilitar testes unitários/integração no backend e unitários no frontend.
- Definir convenções de TDD e DoD de testes.

### Tarefas
- Backend:
  - Instalar e configurar Jest (ts-jest) e supertest.
  - Adicionar Zod para validações e criar primeiros schemas: UserCreateSchema.
  - Criar pasta de testes: backend/tests/unit e backend/tests/http (ou usar ao lado de src).
  - Escrever 1 teste de fumaça para app.ts (GET /health → 200).
- Frontend:
  - Instalar Vitest + Testing Library e configurar teste de componente básico (ex.: render do botão do formulário).
- Convenções:
  - Padrão AAA; nomes: *.spec.ts; cobrir cenários de sucesso e falha.
  - DoD de testes: testes unitários e de rota devem rodar localmente com npm test e npm run test:http.

### Entregáveis
- Primeiro commit com testes verdes no backend e frontend.
- Documentar no README: como rodar testes.

---

## Dia 2 — Testes de Validação (Domínio) com Zod
### Objetivo
- Capturar as regras de entrada para cadastro de usuário e fixar no teste.

### Tarefas
- Backend:
  - Criar UserCreateSchema (email válido, password min 8, name min 2).
  - Testes unitários do schema: casos válidos/ inválidos, normalização (trim/lowercase de email).
- Se já existe fluxo de cadastro:
  - Criar characterization test mínimo da rota POST /users: status/shape atual (sem refatorar).

### Entregáveis
- Testes unitários de validação passando.
- Falhas retornam ZodError mapeável para 400.

---

## Dia 3 — Use Case e Fakes (TDD no domínio)
### Objetivo
- TDD do caso de uso CreateUser isolado do banco.

### Tarefas
- Backend:
  - Criar uma interface mínima de UserRepository (findByEmail, create).
  - Criar PasswordHasher (hash/compare) interface.
  - Implementar Fakes em memória para testes.
  - TDD do CreateUser:
    - Red: não permite email duplicado; senha < 8 rejeita; sucesso retorna usuário sem senha/hash.
    - Green: implementação mínima.
    - Refactor: clareza de nomes e erros (ex.: EMAIL_ALREADY_TAKEN).
- Testes cobrindo mensagens/códigos de erro.

### Entregáveis
- Testes unitários do CreateUser verdes, sem tocar Prisma/bcrypt reais.

---

## Dia 4 — Adapter real + Testes de Rota (HTTP)
### Objetivo
- Conectar use case real à rota Express e garantir contrato HTTP via supertest.

### Tarefas
- Backend:
  - Implementar adapter Prisma para UserRepository (garantir unique por email).
  - Implementar adapter bcrypt para PasswordHasher.
  - Injetar dependências em app.ts (ou em um container simples).
  - Rota POST /users:
    - Validação com Zod (request body).
    - Mapear erros: 400 (payload), 409 (email duplicado), 201 (criado).
  - Testes HTTP com supertest:
    - 201 no sucesso; 400 payload inválido; 409 duplicidade.
- Manter banco de teste isolado (ex.: SQLite) e limpar antes de cada teste.

### Entregáveis
- Testes de rota passando e estáveis.
- O use case continua testável isoladamente.

---

## Dia 5 — Refino e Cobertura (Unidade e Integração)
### Objetivo
- Aumentar robustez e cobertura de testes sem alterar comportamento.

### Tarefas
- Backend:
  - Cobrir caminhos alternativos: trim de email, name mínimo, mensagens de erro.
  - Teste de integração leve com Prisma (cria e consulta).
  - Garantir que a senha é persistida com hash (checar bcrypt.compare em teste de integração).
- Frontend:
  - Teste unitário do componente de formulário de cadastro:
    - Validação client-side com Zod; exibição de erros; submit desabilita durante envio.

### Entregáveis
- Cobertura de unidade do caso de uso ≥ 70% (meta pragmática).
- Testes front de formulário passando.

---

## Dia 6 — E2E do Fluxo de Cadastro (Cypress)
### Objetivo
- Garantir o fluxo ponta a ponta no navegador.

### Tarefas
- Frontend (Cypress):
  - Cenário: acessar página de cadastro → preencher formulário válido → enviar → ver confirmação.
  - Cenário de erro: tentar cadastrar e-mail já usado → ver mensagem de erro.
- Backend:
  - Criar scripts utilitários para reset/seed do DB antes do E2E.
- Opcional:
  - Rodar Cypress headless localmente com scripts npm.

### Entregáveis
- E2E mínimo rodando localmente com sucesso.

---

## Dia 7 — Consolidação do TDD
### Objetivo
- Fixar critérios e preparar terreno para próximos incrementos sob TDD.

### Tarefas
- Formalizar “Regras de Teste”:
  - Quando criar teste de unidade x integração x E2E.
  - Padrões de mensagens/códigos de erro e mapeamento HTTP.
  - Estratégia de dados de teste (builders/factories simples).
- Checklist TDD por PR:
  - Tem teste de unidade do use case?
  - Tem teste HTTP se houver rota nova?
  - Se impacta fluxo principal, tem E2E?
  - Validações Zod cobertas com casos de erro.
- Definir backlog sob TDD (próximas features): login, recuperação de senha, listagem/paginação, atualização de perfil, etc.