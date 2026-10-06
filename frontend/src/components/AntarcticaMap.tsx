import styles from "./AntarcticaMap.module.css";

interface AntarcticaMapProps {
  selectedStation: string;
  onSelectStation: (station: string) => void;
}

const stations = [
  {
    id: "89070",
    name: "Gabriel de Castilla",
    x: 330,
    y: 245,
  },
  {
    id: "89064",
    name: "Juan Carlos I",
    x: 420,
    y: 300,
  },
];

export default function AntarcticaMap({
  selectedStation,
  onSelectStation,
}: AntarcticaMapProps) {
  return (
    <section className={styles.mapSection}>
      <div className={styles.header}>
        <div>
          <h2>Antarctic stations</h2>
          <p>Select a station to explore its weather data</p>
        </div>
      </div>

      <div className={styles.map}>
        <svg
          viewBox="0 0 800 500"
          role="img"
          aria-label="Mapa esquemático de la Antártida"
        >
          {/* Grid */}
          <g className={styles.mapGrid}>
            <line x1="100" y1="100" x2="700" y2="100" />
            <line x1="100" y1="200" x2="700" y2="200" />
            <line x1="100" y1="300" x2="700" y2="300" />
            <line x1="100" y1="400" x2="700" y2="400" />

            <line x1="200" y1="50" x2="200" y2="450" />
            <line x1="300" y1="50" x2="300" y2="450" />
            <line x1="400" y1="50" x2="400" y2="450" />
            <line x1="500" y1="50" x2="500" y2="450" />
            <line x1="600" y1="50" x2="600" y2="450" />
          </g>

          {/* Antarctica */}
          <path
            className={styles.antarcticaLand}
            d="
              M 180 330
              C 145 290, 150 235, 190 205
              C 225 175, 275 165, 315 175
              C 350 140, 405 125, 455 145
              C 510 120, 570 145, 595 185
              C 635 200, 665 235, 650 275
              C 680 315, 650 355, 610 370
              C 575 405, 520 390, 485 410
              C 440 435, 385 415, 350 395
              C 300 420, 250 395, 230 365
              C 205 365, 190 350, 180 330
              Z
            "
          />

          {/* Inner contour */}
          <path
            className={styles.antarcticaContour}
            d="
              M 220 300
              C 250 250, 300 220, 350 225
              C 400 185, 470 185, 525 220
              C 570 225, 600 260, 585 300
              C 570 345, 510 350, 470 365
              C 420 390, 360 365, 320 350
              C 275 365, 240 340, 220 300
            "
          />

          {/* Stations */}
          {stations.map((station) => {
            const isSelected = station.id === selectedStation;

            return (
              <g
                key={station.id}
                className={`station ${isSelected ? styles.stationSelected : ""}`}
                onClick={() => onSelectStation(station.id)}
              >
                <circle
                  className={styles.stationPulse}
                  cx={station.x}
                  cy={station.y}
                  r={isSelected ? 22 : 16}
                />

                <circle
                  className={styles.stationMarker}
                  cx={station.x}
                  cy={station.y}
                  r={isSelected ? 9 : 7}
                />

                <text
                  className={styles.stationLabel}
                  x={station.x + 15}
                  y={station.y - 12}
                >
                  {station.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
