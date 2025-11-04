const fs = require('fs');
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('fetch', () => {
  fs.readFile('weather.json', 'utf8', (err, data) => {
    if (err) {
      console.log('Error:', err.message);
      return;
    }
    const weather = JSON.parse(data);
    console.log('Temperature:', weather.temperature);
  });
});

emitter.emit('fetch');