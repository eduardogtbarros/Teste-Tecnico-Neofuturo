# Teste Técnico Neofuturo — Sistema de Gestão de Compras

Aplicação web para gerenciamento de fornecedores e solicitações de compras, com integração a uma inteligência artificial para análise e classificação de prioridades.

## Tecnologias utilizadas

- **Backend:** NestJS, Node.js e TypeScript
- **Frontend:** Next.js, React e TypeScript
- **Banco de dados:** PostgreSQL
- **Integração com IA:** OpenAI API
- **Containerização:** Docker e Docker Compose
- **Testes:** Jest e NestJS Testing

## Estrutura do projeto

```text
Teste-Tecnico-Neofuturo/
├── backend/
|   ├── .dockerignore
│   ├── Dockerfile
│   └── ...
├── frontend/
|   ├── .dockerignore
│   ├── Dockerfile
│   └── ...
├── database/
│   └── create_tables.sql
├── .env.example
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

Para executar o projeto utilizando Docker, é necessário ter instalado:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

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

Edite o arquivo `.env` e informe as configurações:

```env
# Backend
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=procurement_db
OPENAI_API_KEY=sua_chave

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Substitua `sua_senha` por uma senha de sua preferência e `sua_chave` por uma chave válida da OpenAI.

## 3. Executar com Docker

Com o Docker Desktop aberto, execute na raiz do projeto:

```bash
docker compose up --build
```

O Docker Compose será responsável por:

- Criar e iniciar o contêiner do PostgreSQL.
- Criar automaticamente as tabelas do banco de dados.
- Construir e iniciar o backend.
- Construir e iniciar o frontend.
- Configurar a comunicação entre os serviços.

Na primeira execução, o processo pode levar alguns minutos devido à construção das imagens e à inicialização do banco de dados.

Após a inicialização, a aplicação estará disponível em:

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:3001 |
| Backend | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

Para encerrar os serviços:

```bash
docker compose down
```

Os dados do PostgreSQL são armazenados em um volume persistente chamado `postgres_data`, portanto permanecem salvos mesmo após os contêineres serem encerrados.

Para iniciar novamente o projeto, basta executar:

```bash
docker compose up
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
- **Pareceres de IA:** tratamento de solicitações inexistentes, ausência da chave da API da OpenAI e geração do parecer.

## Funcionalidades

- Cadastro e listagem de fornecedores.
- Cadastro e listagem de solicitações de compras.
- Consulta detalhada de uma solicitação.
- Filtro de solicitações por status.
- Atualização do status para pendente, aprovado ou rejeitado.
- Análise de solicitações por inteligência artificial, com classificação de prioridade e geração de resumo.

## Observações

- A funcionalidade de análise por IA depende de uma chave válida da OpenAI configurada no arquivo `.env`.
- O arquivo `.env` contém informações sensíveis e não deve ser compartilhado ou enviado ao repositório.
- Os scripts SQL de inicialização do Docker são executados automaticamente apenas quando o volume do banco é criado pela primeira vez.