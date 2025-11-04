// Async Weather App - College Task
const fs = require('fs/promises');
const path = require('path');
const EventEmitter = require('events');

const weatherEmitter = new EventEmitter();

// Listen for weather data fetched event
weatherEmitter.on('dataFetched', (data) => {
  console.log('\n=== Weather Information ===');
  console.log(`City: ${data.city}`);
  console.log(`Temperature: ${data.temperature}°C`);
  console.log(`Condition: ${data.condition}`);
  console.log(`Humidity: ${data.humidity}%`);
  console.log('===========================\n');
});

// Simulate network delay
function simulateDelay() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Data received!');
      resolve();
    }, 2000);
  });
}

// Fetch weather data
async function fetchWeatherData() {
  try {
    console.log('Fetching weather data...');
    const filePath = path.join(__dirname, 'data.json');
    const data = await fs.readFile(filePath, 'utf8');
    await simulateDelay();
    weatherEmitter.emit('dataFetched', JSON.parse(data));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fetchWeatherData();