const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server });

app.use(express.json())

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
   });
  });
});

app.post('/api/message', (req, res) => {
  const message = req.body.message;
  console.log(`Sending message: ${message}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  res.send('Message sent');
});

server.listen(8080, () => {
  console.log('Server started');
});
