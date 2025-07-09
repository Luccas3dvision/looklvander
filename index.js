const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


app.use(session({
  secret: 'segredo-do-dev-azul', // pode ser qualquer string
  resave: false,
  saveUninitialized: true
}));

app.use(express.json()); // se for JSON

const estados = {
  MaquinaA: 'livre',
  MaquinaB: 'livre',
  MaquinaC: 'livre'
};

const historico = [];  // guarda objetos { ponto, status, data }
const usuarios = [];  // Endpoint para registrar um usuário

// Endpoint para alternar o status de um ponto ()dev
app.get('/status', (req, res) => {
  res.json(estados);
});

// Endpoint para retornar o status em HTML
app.get('/', (req, res) => {
  const nome = req.session.nome;

  if (!nome) {
    return res.redirect('/users'); // redireciona pra tela de cadastro
  }

  res.render('layout', {
    estados,
    historico,
    nome
  });
});

// função para alternar o status de um ponto
function toggle(ponto) {
  if (!estados.hasOwnProperty(ponto)) return null;
  estados[ponto] = estados[ponto] === 'livre' ? 'ocupado' : 'livre';
  return estados[ponto];
}


// acesso ao ussuarios
app.get('/users', (req, res) => {
  res.render('users');
});

app.post('/user', (req, res) => {
  const nome = req.body.nome;

  if (!nome || nome.trim() === '') {
    return res.status(400).send('Nome é obrigatório');
  }

  req.session.nome = nome.trim(); // <- Salva o nome na sessão
  usuarios.push({ nome: nome.trim(), data: new Date().toISOString() });

  res.redirect('/'); // agora redireciona direto pra home
});

app.put('/:ponto', (req, res) => {
  const ponto = req.params.ponto;
  const usuario = req.body.usuario || 'Anônimo';

  const novoStatus = toggle(ponto);

  if (novoStatus) {
    historico.push({
      ponto,
      status: novoStatus,
      usuario,
      data: new Date().toISOString()
    });

    io.emit('statusAtualizado', { ponto, status: novoStatus, historico });
  }

  res.redirect('/');
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
