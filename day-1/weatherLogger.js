const fs = require('fs');
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('fetch', () => {
  fs.readFile('weather.json', 'utf8', (err, data) => {
    if (err) {
      console.log('Error:', err.message);
      return;
    }
    const weatherData = JSON.parse(data);
    
    // Access the weather array and display all cities
    console.log('\nWeather Report:');
    weatherData.weather.forEach(city => {
      console.log(`${city.cityName}: ${city.currentConditions}, Temperature: ${city.temperature}°C`);
    });
  });
});

emitter.emit('fetch');