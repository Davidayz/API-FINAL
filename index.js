const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

const db = new Database('filmes.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS filmes (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo  TEXT    NOT NULL,
        diretor TEXT    NOT NULL,
        ano     INTEGER NOT NULL,
        genero  TEXT    NOT NULL,
        nota    REAL    NOT NULL
    )
`);

app.get('/api/filmes', (req, res) =>{
    const{ genero, titulo, nota_min, ordem, direcao, pagina = 1, limite = 20 } = req.query;

    let query = 'SELECT * FROM filmes WHERE 1=1';
    const params = [];

    if (genero){
        query += ' AND LOWER(genero) = LOWER(?)';
        params.push(genero);
    }

    if (titulo){
        query += ' AND LOWER(titulo) LIKE LOWER(?)';
        params.push(`%${titulo}%`);
    }

    if (nota_min){
        query += ' AND nota >= ?';
        params.push(parseFloat(nota_min));
    }

    const colunasPermitidas = ['titulo', 'nota', 'ano'];
    const dir = direcao === 'desc' ? 'DESC' : 'ASC';

    if (ordem && colunasPermitidas.includes(ordem)){
        query += ` ORDER BY ${ordem} ${dir}`;
    }

    const todos = db.prepare(query).all(...params);

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const inicio = (paginaNum - 1) * limiteNum;
    const paginado = todos.slice(inicio, inicio + limiteNum);

    res.json({
        dados: paginado,
        paginacao:{
            pagina_atual: paginaNum,
            itens_por_pagina: limiteNum,
            total_itens: todos.length,
            total_paginas: Math.ceil(todos.length / limiteNum)
        }
    });
});

app.get('/api/filmes/:id', (req, res) =>{
    const filme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);

    if (!filme){
        return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json(filme);
});

app.post('/api/filmes', (req, res) =>{
    const{ titulo, diretor, ano, genero, nota } = req.body;

    if (!titulo || !diretor || !ano || !genero || nota === undefined){
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    if (typeof nota !== 'number' || nota < 0 || nota > 10){
        return res.status(400).json({ erro: "Nota deve ser entre 0 e 10" });
    }

    const result = db.prepare(`
        INSERT INTO filmes (titulo, diretor, ano, genero, nota)
        VALUES (?, ?, ?, ?, ?)
    `).run(titulo, diretor, ano, genero, nota);

    const novoFilme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(novoFilme);
});

app.put('/api/filmes/:id', (req, res) =>{
    const filme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);

    if (!filme){
        return res.status(404).json({ erro: "Filme não encontrado" });
    }

    const{ titulo, diretor, ano, genero, nota } = req.body;

    if (!titulo || !diretor || !ano || !genero || nota === undefined){
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    if (typeof nota !== 'number' || nota < 0 || nota > 10){
        return res.status(400).json({ erro: "Nota deve ser entre 0 e 10" });
    }

    db.prepare(`
        UPDATE filmes SET titulo = ?, diretor = ?, ano = ?, genero = ?, nota = ?
        WHERE id = ?
    `).run(titulo, diretor, ano, genero, nota, req.params.id);

    const atualizado = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);

    res.json(atualizado);
});

app.delete('/api/filmes/:id', (req, res) =>{
    const filme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);

    if (!filme){
        return res.status(404).json({ erro: "Filme não encontrado" });
    }

    db.prepare('DELETE FROM filmes WHERE id = ?').run(req.params.id);

    res.json({ mensagem: "Filme removido com sucesso" });
});

app.listen(3000, () =>{
    console.log('API de filmes rodando em http://localhost:3000');
});