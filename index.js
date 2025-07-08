const express = require('express');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS e middlewares
app.set('view engine', 'ejs');
app.set('views', './views'); // certifique-se de ter essa pasta
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Status inicial dos 3 pontos
const estados = {
  ponto1: 'livre',
  ponto2: 'livre',
  ponto3: 'livre'
};

// Função para alternar o estado entre 'livre' e 'ocupado'
function toggle(ponto) {
  if (!estados.hasOwnProperty(ponto)) return null;
  estados[ponto] = estados[ponto] === 'livre' ? 'ocupado' : 'livre';
  return estados[ponto];
}

// Rota para alternar status via GET (API)
['ponto1', 'ponto2', 'ponto3'].forEach(ponto => {
  app.get(`/${ponto}`, (req, res) => {
    const novoStatus = toggle(ponto);
    if (novoStatus === null) {
      return res.status(404).json({ error: 'Ponto não encontrado' });
    }
    res.json({ [ponto]: novoStatus });
  });
});

// Rota PUT para alterar e redirecionar (HTML)
['ponto1', 'ponto2', 'ponto3'].forEach(ponto => {
  app.put(`/${ponto}`, (req, res) => {
    const novoStatus = toggle(ponto);
    if (novoStatus === null) {
      return res.status(404).json({ error: 'Ponto não encontrado' });
    }
    res.redirect('/status/html');
  });
});

// Rota para consultar todos os status (API)
app.get('/status', (req, res) => {
  res.json(estados);
});

// Rota HTML dos status
app.get('/status/html', (req, res) => {
  res.render('status', { estados });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
