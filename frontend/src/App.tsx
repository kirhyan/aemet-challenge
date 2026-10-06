import { useState } from "react";
import AntarcticaMap from "./components/AntarcticaMap";
import WeatherForm from "./components/WeatherForm/WeatherForm";
import WeatherResults from "./components/WeatherResults/WeatherResults";
import type {
  Measurement,
  WeatherObservation,
  WeatherQuery,
} from "./types/weather";
import { getWeather } from "./services/weatherApi";
import "./App.css";

function App() {
  const [selectedStation, setSelectedStation] = useState("89070");

  const [weatherData, setWeatherData] = useState<WeatherObservation[]>([]);

  const [lastMeasurements, setLastMeasurements] = useState<Measurement[]>([
    "temp",
  ]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleWeatherSubmit = async (query: WeatherQuery) => {
    setLoading(true);
    setError(null);

    setLastMeasurements(query.measurements);

    try {
      const data = await getWeather(query);
      setWeatherData(data);
    } catch (error) {
      console.error(error);
      setError("Could not load weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <header className="page-header">
        <h1>Antarctic Weather Data</h1>

        <p>Historical meteorological data from AEMET Antarctic stations.</p>
      </header>

      <section className="card">
        <h2>Weather query</h2>

        <WeatherForm
          station={selectedStation}
          onStationChange={setSelectedStation}
          onSubmit={handleWeatherSubmit}
        />

        {loading && <p>Loading weather data...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <WeatherResults data={weatherData} measurements={lastMeasurements} />
        )}
      </section>

      <section className="card">
        <AntarcticaMap
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
        />
      </section>
    </main>
  );
}

export default App;
