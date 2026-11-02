# Sistema de Gestão de Solicitações de Compras

Aplicação web para gerenciamento de fornecedores e solicitações de compras, com integração a uma inteligência artificial para análise e classificação de prioridades.

## Tecnologias utilizadas

- **Backend:** NestJS, Node.js e TypeScript
- **Frontend:** Next.js, React e TypeScript
- **Banco de dados:** PostgreSQL
- **Integração com IA:** OpenAI API

## Estrutura do projeto

```text
Teste-Tecnico-Neofuturo/
├── backend/          # API desenvolvida com NestJS
├── frontend/         # Interface desenvolvida com Next.js
├── database/         # Scripts SQL para criação do banco e das tabelas
├── .env.example      # Exemplo das variáveis de ambiente
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- [Node.js](https://nodejs.org/) e npm
- [PostgreSQL](https://www.postgresql.org/download/)
- Git

Para utilizar a funcionalidade de análise por inteligência artificial, também é necessária uma chave válida da API da OpenAI.

## 1. Clonar o repositório

```bash
git clone https://github.com/eduardogtbarros/Teste-Tecnico-Neofuturo.git
cd Teste-Tecnico-Neofuturo
```

## 2. Configurar as variáveis de ambiente

Na raiz do projeto, crie o arquivo `.env` a partir do arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e informe os dados de acesso ao PostgreSQL e sua chave da OpenAI:

```env
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=procurement_db
OPENAI_API_KEY=sua_chave

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Substitua `sua_senha` pela senha configurada no PostgreSQL e `sua_chave` por uma chave válida da OpenAI.

## 3. Configurar o banco de dados

Certifique-se de que o serviço do PostgreSQL esteja em execução.

No terminal, a partir da pasta raiz do projeto, execute o primeiro script para criar o banco de dados:

```bash
psql -U postgres -f database/create_database.sql
```

Em seguida, execute o script responsável pela criação das tabelas:

```bash
psql -U postgres -d procurement_db -f database/create_tables.sql
```

Caso necessário, informe a senha do usuário PostgreSQL quando solicitada.

## 4. Instalar as dependências

Abra um terminal na pasta `backend`:

```bash
cd backend
npm install
```

Depois, em outro terminal, abra a pasta `frontend`:

```bash
cd frontend
npm install
```

## 5. Executar o projeto

O backend e o frontend devem ser executados simultaneamente, cada um em seu próprio terminal.

**Backend**

Na pasta `backend`, execute:

```bash
npm run start:dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

**Frontend**

Na pasta `frontend`, execute:

```bash
npm run dev -- -p 3001
```

A aplicação ficará disponível em:

```text
http://localhost:3001
```

## Testes

O backend possui testes unitários desenvolvidos com **Jest** e **NestJS Testing**, utilizando mocks para simular as operações com o banco de dados, sem depender de uma conexão real durante a execução dos testes.

Para executar os testes, acesse a pasta do backend:

```bash
cd backend
```

Execute todos os testes:

```bash
npm test -- --runInBand
```

Para executar os testes de um serviço específico:

```bash
npm test -- --runInBand src/suppliers/suppliers.service.spec.ts
```

```bash
npm test -- --runInBand src/purchase-requests/purchase-requests.service.spec.ts
```

Para executar os testes e gerar um relatório de cobertura:

```bash
npm run test:cov
```

### Cobertura dos testes

Os testes verificam:

- **Controller:** funcionamento do endpoint de verificação da conexão com o banco de dados, utilizando um mock.
- **Fornecedores:** cadastro e listagem de fornecedores, incluindo campos opcionais.
- **Solicitações de compra:** cadastro, listagem, consulta, atualização de status e tratamento de erros.
- **Pareceres de IA:** tratamento de solicitações inexistentes e ausência da chave da API da OpenAI.

## Funcionalidades

- Cadastro e listagem de fornecedores.
- Cadastro e listagem de solicitações de compras.
- Consulta detalhada de uma solicitação.
- Filtro de solicitações por status.
- Atualização do status para pendente, aprovado ou rejeitado.
- Análise de solicitações por inteligência artificial, com classificação de prioridade e geração de resumo.

## Observações

- O PostgreSQL deve permanecer em execução enquanto a aplicação estiver sendo utilizada.
- A funcionalidade de análise por IA depende de uma chave válida da OpenAI configurada no arquivo `.env`.
- O arquivo `.env` contém informações sensíveis e não deve ser compartilhado ou enviado ao repositório.