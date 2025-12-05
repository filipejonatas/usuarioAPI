# Explicação dos Arquivos de Teste - Implementação TDD

Este documento explica todos os arquivos criados durante a implementação TDD, seu propósito e como eles trabalham juntos, mapeados conforme o plano do TDD.MD.

---

## 📋 Mapeamento dos Testes por Dia (TDD.MD)

### ✅ Dia 1 — Fundamentos de Teste e Convenções
**Status:** ✅ Implementado

**Objetivo:** Habilitar testes unitários/integração no backend e unitários no frontend.

**Arquivos Criados:**
- `backend/jest.config.js` - Configuração do Jest
- `backend/tests/setup.ts` - Setup global dos testes
- `backend/tests/unit/app.spec.ts` - Teste de fumaça (GET /health → 200)
- `frontend/vitest.config.ts` - Configuração do Vitest
- `frontend/tests/setup.ts` - Setup global dos testes frontend
- `frontend/tests/components/LoginPage.spec.tsx` - Teste básico de componente

**Testes Aplicados:**
- ✅ Teste de fumaça do Express app (GET /health → 200)
- ✅ Teste básico de renderização do componente LoginPage

---

### ✅ Dia 2 — Testes de Validação (Domínio) com Zod
**Status:** ✅ Implementado

**Objetivo:** Capturar as regras de entrada para cadastro de usuário e fixar no teste.

**Arquivos Criados:**
- `backend/src/validation/userSchema.ts` - Schema Zod para validação
- `backend/tests/unit/validation/userSchema.spec.ts` - Testes unitários do schema

**Testes Aplicados:**
- ✅ Casos válidos (com normalização)
- ✅ Dados mínimos válidos (email + password apenas)
- ✅ Rejeição de email inválido
- ✅ Rejeição de senha < 8 caracteres
- ✅ Rejeição de nome < 2 caracteres
- ✅ Rejeição de campos obrigatórios faltando
- ✅ Normalização de email (trim + lowercase)

**Conformidade TDD.MD:**
- ✅ UserCreateSchema criado (email válido, password min 8, name min 2)
- ✅ Testes unitários do schema: casos válidos/inválidos
- ✅ Normalização (trim/lowercase de email)
- ✅ Falhas retornam ZodError mapeável para 400

---

### ⚠️ Dia 3 — Use Case e Fakes (TDD no domínio)
**Status:** ⚠️ Parcialmente Implementado

**Objetivo:** TDD do caso de uso CreateUser isolado do banco.

**Arquivos Criados:**
- `backend/src/domain/interfaces/UserRepository.ts` - Interface do repositório
- `backend/src/domain/interfaces/PasswordHasher.ts` - Interface do hasher
- `backend/tests/fakes/FakeUserRepository.ts` - Fake do repositório
- `backend/tests/fakes/FakePasswordHasher.ts` - Fake do hasher
- `backend/src/domain/useCases/CreateUser.ts` - Caso de uso (implementado)
- `backend/src/infrastructure/adapters/PrismaUserRepository.ts` - Adapter real
- `backend/src/infrastructure/adapters/BcryptPasswordHasher.ts` - Adapter real

**Testes Aplicados:**
- ❌ **FALTANDO:** `backend/tests/unit/useCases/CreateUser.spec.ts`

**O que deveria ter (conforme TDD.MD):**
- ❌ Red: não permite email duplicado
- ❌ Red: senha < 8 rejeita
- ❌ Red: sucesso retorna usuário sem senha/hash
- ❌ Green: implementação mínima
- ❌ Refactor: clareza de nomes e erros (ex.: EMAIL_ALREADY_TAKEN)
- ❌ Testes cobrindo mensagens/códigos de erro

**Nota:** Os fakes e interfaces foram criados, mas os testes unitários do CreateUser ainda não foram implementados.

---

### ✅ Dia 4 — Adapter real + Testes de Rota (HTTP)
**Status:** ✅ Implementado

**Objetivo:** Conectar use case real à rota Express e garantir contrato HTTP via supertest.

