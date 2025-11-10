const fs = require('fs').promises;
const EventEmitter = require('events');
const emitter = new EventEmitter();

async function fetchWeather() {
  console.log("Fetching weather data...Loading...WAIT PLS!");
  const data = await fs.readFile('data.json', 'utf8'); 
  
  setTimeout(() => {
    const weather = JSON.parse(data).weather;
    emitter.emit('dataFetched', weather);
  }, 2000);
}

emitter.on('dataFetched', (weather) => {
  console.log("\nWeather Report:");
  weather.forEach(w => {
    console.log(`${w.cityName}: ${w.currentConditions}, Temp: ${w.temperature}°C`);
  });
});

fetchWeather();