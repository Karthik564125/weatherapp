import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Lottie from 'lottie-react';
import sunAnimation from './assets/sun.json';
import cloudAnimation from './assets/clouds.json';
import rainAnimation from './assets/rain.json';
import snowAnimation from './assets/snow.json';
import loadingAnimation from './assets/loading.json';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const API_KEY = '252858f1b3073ed8c5d6def1a7b8a786';

  const fetchWeather = useCallback(async (cityName = city) => {
    if (!cityName) return;
    setLoading(true);

    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
      const weatherData = await weatherRes.json();
      if (weatherData && weatherData.weather) setWeather(weatherData);

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
      const forecastData = await forecastRes.json();
      if (forecastData && forecastData.list) {
        const dailyData = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 7);
        setForecast(dailyData);
        setHourly(forecastData.list.slice(0, 8));
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) fetchWeather();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city, fetchWeather]);

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getBackgroundClass = () => darkMode ? 'app dark' : 'app';

  const renderLottieIcon = (weatherType) => {
    const type = weatherType.toLowerCase();
    if (type.includes('cloud')) return <Lottie animationData={cloudAnimation} style={{ width: 60, height: 60 }} />;
    if (type.includes('rain')) return <Lottie animationData={rainAnimation} style={{ width: 60, height: 60 }} />;
    if (type.includes('clear')) return <Lottie animationData={sunAnimation} style={{ width: 60, height: 60 }} />;
    if (type.includes('snow')) return <Lottie animationData={snowAnimation} style={{ width: 60, height: 60 }} />;
    return null;
  };

  return (
    <div className={getBackgroundClass()}>
      {loading && <Lottie animationData={loadingAnimation} className="loading-spinner" />}
      <div className="container">
        <h1>Weather App</h1>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={() => fetchWeather()}>Search</button>
        </div>

        {weather && weather.main && (
          <div className="weather-box glass">
            <h2>{weather.name}</h2>
            <p>{weather.weather[0].main}</p>
            <p>{weather.main.temp.toFixed(1)} °C</p>
            <p>Min: {weather.main.temp_min}°C / Max: {weather.main.temp_max}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p className="time">Updated: {getTime()}</p>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            <h3>5-Day Forecast</h3>
            <div className="forecast-horizontal">
              {forecast.map((item) => (
                <div key={item.dt} className="forecast-card glass">
                  <p className="day">{formatDate(item.dt_txt)}</p>
                  {renderLottieIcon(item.weather[0].main)}
                  <p>{item.weather[0].main}</p>
                  <p>{item.main.temp.toFixed(1)} °C</p>
                  <p>{item.main.humidity}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hourly.length > 0 && (
          <div className="forecast">
            <h3>Hourly Forecast</h3>
            <div className="forecast-horizontal">
              {hourly.map((item) => (
                <div key={item.dt} className="forecast-card glass">
                  <p className="day">{new Date(item.dt_txt).getHours()}:00</p>
                  {renderLottieIcon(item.weather[0].main)}
                  <p>{item.weather[0].main}</p>
                  <p>{item.main.temp.toFixed(1)} °C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