**Arquivos Criados:**
- `backend/src/infrastructure/adapters/PrismaUserRepository.ts` - Adapter Prisma
- `backend/src/infrastructure/adapters/BcryptPasswordHasher.ts` - Adapter bcrypt
- `backend/tests/http/users.spec.ts` - Testes HTTP com supertest

**Testes Aplicados:**
- ✅ POST `/api/users` retorna 201 com payload válido
- ✅ POST `/api/users` retorna 400 com payload inválido
- ✅ POST `/api/users` retorna 409 para email duplicado
- ✅ Banco de teste isolado (limpa antes de cada teste)

**Conformidade TDD.MD:**
- ✅ Adapter Prisma para UserRepository (garantir unique por email)
- ✅ Adapter bcrypt para PasswordHasher
- ✅ Dependências injetadas em app.ts
- ✅ Rota POST /users com validação Zod
- ✅ Mapeamento de erros: 400 (payload), 409 (email duplicado), 201 (criado)
- ✅ Testes HTTP: 201 sucesso, 400 payload inválido, 409 duplicidade
- ✅ Banco de teste isolado e limpeza antes de cada teste

---

### ⚠️ Dia 5 — Refino e Cobertura (Unidade e Integração)
**Status:** ⚠️ Parcialmente Implementado

**Objetivo:** Aumentar robustez e cobertura de testes sem alterar comportamento.

**Testes Aplicados:**
- ✅ Caminhos alternativos: trim de email, name mínimo, mensagens de erro (já cobertos no Dia 2)
- ⚠️ Teste de integração leve com Prisma (parcial - existe em users.spec.ts mas não verifica hash)
- ❌ Garantir que senha é persistida com hash (checar bcrypt.compare em teste de integração)

**Frontend:**
- ✅ Teste unitário básico do componente LoginPage
- ❌ Validação client-side com Zod
- ❌ Exibição de erros
- ❌ Submit desabilita durante envio

**Conformidade TDD.MD:**
- ⚠️ Cobertura parcial (faltam testes do CreateUser)
- ❌ Teste de integração verificando hash da senha
- ❌ Testes frontend de formulário completos

---

### ❌ Dia 6 — E2E do Fluxo de Cadastro (Cypress)
**Status:** ❌ Não Implementado

**Objetivo:** Garantir o fluxo ponta a ponta no navegador.

**Testes Aplicados:**
- ❌ Cenário: acessar página de cadastro → preencher formulário válido → enviar → ver confirmação
- ❌ Cenário de erro: tentar cadastrar e-mail já usado → ver mensagem de erro
- ❌ Scripts utilitários para reset/seed do DB antes do E2E

---

### ❌ Dia 7 — Consolidação do TDD
**Status:** ❌ Não Implementado

**Objetivo:** Fixar critérios e preparar terreno para próximos incrementos sob TDD.

**Tarefas Pendentes:**
- ❌ Formalizar "Regras de Teste"
- ❌ Checklist TDD por PR
- ❌ Definir backlog sob TDD

---

## 📁 Infraestrutura de Testes do Backend

### Arquivos de Configuração

#### `backend/jest.config.js`
**Propósito:** Configuração do framework de testes Jest
**O que faz:**
- Configura Jest para trabalhar com TypeScript usando `ts-jest`
- Configura ambiente de teste (Node.js)
- Define padrões de arquivos de teste (`*.spec.ts`, `*.test.ts`)
- Configura coleta e relatório de cobertura
- Aponta para arquivo de setup para inicialização dos testes

**Configurações principais:**
- `preset: 'ts-jest'` - Habilita suporte TypeScript
- `testEnvironment: 'node'` - Para testes backend/Node.js
- `roots` - Onde procurar testes
- `collectCoverageFrom` - Quais arquivos incluir na cobertura

**Mapeamento TDD:** Dia 1

---

#### `backend/tests/setup.ts`
**Propósito:** Setup global de testes que roda antes de todos os testes
**O que faz:**
- Define `NODE_ENV` como 'test' para prevenir que o servidor inicie durante testes
- Define variáveis de ambiente de teste (JWT_SECRET, JWT_EXPIRES_IN)
- Garante ambiente de teste consistente em todos os arquivos de teste

