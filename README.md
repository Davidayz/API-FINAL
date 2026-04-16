# api-final

## Instalacao

```bash
npm install express better-sqlite3
```

## Como executar

```bash
node index.js
```

Servidor disponivel em: http://localhost:3000

Mantenha o terminal aberto enquanto testa. Fechar o terminal encerra o servidor.

Na primeira execucao, o arquivo `filmes.db` e criado automaticamente com 20 filmes.

---

## Banco de dados

O projeto usa SQLite com a biblioteca `better-sqlite3`. Os dados ficam salvos no arquivo `filmes.db` e persistem mesmo depois de reiniciar o servidor.

Estrutura da tabela:

| Coluna  | Tipo    | Descricao              |
|---------|---------|------------------------|
| id      | INTEGER | Chave primaria (auto)  |
| titulo  | TEXT    | Titulo do filme        |
| diretor | TEXT    | Nome do diretor        |
| ano     | INTEGER | Ano de lancamento      |
| genero  | TEXT    | Genero do filme        |
| nota    | REAL    | Nota de 0 a 10         |

---

## Endpoints

### GET /api/filmes

Retorna a lista de filmes. Suporta filtros, ordenacao e paginacao.

| Parametro | Tipo   | Descricao                                      | Exemplo          |
|-----------|--------|------------------------------------------------|------------------|
| genero    | string | Filtra por genero (exato)                      | ?genero=Drama    |
| titulo    | string | Busca parcial por titulo                       | ?titulo=matrix   |
| nota_min  | number | Nota minima                                    | ?nota_min=8.5    |
| ordem     | string | Ordena por titulo, nota ou ano                 | ?ordem=nota      |
| direcao   | string | asc (padrao) ou desc                           | ?direcao=desc    |
| pagina    | number | Numero da pagina (padrao: 1)                   | ?pagina=2        |
| limite    | number | Itens por pagina (padrao: 5)                   | ?limite=3        |

Exemplos:

```
GET /api/filmes
GET /api/filmes?genero=Drama
GET /api/filmes?titulo=matrix
GET /api/filmes?nota_min=8.5
GET /api/filmes?ordem=nota&direcao=desc
GET /api/filmes?genero=Drama&ordem=nota&direcao=desc
GET /api/filmes?pagina=1&limite=5
```

Resposta 200:

```json
{
  "dados": [
    {
      "id": 7,
      "titulo": "Clube da Luta",
      "diretor": "David Fincher",
      "ano": 1999,
      "genero": "Drama",
      "nota": 8.8
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "itens_por_pagina": 5,
    "total_itens": 4,
    "total_paginas": 1
  }
}
```

---

### GET /api/filmes/:id

Retorna um unico filme pelo ID.

```
GET /api/filmes/1
```

Resposta 200:

```json
{
  "id": 1,
  "titulo": "O Poderoso Chefao",
  "diretor": "Francis Ford Coppola",
  "ano": 1972,
  "genero": "Crime",
  "nota": 9.2
}
```

Resposta 404:

```json
{ "erro": "Filme nao encontrado" }
```

---

### POST /api/filmes

Cria um novo filme. Header obrigatorio: `Content-Type: application/json`

Body:

```json
{
  "titulo": "Oppenheimer",
  "diretor": "Christopher Nolan",
  "ano": 2023,
  "genero": "Drama",
  "nota": 8.9
}
```

Resposta 201:

```json
{
  "id": 21,
  "titulo": "Oppenheimer",
  "diretor": "Christopher Nolan",
  "ano": 2023,
  "genero": "Drama",
  "nota": 8.9
}
```

Resposta 400 - campos faltando:

```json
{ "erro": "Todos os campos sao obrigatorios" }
```

Resposta 400 - nota invalida:

```json
{ "erro": "Nota deve ser entre 0 e 10" }
```

---

### PUT /api/filmes/:id

Atualiza um filme existente. Todos os campos sao obrigatorios.

Header obrigatorio: `Content-Type: application/json`

```
PUT /api/filmes/1
```

Body:

```json
{
  "titulo": "O Poderoso Chefao",
  "diretor": "Francis Ford Coppola",
  "ano": 1972,
  "genero": "Crime",
  "nota": 9.5
}
```

Resposta 200: retorna o filme atualizado.

Resposta 404: `{ "erro": "Filme nao encontrado" }`

Resposta 400: `{ "erro": "Todos os campos sao obrigatorios" }`

---

### DELETE /api/filmes/:id

Remove um filme pelo ID.

```
DELETE /api/filmes/1
```

Resposta 200:

```json
{ "mensagem": "Filme removido com sucesso" }
```

Resposta 404: `{ "erro": "Filme nao encontrado" }`

---

## Validacoes (POST e PUT)

| Campo   | Regra                      |
|---------|----------------------------|
| titulo  | Obrigatorio                |
| diretor | Obrigatorio                |
| ano     | Obrigatorio                |
| genero  | Obrigatorio                |
| nota    | Obrigatorio. Entre 0 e 10. |

---

## Status codes

| Codigo | Significado          |
|--------|----------------------|
| 200    | Sucesso              |
| 201    | Criado com sucesso   |
| 400    | Dados invalidos      |
| 404    | Filme nao encontrado |
