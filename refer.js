const WebSocket = require('ws');
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientId: String,
  connectedAt: { type: Date, default: Date.now },
});

const Client = mongoose.model('Client', clientSchema);

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Get the client ID and store it in the database
  const clientId = ws._socket._handle.fd.toString();
  const client = new Client({ clientId });
  client.save();

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // ...
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove the client from the database
    Client.deleteOne({ clientId }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});
//-------------------------------------------------------------------------------------
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  // ... other user properties ...
  clientIds: [String], // Array of WebSocket client IDs associated with this user
});

const User = mongoose.model('User', userSchema);


wss.on('connection', (ws) => {
    console.log('Client connected');
  
    ws.on('message', (message) => {
      // Parse message as JSON
      const data = JSON.parse(message);
      // Find the user in the database by ID
      User.findById(data.userId, (err, user) => {
        if (err) {
          console.error(err);
          return;
        }
        // Add the client ID to the user's clientIds array
        user.clientIds.push(ws._socket._handle.fd);
        user.save();
      });
    });
  });

  app.post('/api/message', (req, res) => {
    const message = req.body.message;
    const userId = req.body.userId;
    console.log(`Sending message: ${message} to user ${userId}`);
    // Find the user in the database by ID
    User.findById(userId, (err, user) => {
      if (err) {
        console.error(err);
        return;
      }
      // Broadcast the message to clients with matching client IDs
      user.clientIds.forEach((clientId) => {
        const client = wss.clients.find((c) => c._socket._handle.fd === clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
    res.send('Message sent');
  });
  // refer this coded for one to one communcation