**Por que necessário:** Previne efeitos colaterais (como servidor iniciando) e fornece configuração específica para testes

**Mapeamento TDD:** Dia 1

---

## 🧪 Arquivos de Teste do Backend

### Testes Unitários

#### `backend/tests/unit/app.spec.ts`
**Propósito:** Teste de fumaça para a aplicação Express
**O que testa:**
- GET `/health` retorna status 200
- Corpo da resposta contém `{ status: 'ok' }`

**Por que importante:** Verifica que o app está configurado corretamente e pode lidar com requisições básicas. Este é o primeiro teste que deve passar.

**Padrão de Teste:** AAA (Arrange, Act, Assert)
- **Arrange:** Nenhum setup necessário (teste simples)
- **Act:** Fazer requisição GET para `/health`
- **Assert:** Verificar código de status e corpo da resposta

**Mapeamento TDD:** Dia 1 - Teste de fumaça

---

#### `backend/tests/unit/validation/userSchema.spec.ts`
**Propósito:** Testes para schema de validação Zod
**O que testa:**
- ✅ Dados de usuário válidos (com normalização)
- ✅ Dados mínimos válidos (apenas email + password)
- ❌ Formato de email inválido
- ❌ Senha muito curta (< 8 caracteres)
- ❌ Nome muito curto (< 2 caracteres)
- ❌ Campos obrigatórios faltando
- ✅ Normalização de email (trim + lowercase)

**Por que importante:** Garante que as regras de validação de dados estão corretamente implementadas antes dos dados chegarem ao banco de dados ou lógica de negócio.

**Casos de teste principais:**
1. **Teste de normalização:** Verifica que `"  USER@EXAMPLE.COM  "` se torna `"user@example.com"`
2. **Teste de validação:** Garante que dados inválidos são rejeitados com mensagens de erro apropriadas

**Mapeamento TDD:** Dia 2 - Testes de validação com Zod

---

#### `backend/tests/unit/useCases/CreateUser.spec.ts`
**Status:** ❌ **NÃO IMPLEMENTADO**

**Propósito:** Testes unitários para o caso de uso CreateUser (abordagem TDD)
**O que deveria testar:**
- ✅ Cria usuário com sucesso e retorna usuário sem senha
- ✅ Cria usuário com dados mínimos (apenas email + password)
- ❌ Rejeita endereços de email duplicados
- ❌ Rejeita senha menor que 8 caracteres
- ❌ Lida com duplicatas de email case-insensitive

**Por que importante:** Testa lógica de negócio isoladamente sem banco de dados ou dependências externas. Usa implementações fake para testes rápidos e confiáveis.

**Padrão de Teste:** TDD (Test-Driven Development)
- Testes são escritos primeiro (Red)
- Implementação segue (Green)
- Código é refatorado (Refactor)

**Dependências:** Deveria usar `FakeUserRepository` e `FakePasswordHasher` em vez de implementações reais

**Mapeamento TDD:** Dia 3 - Use Case e Fakes (TDD no domínio)

**⚠️ AÇÃO NECESSÁRIA:** Criar este arquivo de teste seguindo o padrão TDD

---

### Testes HTTP/Integração

#### `backend/tests/http/users.spec.ts`
**Propósito:** Testa endpoints HTTP usando supertest
**O que testa:**
- ✅ POST `/api/users` retorna 201 com payload válido
- ❌ POST `/api/users` retorna 400 com payload inválido
- ❌ POST `/api/users` retorna 409 para email duplicado

**Por que importante:** Testa a camada HTTP completa incluindo:
- Tratamento de requisição/resposta
- Códigos de status
- Mensagens de erro
- Interações com banco de dados

**Setup/Cleanup:**
- `beforeEach`: Limpa banco de dados antes de cada teste
- `afterAll`: Desconecta cliente Prisma após todos os testes

**Nota:** Atualmente usa token fake - em produção, deve usar geração real de token JWT

**Mapeamento TDD:** Dia 4 - Testes de Rota (HTTP)

**Melhorias Pendentes (Dia 5):**
- ❌ Verificar que senha é persistida com hash (checar bcrypt.compare)

---

