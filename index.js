const express = require('express');
const app = express();
const port = 3000;

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

// Rota para alternar status via GET
['ponto1', 'ponto2', 'ponto3'].forEach(ponto => {
  app.get(`/${ponto}`, (req, res) => {
    const novoStatus = toggle(ponto);
    if (novoStatus === null) {
      return res.status(404).json({ error: 'Ponto não encontrado' });
    }
    res.json({ [ponto]: novoStatus });
  });
});

// Rota para consultar todos os status
app.get('/status', (req, res) => {
  res.json(estados);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
