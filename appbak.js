const { Client } = require('whatsapp-web.js');
const http = require('http'); 
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');   
const puppeteer = require('puppeteer');     
const qrcode = require('qrcode');  
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);    
const { ChatAIHandler } = require('./feature/chat_ai'); 
const { response } = require('express');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); 
app.use(fileUpload({  
  debug: true
})); 

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});
 
const client = new Client();

// client.on('message', async (msg) => {
client.on('message', msg => { 
  const keyword = msg.body.toLowerCase();    
  if (msg.body=="ping") {   
    msg.reply("pong");  
  } 
  // #tanya/question?     
  // if (keyword.includes("tanya ai")) {   
  //   await ChatAIHandler(keyword, msg);    
  // }    
});

client.initialize();

// Socket IO
io.on('connection', function(socket) {
  socket.emit('message', 'Connecting...');
  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED');
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    client.destroy();
    client.initialize();
  });
});

server.listen(port, function() {
  console.log('App running on *: ' + port);
});