## 🎭 Implementações Fake (Test Doubles)

### `backend/tests/fakes/FakeUserRepository.ts`
**Propósito:** Implementação em memória do UserRepository para testes
**O que faz:**
- Armazena usuários em memória (array)
- Implementa métodos `findByEmail()` e `create()`
- Fornece métodos auxiliares: `clear()`, `getAll()`

**Por que necessário:**
- Testes rápidos (sem banco de dados necessário)
- Testes isolados (sem efeitos colaterais)
- Comportamento previsível
- Fácil de resetar entre testes

**Quando usar:** Testes unitários que precisam testar lógica de negócio sem complexidade de banco de dados

**Como funciona:**
```typescript
// Armazena usuários em memória
private users: User[] = []

// Normaliza email (como implementação real)
email: data.email.toLowerCase().trim()
```

**Mapeamento TDD:** Dia 3 - Fakes para testes isolados

---

### `backend/tests/fakes/FakePasswordHasher.ts`
**Propósito:** Hasher de senha simples para testes
**O que faz:**
- `hash()`: Prefixa senha com "hashed_"
- `compare()`: Verifica se senha corresponde ao hash armazenado
- Mantém um mapa de hashes para comparação

**Por que necessário:**
- Testes rápidos (sem computação bcrypt)
- Determinístico (mesma entrada = mesma saída)
- Fácil de verificar em testes

**Quando usar:** Testes unitários que precisam de hash de senha sem overhead do bcrypt

**Como funciona:**
```typescript
// Hash fake simples
hash("password123") → "hashed_password123"

// Comparação
compare("password123", "hashed_password123") → true
```

**Mapeamento TDD:** Dia 3 - Fakes para testes isolados

---

## 🏗️ Camada de Domínio (Lógica de Negócio)

### Interfaces

#### `backend/src/domain/interfaces/UserRepository.ts`
**Propósito:** Define contrato para acesso a dados de usuário
**O que define:**
- Tipo `User` (modelo de domínio)
- Tipo `CreateUserData` (entrada para criação)
- Interface `UserRepository` com métodos:
  - `findByEmail(email: string): Promise<User | null>`
  - `create(data: CreateUserData): Promise<User>`

**Por que importante:**
- **Inversão de Dependência:** Lógica de negócio não depende de Prisma
- **Testabilidade:** Pode trocar implementação real por fake para testes
- **Flexibilidade:** Pode mudar banco de dados sem mudar lógica de negócio

**Implementações:**
- `PrismaUserRepository` (real, usa banco de dados)
- `FakeUserRepository` (fake, usa memória)

**Mapeamento TDD:** Dia 3 - Interface do repositório

---

#### `backend/src/domain/interfaces/PasswordHasher.ts`
**Propósito:** Define contrato para hash de senha
**O que define:**
- Interface `PasswordHasher` com métodos:
  - `hash(password: string): Promise<string>`
  - `compare(password: string, hashedPassword: string): Promise<boolean>`

**Por que importante:**
- **Inversão de Dependência:** Lógica de negócio não depende de bcrypt
- **Testabilidade:** Pode trocar implementação real por fake para testes
- **Flexibilidade:** Pode mudar algoritmo de hash sem mudar lógica de negócio

**Implementações:**
- `BcryptPasswordHasher` (real, usa bcrypt)
- `FakePasswordHasher` (fake, prefixo simples)

**Mapeamento TDD:** Dia 3 - Interface do hasher

---

### Casos de Uso

#### `backend/src/domain/useCases/CreateUser.ts`
**Propósito:** Lógica de negócio para criar usuários (implementação TDD)
**O que faz:**
1. Valida comprimento da senha (≥ 8 caracteres)
2. Verifica se email já existe
3. Faz hash da senha
4. Cria usuário no repositório
5. Retorna usuário sem senha

**Tratamento de erros:**
- `EmailAlreadyTakenError` - Quando email já existe
- `PasswordTooShortError` - Quando senha < 8 caracteres

**Por que importante:**
- Contém regras de negócio principais
- Independente de banco de dados/camada HTTP
- Totalmente testável com fakes
- Reutilizável em diferentes interfaces (HTTP, CLI, etc.)

