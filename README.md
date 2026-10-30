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