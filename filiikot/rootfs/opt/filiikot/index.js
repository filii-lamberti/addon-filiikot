const supervisorToken = process.env.SUPERVISOR_TOKEN;

// Nodig voor externe files
const fs = require('fs');
// This contains our configuration
let options;

if (!supervisorToken) {
  // eslint-disable-next-line no-console
  console.log('You are not running this as an Home Assistant add-on!');
  // Here we import the options.json file
  options = JSON.parse(fs.readFileSync('./options.json', 'utf8'));
  options.mqttBrokerUrl = 'mqtt://localhost';
} else {
  // from the add-on persistent data directory
  options = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));
  options.mqttBrokerUrl = 'mqtt://core-mosquitto';
}

// status of logging
const { logging } = options;

// function to filter console logs
function log(message) {
  if (logging) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}

// prints if logging is true
if (logging) {
  log('Logging is enabled');
}

// status of debugging
const { debugging } = options;
// prints if debugging is true
if (debugging) {
  log('Debugging is enabled');
  process.env.DEBUG = '*';
}

// Gebruikt voor momenten
const moment = require('moment');
// Set the locale to dutch
moment.locale('nl');

const filiikot = {
  state: 'OFF',
  override: 'OFF',
  light: 'OFF',
  temperature: 0,
  humidity: 0,
  lastChanged: moment(0),
  lastUpdated: moment(0),
  statusMessage: 'met de gevoelens van het filiikot',
};

// Setup basic express server
const express = require('express');
const path = require('path');

const app = express();
// Constant for port
const port = process.env.PORT || 3000;

const http = require('http')
  .Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  log('a user is connected');

  socket.emit('update', filiikot);

  socket.on('disconnect', () => {
    log('user disconnected');
  });
});

// we are specifying the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data', (req, res) => {
  res.json(filiikot);
});

// Launch listening server on port 3000
http.listen(port, () => {
  log(`listening on port ${port}!`);
});

const mqttOptions = {
  clientId: 'mqttjs_filiikot',
  username: 'ferre',
  password: 'ferre',
};

// MQTT
const MQTT = require('mqtt');
// Connect to the local MQTT broker
const mqttClient = MQTT.connect(options.mqttBrokerUrl, mqttOptions);

mqttClient.on('connect', () => { // When connected
  log('MQTT connected');
  // subscribe to a topic
  mqttClient.subscribe('filiikot/+');
  // Inform controllers that garage is connected
  mqttClient.publish('filiikot/filiikot_connected', 'true');
});

// Read data that is available in "flowing mode"
mqttClient.on('message', (topic, message) => {
  switch (topic) {
    case 'filiikot/state':
      // message is Buffer
      filiikot.state = message.toString();
      log(`Status: ${filiikot.state}`);
      break;

    case 'filiikot/override':
      filiikot.override = message.toString();
      log(`Override: ${filiikot.override}`);
      break;

    case 'filiikot/light':
      filiikot.light = message.toString();
      log(`Licht: ${filiikot.light}`);
      break;

    case 'filiikot/temperature':
      filiikot.temperature = message.toString();
      log(`Temperatuur: ${filiikot.temperature}`);
      break;

    case 'filiikot/humidity':
      filiikot.humidity = message.toString();
      log(`Vochtigheid: ${filiikot.humidity}`);
      break;

    case 'filiikot/last_changed':
      filiikot.lastChanged = moment(message.toString());
      log(`Last changed: ${filiikot.lastChanged}`);
      break;

    case 'filiikot/last_updated':
      filiikot.lastUpdated = moment(message.toString());
      log(`Last updated: ${filiikot.lastUpdated}`);
      break;

    default:
      return;
  }

  switch (filiikot.state) {
    case 'true':
      filiikot.statusMessage = `✅ Het filiikot is open sinds ${filiikot.lastChanged.format('HH:mm')}`;
      break;

    case 'false':
      filiikot.statusMessage = `🛑 Het filiikot is al ${filiikot.lastChanged.fromNow(true)} gesloten`;
      break;

    default:
      filiikot.statusMessage = 'met de gevoelens van het filiikot';
      break;
  }

  io.emit('update', filiikot);
});