**Dependências:** 
- `UserRepository` (injetado)
- `PasswordHasher` (injetado)

**Tipo de retorno:** `CreateUserResult` (usuário sem senha)

**Mapeamento TDD:** Dia 3 - Caso de uso (implementado, mas falta teste unitário)

---

## 🔌 Camada de Infraestrutura (Adapters)

### `backend/src/infrastructure/adapters/PrismaUserRepository.ts`
**Propósito:** Implementação real do UserRepository usando Prisma
**O que faz:**
- Implementa interface `UserRepository`
- Usa Prisma para interagir com banco de dados PostgreSQL
- Normaliza email (lowercase + trim) antes de operações no banco

**Quando usado:** Em produção e testes de integração

**Características principais:**
- Normalização de email (corresponde à implementação fake)
- Type casting para tipo `User` do domínio
- Tratamento de erros para operações de banco de dados

**Mapeamento TDD:** Dia 4 - Adapter real do repositório

---

### `backend/src/infrastructure/adapters/BcryptPasswordHasher.ts`
**Propósito:** Implementação real do PasswordHasher usando bcrypt
**O que faz:**
- Implementa interface `PasswordHasher`
- Usa bcrypt com 12 salt rounds para hash
- Fornece comparação segura de senha

**Quando usado:** Em produção e testes de integração

**Características principais:**
- Hash seguro (bcrypt com 12 rounds)
- Comparação em tempo constante (previne ataques de timing)

**Mapeamento TDD:** Dia 4 - Adapter real do hasher

---

## ✅ Camada de Validação

### `backend/src/validation/userSchema.ts`
**Propósito:** Schema Zod para validação de criação de usuário
**O que valida:**
- **Email:** Obrigatório, formato válido, normalizado (trim + lowercase)
- **Password:** Obrigatório, mínimo 8 caracteres
- **Name:** Opcional, mínimo 2 caracteres se fornecido
- **Role:** Opcional enum (Admin, User, Manager)

**Transformações:**
- Email: `"  USER@EXAMPLE.COM  "` → `"user@example.com"`
- Name: `"  John Doe  "` → `"John Doe"`

**Por que importante:**
- Validação de entrada na borda (camada HTTP)
- Validação type-safe
- Normalização automática
- Mensagens de erro claras

**Uso:**
```typescript
const result = UserCreateSchema.safeParse(input)
if (result.success) {
  // Usar result.data (normalizado e validado)
} else {
  // Tratar result.error (ZodError)
}
```

**Mapeamento TDD:** Dia 2 - Schema de validação Zod

---

## 🎨 Infraestrutura de Testes do Frontend

### Arquivos de Configuração

#### `frontend/vitest.config.ts`
**Propósito:** Configuração do framework de testes Vitest
**O que faz:**
- Configura Vitest para React/Next.js
- Configura ambiente jsdom (simula navegador)
- Configura aliases de caminho (`@/` → `./src/`)
- Aponta para arquivo de setup

**Configurações principais:**
- `environment: 'jsdom'` - Simula DOM do navegador
- `globals: true` - Torna `describe`, `it`, `expect` disponíveis globalmente
- Plugin React para suporte JSX

**Mapeamento TDD:** Dia 1

---

#### `frontend/tests/setup.ts`
**Propósito:** Setup global de testes para testes frontend
**O que faz:**
- Estende `expect` do Vitest com matchers jest-dom
- Fornece matchers DOM como `toBeInTheDocument()`, `toHaveTextContent()`
- Limpa após cada teste (remove componentes renderizados)

**Por que necessário:**
- Habilita matchers do React Testing Library
- Previne poluição de testes entre testes

**Mapeamento TDD:** Dia 1

---

## 🧪 Arquivos de Teste do Frontend

### `frontend/tests/components/LoginPage.spec.tsx`
**Propósito:** Teste de componente para LoginPage
**O que testa:**
- ✅ Renderiza campo de input de email
- ✅ Renderiza campo de input de senha
- ✅ Renderiza botão de submit

**Por que importante:**
- Verifica que componente renderiza corretamente
- Garante que elementos do formulário estão presentes
- Fundação para testes mais complexos (validação, submissão)

