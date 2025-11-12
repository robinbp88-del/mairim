const express = require('express');
const path = require('path');
const cors = require('cors');
const { interpretMessage } = require('./intentEngine');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 👇 Dette gjør at Express serverer filer fra public/
app.use(express.static(path.join(__dirname, 'public')));

// Test-rute for nettleser
app.get('/', (req, res) => {
  res.send('✅ Mairim backend kjører');
});

// API-rute for React og Postman
app.post('/api/interpret', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Melding mangler' });
  }

  try {
    const svar = await interpretMessage(message);
    res.json(svar);
  } catch (err) {
    console.error('Feil i interpretMessage:', err);
    res.status(500).json({ error: 'Uventet feil i modellen' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Mairim backend kjører på port ${PORT}`);
});
