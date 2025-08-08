import { useState } from "react";

type WeatherData = {
  city: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    windspeed_10m_max: number[];
  };
} | null;

export default function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData>(null);
  const [loading, setLoading] = useState(false);

  async function fetchWeather() {
    if (!location.trim()) return;

    setLoading(true);
    setWeather(null);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=de&format=json`);
      const geoData = await geoRes.json();

      const place = geoData.results?.[0];
      if (!place) {
        alert("Ort nicht gefunden");
        setLoading(false);
        return;
      }

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=Europe/Berlin`);
      const weatherData = await weatherRes.json();

      setWeather({
        city: place.name,
        daily: weatherData.daily,
      });
    } catch (error) {
      alert("Fehler beim Laden der Wetterdaten");
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-700 flex flex-col items-center p-6">
      <h1 className="text-white text-3xl font-bold mb-8 drop-shadow-lg">🏄‍♂️ Wetter für Surfer</h1>

      <div className="flex gap-2 w-full max-w-md mb-8">
        <input
          type="text"
          placeholder="Ort in Deutschland"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-grow p-2 rounded border border-gray-300 focus:outline-none"
        />
        <button
          onClick={fetchWeather}
          className="bg-blue-900 text-white px-4 rounded hover:bg-blue-800 transition"
        >
          Suchen
        </button>
      </div>

      {loading && <p className="text-white">Lade Wetterdaten...</p>}

      {weather && (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
          <h2 className="text-2xl font-semibold mb-4">{weather.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {weather.daily.time.map((date, idx) => (
              <div key={date} className="bg-blue-50 rounded p-4 shadow">
                <p className="font-bold mb-1">{date}</p>
                <p>🌡️ Max: {weather.daily.temperature_2m_max[idx]} °C</p>
                <p>🌡️ Min: {weather.daily.temperature_2m_min[idx]} °C</p>
                <p>💨 Wind: {weather.daily.windspeed_10m_max[idx]} km/h</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
