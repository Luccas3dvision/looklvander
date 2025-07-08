const express = require('express');
const methodOverride = require('method-override');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const estados = {
  ponto1: 'livre',
  ponto2: 'livre',
  ponto3: 'livre'
};

function toggle(ponto) {
  if (!estados.hasOwnProperty(ponto)) return null;
  estados[ponto] = estados[ponto] === 'livre' ? 'ocupado' : 'livre';
  return estados[ponto];
}

app.get('/status', (req, res) => {
  res.json(estados);
});

app.get('/status/html', (req, res) => {
  res.render('status', { estados });
});

Object.keys(estados).forEach(ponto => {
  app.put(`/${ponto}`, (req, res) => {
    const novoStatus = toggle(ponto);
    if (novoStatus) {
      io.emit('statusAtualizado', { ponto, status: novoStatus });
    }
    res.redirect('/status/html');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
