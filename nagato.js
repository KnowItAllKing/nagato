require('dotenv').config();
const Client = require('./classes/NagatoClient'),
  commandHandler = require('./classes/CommandHandler'),
  eventHandler = require('./classes/EventHandler');
const mongoose = require('mongoose');

async function start() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useFindAndModify: false
    });
  } catch (e) {
    console.log(e);
    return process.exit();
  }
  new Client(commandHandler, eventHandler, process.env.TOKEN);
}
start();