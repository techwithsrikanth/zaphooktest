const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.post('/submit-order', async (req, res) => {
  try {
    const response = await fetch('https://hooks.zapier.com/hooks/catch/22683974/2ptdz4b/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), // forward the request data
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to send data to Zapier webhook' });
    }

    res.status(200).json({ message: 'Order submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error occurred while forwarding data' });
  }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