**Padrão de Teste:** AAA
- **Arrange:** Envolver componente em `AuthProvider` (contexto necessário)
- **Act:** Renderizar componente
- **Assert:** Verificar elementos do formulário usando queries do Testing Library

**Dependências:**
- `AuthProvider` - Contexto necessário para autenticação
- `@testing-library/react` - Para renderização e queries
- `@testing-library/jest-dom` - Para matchers DOM

**Mapeamento TDD:** Dia 1 - Teste básico de componente

**Melhorias Pendentes (Dia 5):**
- ❌ Validação client-side com Zod
- ❌ Exibição de erros
- ❌ Submit desabilita durante envio

---

## 📚 Arquivos de Documentação

### `backend/README.md`
**Propósito:** Documentação para executar testes do backend
**O que contém:**
- Comandos de teste (`npm test`, `npm run test:watch`, etc.)
- Explicação da estrutura de testes
- Convenções de teste (padrão AAA, nomenclatura)
- Organização de arquivos

**Mapeamento TDD:** Dia 1 - Documentação de como rodar testes

---

### `frontend/README.md`
**Propósito:** Documentação para executar testes do frontend
**O que contém:**
- Comandos de teste (`npm test`, `npm run test:ui`, etc.)
- Explicação da estrutura de testes
- Convenções de teste
- Organização de arquivos

**Mapeamento TDD:** Dia 1 - Documentação de como rodar testes

---

## 🔄 Como os Arquivos Trabalham Juntos

### Exemplo de Fluxo de Teste: Criando um Usuário

1. **Requisição HTTP** → `tests/http/users.spec.ts`
   - Testa o endpoint HTTP completo
   - Usa banco de dados real (Prisma)

2. **Validação** → `src/validation/userSchema.ts`
   - Valida e normaliza entrada
   - Testado por `tests/unit/validation/userSchema.spec.ts`

3. **Lógica de Negócio** → `src/domain/useCases/CreateUser.ts`
   - Contém regras de negócio
   - **Deveria ser testado por** `tests/unit/useCases/CreateUser.spec.ts` (❌ não implementado)
   - Usa `FakeUserRepository` e `FakePasswordHasher`

4. **Acesso a Dados** → `src/infrastructure/adapters/PrismaUserRepository.ts`
   - Salva no banco de dados
   - Implementa interface `UserRepository`

5. **Hash de Senha** → `src/infrastructure/adapters/BcryptPasswordHasher.ts`
   - Faz hash da senha com segurança
   - Implementa interface `PasswordHasher`

## ✅ Status de Implementação por Dia

| Dia | Objetivo | Status | Arquivos Criados | Testes Aplicados |
|-----|----------|--------|------------------|------------------|
| **Dia 1** | Fundamentos de Teste | ✅ Completo | jest.config.js, setup.ts, app.spec.ts, vitest.config.ts, LoginPage.spec.tsx | Teste de fumaça, teste básico de componente |
| **Dia 2** | Validação com Zod | ✅ Completo | userSchema.ts, userSchema.spec.ts | Casos válidos/inválidos, normalização |
| **Dia 3** | Use Case e Fakes | ⚠️ Parcial | Interfaces, Fakes, CreateUser.ts | ❌ **FALTANDO:** CreateUser.spec.ts |
| **Dia 4** | Adapter real + HTTP | ✅ Completo | Adapters, users.spec.ts | 201, 400, 409 |
| **Dia 5** | Refino e Cobertura | ⚠️ Parcial | - | ❌ Verificação de hash, testes frontend completos |
| **Dia 6** | E2E com Cypress | ❌ Não iniciado | - | - |
| **Dia 7** | Consolidação TDD | ❌ Não iniciado | - | - |


## 📝 Como Usar Estes Testes

1. **Instalar dependências:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Executar testes:**
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend
   cd frontend && npm test
   ```

3. **Ver cobertura:**
   ```bash
   cd backend && npm run test:coverage
   cd frontend && npm run test:coverage
   ```

Todos os arquivos seguem as melhores práticas de TDD! 🎉

