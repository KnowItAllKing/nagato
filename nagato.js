require('dotenv').config();
const Client = require('./classes/NagatoClient'),
  commandHandler = require('./classes/CommandHandler'),
  eventHandler = require('./classes/EventHandler');
const mongoose = require('mongoose');

async function start() {
  await mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useFindAndModify: true
  });
  new Client(commandHandler, eventHandler, process.env.TOKEN);
}
start();