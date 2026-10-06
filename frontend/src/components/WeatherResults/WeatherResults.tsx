import { useState } from "react";
import type { Measurement, WeatherObservation } from "../../types/weather";
import styles from "./WeatherResults.module.css";

interface WeatherResultsProps {
  data: WeatherObservation[];
  measurements: Measurement[];
}

export default function WeatherResults({
  data,
  measurements,
}: WeatherResultsProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 20;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleData = data.slice(startIndex, startIndex + rowsPerPage);

  if (data.length === 0) {
    return null;
  }

  const temperatures = data
    .map((item) => item.temp)
    .filter((value): value is number => value != null);

  const pressures = data
    .map((item) => item.pres)
    .filter((value): value is number => value != null);

  const windSpeeds = data
    .map((item) => item.vel)
    .filter((value): value is number => value != null);

  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;

  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;

  const averageTemp =
    temperatures.length > 0
      ? temperatures.reduce((sum, value) => sum + value, 0) /
        temperatures.length
      : 0;

  const chartWidth = Math.max(900, data.length * 20);
  const chartHeight = 300;

  const chartTop = 40;
  const chartBottom = 250;

  const getX = (index: number) => {
    if (data.length === 1) {
      return chartWidth / 2;
    }

    return 40 + (index / (data.length - 1)) * (chartWidth - 80);
  };

  const getRange = (values: number[]) => {
    if (values.length === 0) {
      return {
        min: 0,
        max: 1,
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      min,
      max: max === min ? min + 1 : max,
    };
  };

  const tempRange = getRange(temperatures);
  const pressureRange = getRange(pressures);
  const windRange = getRange(windSpeeds);

  const getY = (value: number, min: number, max: number) => {
    return (
      chartBottom - ((value - min) / (max - min)) * (chartBottom - chartTop)
    );
  };

  const getTemperatureY = (value: number) =>
    getY(value, tempRange.min, tempRange.max);

  const getPressureY = (value: number) =>
    getY(value, pressureRange.min, pressureRange.max);

  const getWindY = (value: number) => getY(value, windRange.min, windRange.max);

  const createPoints = (measurement: Measurement) => {
    return data
      .map((observation, index) => {
        let value: number | null = null;
        let y = chartBottom;

        if (measurement === "temp") {
          value = observation.temp ?? null;

          if (value != null) {
            y = getTemperatureY(value);
          }
        }

        if (measurement === "pres") {
          value = observation.pres ?? null;

          if (value != null) {
            y = getPressureY(value);
          }
        }

        if (measurement === "vel") {
          value = observation.vel ?? null;

          if (value != null) {
            y = getWindY(value);
          }
        }

        if (value == null) {
          return null;
        }

        return `${getX(index)},${y}`;
      })
      .filter((point): point is string => point !== null)
      .join(" ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
  };

  const firstDate = formatDate(data[0].fhora);
  const lastDate = formatDate(data[data.length - 1].fhora);

  const temperaturePoints = createPoints("temp");

  const pressurePoints = createPoints("pres");

  const windPoints = createPoints("vel");

  const tooltipIndex = selectedPoint !== null ? selectedPoint : hoveredPoint;

  const tooltipObservation = tooltipIndex !== null ? data[tooltipIndex] : null;

  let tooltipX = 0;

  if (tooltipIndex !== null && tooltipObservation) {
    const pointX = getX(tooltipIndex);
    const tooltipWidth = 150;

    const showOnRight = pointX < chartWidth / 2;

    tooltipX = showOnRight ? pointX + 12 : pointX - tooltipWidth - 12;

    tooltipX = Math.max(4, Math.min(tooltipX, chartWidth - tooltipWidth - 4));
  }

  return (
    <section className={styles.results}>
      <h2>Weather results</h2>

      <p>{data.length} observations found.</p>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Observations</span>

          <span className={styles.summaryValue}>{data.length}</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Minimum temperature</span>

          <span className={styles.summaryValue}>{minTemp.toFixed(1)} °C</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Maximum temperature</span>

          <span className={styles.summaryValue}>{maxTemp.toFixed(1)} °C</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Average temperature</span>

          <span className={styles.summaryValue}>
            {averageTemp.toFixed(1)} °C
          </span>
        </div>
      </div>

      <div className={styles.chart}>
        <div className={styles.chartHeader}>
          <div>
            <h3>Weather trends</h3>

            <div className={styles.legend}>
              {measurements.includes("temp") && (
                <span className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.temperatureDot}`}
                  />
                  Temperature (°C)
                </span>
              )}

              {measurements.includes("pres") && (
                <span className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.pressureDot}`}
                  />
                  Pressure (hPa)
                </span>
              )}

              {measurements.includes("vel") && (
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.windDot}`} />
                  Wind speed (m/s)
                </span>
              )}
            </div>
          </div>

          <span className={styles.chartRange}>
            {firstDate} → {lastDate} Europe/Madrid
          </span>
        </div>

        <div className={styles.chartScroll}>
          <svg
            width={chartWidth}
            height={chartHeight + 30}
            viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          >
            {/* Horizontal grid */}
            {[0, 1, 2, 3, 4].map((index) => {
              const y = chartTop + (index / 4) * (chartBottom - chartTop);

              return (
                <line
                  key={index}
                  x1="40"
                  y1={y}
                  x2={chartWidth - 40}
                  y2={y}
                  className={styles.chartGrid}
                />
              );
            })}

            {/* Y axis */}
            <line
              x1="40"
              y1={chartTop}
              x2="40"
              y2={chartBottom}
              className={styles.chartAxis}
            />

            {/* X axis */}
            <line
              x1="40"
              y1={chartBottom}
              x2={chartWidth - 40}
              y2={chartBottom}
              className={styles.chartAxis}
            />

            {/* Temperature */}
            {measurements.includes("temp") && (
              <polyline
                points={temperaturePoints}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
              />
            )}

            {/* Pressure */}
            {measurements.includes("pres") && (
              <polyline
                points={pressurePoints}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            )}

            {/* Wind speed */}
            {measurements.includes("vel") && (
              <polyline
                points={windPoints}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
              />
            )}

            {/* Data points */}
            {data.map((observation, index) => {
              const isSelected = selectedPoint === index;

              return (
                <g
                  key={`${observation.fhora}-${index}`}
                  onClick={() => setSelectedPoint(isSelected ? null : index)}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className={styles.pointGroup}
                >
                  {measurements.includes("temp") &&
                    observation.temp != null && (
                      <circle
                        cx={getX(index)}
                        cy={getTemperatureY(observation.temp)}
                        r={isSelected ? 6 : 4}
                        fill="#f97316"
                        className={styles.dataPoint}
                      />
                    )}

                  {measurements.includes("pres") &&
                    observation.pres != null && (
                      <circle
                        cx={getX(index)}
                        cy={getPressureY(observation.pres)}
                        r={isSelected ? 6 : 4}
                        fill="#3b82f6"
                        className={styles.dataPoint}
                      />
                    )}

                  {measurements.includes("vel") && observation.vel != null && (
                    <circle
                      cx={getX(index)}
                      cy={getWindY(observation.vel)}
                      r={isSelected ? 6 : 4}
                      fill="#22c55e"
                      className={styles.dataPoint}
                    />
                  )}
                </g>
              );
            })}

            {/* Tooltip */}
            {tooltipObservation && (
              <g className={styles.tooltip} pointerEvents="none">
                <rect
                  x={tooltipX}
                  y="20"
                  width="150"
                  height="76"
                  rx="6"
                  className={styles.tooltipBackground}
                />

                <text
                  x={tooltipX + 75}
                  y="37"
                  textAnchor="middle"
                  className={styles.tooltipDate}
                >
                  {formatDate(tooltipObservation.fhora)}
                </text>

                {measurements.includes("temp") &&
                  tooltipObservation.temp != null && (
                    <text
                      x={tooltipX + 10}
                      y="52"
                      className={styles.tooltipTemperature}
                    >
                      Temp: {tooltipObservation.temp.toFixed(1)} °C
                    </text>
                  )}

                {measurements.includes("pres") &&
                  tooltipObservation.pres != null && (
                    <text
                      x={tooltipX + 10}
                      y="66"
                      className={styles.tooltipPressure}
                    >
                      Pressure: {tooltipObservation.pres.toFixed(1)} hPa
                    </text>
                  )}

                {measurements.includes("vel") &&
                  tooltipObservation.vel != null && (
                    <text
                      x={tooltipX + 10}
                      y="80"
                      className={styles.tooltipWind}
                    >
                      Wind: {tooltipObservation.vel.toFixed(1)} m/s
                    </text>
                  )}
              </g>
            )}

            {/* X axis labels */}
            <text
              x="40"
              y={chartBottom + 22}
              textAnchor="start"
              className={styles.axisLabel}
            >
              {firstDate}
            </text>

            <text
              x={chartWidth - 40}
              y={chartBottom + 22}
              textAnchor="end"
              className={styles.axisLabel}
            >
              {lastDate}
            </text>

            <text
              x={chartWidth / 2}
              y={chartBottom + 22}
              textAnchor="middle"
              className={styles.axisTitle}
            >
              Time (Europe/Madrid)
            </text>
          </svg>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date (Europe/Madrid)</th>
              <th>Temperature (°C)</th>
              <th>Pressure (hPa)</th>
              <th>Wind speed (m/s)</th>
            </tr>
          </thead>

          <tbody>
            {visibleData.map((observation, index) => (
              <tr key={`${observation.fhora}-${index}`}>
                <td>{formatDate(observation.fhora)}</td>

                <td>
                  {observation.temp != null ? observation.temp.toFixed(1) : "—"}
                </td>

                <td>
                  {observation.pres != null ? observation.pres.toFixed(1) : "—"}
                </td>

                <td>
                  {observation.vel != null ? observation.vel.toFixed(1) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationArrow}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              ←
            </button>

            {currentPage <= 3 ? (
              <>
                {Array.from(
                  {
                    length: Math.min(4, totalPages),
                  },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    className={`${styles.paginationPage} ${
                      currentPage === page ? styles.activePage : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {totalPages > 5 && (
                  <>
                    <span className={styles.paginationEllipsis}>...</span>

                    <button
                      className={styles.paginationPage}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </>
            ) : currentPage >= totalPages - 2 ? (
              <>
                <button
                  className={styles.paginationPage}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>

                {totalPages > 5 && (
                  <span className={styles.paginationEllipsis}>...</span>
                )}

                {Array.from(
                  {
                    length: Math.min(4, totalPages),
                  },
                  (_, index) => totalPages - 3 + index,
                ).map((page) => (
                  <button
                    key={page}
                    className={`${styles.paginationPage} ${
                      currentPage === page ? styles.activePage : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </>
            ) : (
              <>
                <button
                  className={styles.paginationPage}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>

                <span className={styles.paginationEllipsis}>...</span>

                {[currentPage - 1, currentPage, currentPage + 1].map((page) => (
                  <button
                    key={page}
                    className={`${styles.paginationPage} ${
                      currentPage === page ? styles.activePage : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <span className={styles.paginationEllipsis}>...</span>

                <button
                  className={styles.paginationPage}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className={styles.paginationArrow}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
