# Padrões de Design Implementados

Este documento descreve os padrões de design implementados no backend da aplicação, suas razões de uso e como eles se integram na arquitetura.

## Índice

1. [Padrões Criacionais](#padrões-criacionais)
   - [Singleton Pattern](#singleton-pattern)
2. [Padrões Estruturais](#padrões-estruturais)
   - [Adapter Pattern](#adapter-pattern)
   - [Dependency Injection Container](#dependency-injection-container)
3. [Padrões Comportamentais](#padrões-comportamentais)
   - [Chain of Responsibility](#chain-of-responsibility)
   - [Use Case Pattern](#use-case-pattern)
   - [Repository Pattern](#repository-pattern)

---

## Padrões Criacionais

### Singleton Pattern

**Localização:** `src/models/prisma.ts`

**Descrição:**
O padrão Singleton garante que apenas uma instância do `PrismaClient` seja criada durante todo o ciclo de vida da aplicação.

**Implementação:**
```typescript
class PrismaSingleton {
    private static instance: PrismaClient

    public static getInstance(): PrismaClient {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient({...})
        }
        return PrismaSingleton.instance
    }
}
```

**Razões de Uso:**
1. **Prevenção de Múltiplas Conexões:** Evita criar múltiplas conexões com o banco de dados, o que pode causar problemas de performance e esgotamento de recursos.
2. **Gerenciamento de Recursos:** O Prisma Client mantém um pool de conexões. Múltiplas instâncias criariam pools separados, desperdiçando recursos.
3. **Hot Reload em Desenvolvimento:** Em ambiente de desenvolvimento, o hot reload pode tentar criar novas instâncias. O Singleton com `globalThis` previne isso.
4. **Consistência:** Garante que toda a aplicação use a mesma instância, mantendo estado e configurações consistentes.

**Benefícios:**
- ✅ Economia de recursos (memória e conexões)
- ✅ Melhor performance
- ✅ Prevenção de problemas em hot reload
- ✅ Fonte única de verdade para acesso ao banco

---

## Padrões Estruturais

### Adapter Pattern

**Localização:** `src/adapters/`

**Descrição:**
O padrão Adapter permite que interfaces incompatíveis trabalhem juntas, convertendo a interface de uma classe em outra interface esperada pelo cliente.

**Implementações:**

#### 1. PrismaUserRepository (`src/adapters/PrismaUserRepository.ts`)
Adapta as operações do Prisma ORM para a interface `UserRepository` do domínio.

**Razões de Uso:**
- **Desacoplamento:** Separa a lógica de negócio da implementação específica do Prisma
- **Testabilidade:** Permite criar implementações fake para testes sem depender do banco real
- **Flexibilidade:** Facilita trocar o ORM no futuro sem alterar o código de negócio
- **Abstração:** Esconde detalhes de implementação do Prisma (normalização de email, mapeamento de dados)

**Exemplo:**
```typescript
export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({...})
    return user ? this.mapToDomain(user) : null
  }
}
```

#### 2. BcryptPasswordHasher (`src/adapters/BcryptPasswordHasher.ts`)
Adapta as operações do bcrypt para a interface `PasswordHasher` do domínio.

**Razões de Uso:**
- **Abstração:** Permite trocar a biblioteca de hash sem alterar o código de negócio
- **Testabilidade:** Facilita criar implementações fake para testes
- **Configuração Centralizada:** Centraliza configurações como `saltRounds`

#### 3. JwtTokenGenerator (`src/adapters/JwtTokenGenerator.ts`)
Adapta as operações do jsonwebtoken para a interface `TokenGenerator` do domínio.

**Razões de Uso:**
- **Abstração:** Separa a lógica de tokens da biblioteca específica
- **Tratamento de Erros:** Centraliza o tratamento de diferentes tipos de erro JWT
- **Configuração:** Centraliza configurações de expiração e algoritmo

**Benefícios Gerais do Adapter Pattern:**
- ✅ Desacoplamento entre domínio e infraestrutura
- ✅ Facilita testes unitários com mocks/fakes
- ✅ Permite trocar implementações sem alterar código de negócio
- ✅ Melhora manutenibilidade e extensibilidade

---

### Dependency Injection Container

**Localização:** `src/container/Container.ts`

**Descrição:**
O Container de Injeção de Dependências é um padrão estrutural que centraliza a criação e gerenciamento de dependências, resolvendo-as automaticamente quando solicitadas.

**Implementação:**
```typescript
class Container {
  private instances: Map<string, any> = new Map()
  private factories: Map<string, () => any> = new Map()

  registerSingleton<T>(key: string, factory: () => T): void
  resolve<T>(key: string): T
}
```

**Razões de Uso:**
1. **Inversão de Controle (IoC):** As classes não criam suas próprias dependências, elas são injetadas
2. **Gerenciamento de Ciclo de Vida:** Controla quando instâncias são criadas (singleton vs transient)
3. **Resolução Automática:** Resolve dependências automaticamente, evitando código boilerplate
4. **Testabilidade:** Facilita substituir dependências por mocks em testes
5. **Manutenibilidade:** Centraliza a configuração de dependências em um único lugar
6. **Desacoplamento:** Classes não precisam conhecer como criar suas dependências

**Exemplo de Uso:**
```typescript
// Registro
container.registerSingleton<CreateUserUseCase>('CreateUserUseCase', () => {
  return new CreateUserUseCase(
    container.resolve<UserRepository>('UserRepository'),
    container.resolve<PasswordHasher>('PasswordHasher')
  )
})

// Resolução
const useCase = container.resolve<CreateUserUseCase>('CreateUserUseCase')
```

**Benefícios:**
- ✅ Reduz acoplamento entre classes
- ✅ Facilita testes com mocks
- ✅ Centraliza configuração de dependências
- ✅ Melhora manutenibilidade
- ✅ Permite trocar implementações facilmente

---

## Padrões Comportamentais

### Chain of Responsibility

**Localização:** `src/middleware/MiddlewareChain.ts` e `src/middleware/handlers/`

**Descrição:**
O padrão Chain of Responsibility permite passar uma requisição através de uma cadeia de handlers. Cada handler decide se processa a requisição ou a passa para o próximo handler na cadeia.

**Implementação:**
```typescript
class MiddlewareChain {
  private handlers: MiddlewareHandler[] = []

  add(handler: MiddlewareHandler): MiddlewareChain
  execute(): (req: Request, res: Response, next: NextFunction) => void
}
```

**Handlers Implementados:**

1. **AuthenticationHandler** (`src/middleware/handlers/AuthenticationHandler.ts`)
   - Verifica e valida tokens JWT
   - Anexa informações do usuário à requisição

2. **RoleAuthorizationHandler** (`src/middleware/handlers/RoleAuthorizationHandler.ts`)
   - Verifica se o usuário tem as roles necessárias
   - Depende do AuthenticationHandler ter executado antes

**Razões de Uso:**
1. **Separação de Responsabilidades:** Cada handler tem uma responsabilidade única e bem definida
2. **Composição Flexível:** Permite combinar diferentes handlers em diferentes ordens
3. **Reutilização:** Handlers podem ser reutilizados em diferentes cadeias
4. **Manutenibilidade:** Fácil adicionar ou remover handlers sem alterar outros
5. **Testabilidade:** Cada handler pode ser testado isoladamente

**Exemplo de Uso:**
```typescript
export function requireRole(...allowed: role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const chain = new MiddlewareChain()
    chain.add(new AuthenticationHandler())
    chain.add(new RoleAuthorizationHandler(...allowed))
    chain.execute()(req, res, next)
  }
}
```

**Fluxo:**
1. `AuthenticationHandler` verifica o token JWT
2. Se válido, anexa `req.user` e chama `next()`
3. `RoleAuthorizationHandler` verifica se `req.user.role` está nas roles permitidas
4. Se autorizado, chama `next()` para continuar para o controller

**Benefícios:**
- ✅ Separação clara de responsabilidades
- ✅ Composição flexível de middlewares
- ✅ Fácil adicionar novos handlers
- ✅ Testabilidade individual de cada handler
- ✅ Código mais limpo e organizado

---

### Use Case Pattern

**Localização:** `src/useCases/`

**Descrição:**
O padrão Use Case encapsula a lógica de negócio de uma operação específica da aplicação. Cada use case representa uma ação que o usuário pode realizar no sistema.

**Use Cases Implementados:**

1. **CreateUserUseCase** - Cria usuário com senha gerada automaticamente
2. **RegisterUseCase** - Registro de usuário com senha fornecida
3. **LoginUseCase** - Autenticação de usuário
4. **ChangePasswordUseCase** - Alteração de senha
5. **GetUsersUseCase** - Listagem de usuários
6. **GetUserByIdUseCase** - Busca de usuário por ID
7. **UpdateUserUseCase** - Atualização de usuário
8. **DeleteUserUseCase** - Exclusão de usuário

**Estrutura:**
```typescript
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(data: CreateUserData): Promise<Result> {
    // Lógica de negócio aqui
  }
}
```

**Razões de Uso:**
1. **Separação de Responsabilidades:** Controllers lidam apenas com HTTP, use cases com lógica de negócio
2. **Reutilização:** Use cases podem ser reutilizados em diferentes contextos (API, CLI, etc.)
3. **Testabilidade:** Fácil testar lógica de negócio isoladamente, sem HTTP ou banco
4. **Manutenibilidade:** Cada use case é focado em uma única operação
5. **Clareza:** Nome do use case deixa claro qual operação ele realiza
6. **Inversão de Dependências:** Depende de abstrações (interfaces), não de implementações

**Exemplo:**
```typescript
// Controller (camada fina)
export async function createUser(req: Request, res: Response): Promise<void> {
  const useCase = container.resolve<CreateUserUseCase>('CreateUserUseCase')
  const result = await useCase.execute(req.body)
  res.status(201).json(result)
}

// Use Case (lógica de negócio)
export class CreateUserUseCase {
  async execute(data: CreateUserData): Promise<Result> {
    // Validações de negócio
    // Regras de negócio
    // Orquestração de operações
  }
}
```

**Benefícios:**
- ✅ Separação clara entre HTTP e lógica de negócio
- ✅ Testes unitários mais fáceis
- ✅ Reutilização em diferentes contextos
- ✅ Código mais organizado e manutenível
- ✅ Facilita adicionar novas funcionalidades

---

### Repository Pattern

**Localização:** `src/domain/interfaces/UserRepository.ts` e `src/adapters/PrismaUserRepository.ts`

**Descrição:**
O padrão Repository abstrai a camada de acesso a dados, fornecendo uma interface que simula uma coleção de objetos em memória.

**Interface do Domínio:**
```typescript
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  findAll(): Promise<User[]>
  create(data: CreateUserData): Promise<User>
  update(id: number, data: UpdateUserData): Promise<User>
  delete(id: number): Promise<void>
}
```

**Razões de Uso:**
1. **Abstração de Persistência:** Oculta detalhes de como os dados são armazenados
2. **Testabilidade:** Permite criar implementações em memória para testes
3. **Flexibilidade:** Facilita trocar o mecanismo de persistência (Prisma, TypeORM, etc.)
4. **Desacoplamento:** Lógica de negócio não depende de detalhes de implementação
5. **Centralização:** Centraliza lógica de acesso a dados em um único lugar
6. **Mapeamento:** Converte entre modelos de domínio e modelos de persistência

**Implementação:**
```typescript
export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({...})
    return user ? this.mapToDomain(user) : null
  }
}
```

**Benefícios:**
- ✅ Desacoplamento entre domínio e infraestrutura
- ✅ Facilita testes com implementações fake
- ✅ Permite trocar ORM/banco sem alterar código de negócio
- ✅ Centraliza lógica de acesso a dados
- ✅ Melhora manutenibilidade


## Resumo dos Padrões

| Padrão | Categoria | Localização | Razão Principal |
|--------|-----------|-------------|------------------|
| Singleton | Criacional | `models/prisma.ts` | Evitar múltiplas conexões ao banco |
| Adapter | Estrutural | `adapters/` | Desacoplar domínio de infraestrutura |
| DI Container | Estrutural | `container/Container.ts` | Gerenciar dependências centralizadamente |
| Chain of Responsibility | Comportamental | `middleware/` | Compor middlewares de forma flexível |
| Use Case | Comportamental | `useCases/` | Separar lógica de negócio de HTTP |
| Repository | Comportamental | `domain/interfaces/` | Abstrair acesso a dados |

---



