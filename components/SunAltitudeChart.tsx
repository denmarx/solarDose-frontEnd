import React from "react";
import { View } from "react-native";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";

interface SunAltitudeChartProps {
  sunAltitudes: { time: string; altitude: number }[];
  sunrise: string;
  sunset: string;
}

export const SunAltitudeChart: React.FC<SunAltitudeChartProps> = ({ sunAltitudes, sunrise, sunset }) => {
  // Annahme: sunAltitudes ist sortiert nach Zeit
  const width = 300;
  const height = 200;
  const padding = 30;

  // X: Zeit, Y: Sonnenhöhe
  const times = sunAltitudes.map((d) => d.time);
  const altitudes = sunAltitudes.map((d) => d.altitude);

  // const minAltitude = Math.min(...altitudes, 0);
  // const maxAltitude = Math.max(...altitudes, 90);

  // Always show 0° and 45° on the axis, even if min/max are different
  // const minAltitude = Math.min(0, ...altitudes);
  const minAltitude = 0;
  const maxAltitude = Math.max(90, ...altitudes);

  // Hilfsfunktion für Koordinaten
  const getX = (idx: number) => padding + ((width - 2 * padding) * idx) / (sunAltitudes.length - 1);
  const getY = (alt: number) =>
    height - padding - ((height - 2 * padding) * (Math.max(alt, 0))) / (maxAltitude - minAltitude);
  
  // Find the index for the current hour in local time
  
  const now = new Date();
  const nowHour = now.getHours();
  const nowIdx = sunAltitudes.findIndex((d) => {
  const [hourStr] = d.time.split(":");
  return parseInt(hourStr, 10) === nowHour;
  });
  
    // // X-Axis labels: sunrise, noon, sunset, and every 6 hours
    // const noonIdx = sunAltitudes.findIndex((d) => d.time.startsWith("12:"));
    // const labelIndices = [
    //   0, // first (midnight)
    //   sunAltitudes.findIndex((d) => d.time === sunrise),
    //   noonIdx,
    //   sunAltitudes.findIndex((d) => d.time === sunset),
    //   sunAltitudes.length - 1, // last (23:00)
    //   6, 18 // 6:00 and 18:00 if available
    // ].filter(idx => idx >= 0 && idx < sunAltitudes.length);
  
 // X-Achse: 00:00, 06:00, 12:00, 18:00
const labelHours = [0, 6, 12, 18];
const labelIndices = labelHours
  .map(h => sunAltitudes.findIndex(d => d.time.startsWith(h.toString().padStart(2, "0"))))
  .filter(idx => idx >= 0);

// Sunrise/Sunset nur, wenn sie nicht auf den Standardzeiten liegen
const sunriseIdx = sunAltitudes.findIndex(d => d.time === sunrise);
const sunsetIdx = sunAltitudes.findIndex(d => d.time === sunset);
[sunriseIdx, sunsetIdx].forEach(idx => {
  if (idx > 0 && !labelIndices.includes(idx)) labelIndices.push(idx);
});

// Doppelte entfernen und sortieren
const uniqueLabelIndices = Array.from(new Set(labelIndices)).sort((a, b) => a - b);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>
        {/* Y-Axis lines and labels */}

        {/* 45° line */}
        <Line
          x1={padding}
          y1={getY(45)}
          x2={width - padding}
          y2={getY(45)}
          stroke="#bbb"
          strokeDasharray="2"
        />
        <SvgText x={padding - 12} y={getY(45) + 4} fontSize="10" fill="#333" textAnchor="end">
          {`45°`}
        </SvgText>
        {/* Max/Min labels */}
        <SvgText x={padding - 12} y={getY(maxAltitude) + 4} fontSize="10" fill="#333" textAnchor="end">
          {`${Math.round(maxAltitude)}°`}
        </SvgText>


        {/* X-Axis */}
        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#888" />
        <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#888" />

        {/* Sun path */}
        {sunAltitudes.map((d, i) =>
          i > 0 ? (
            <Line
              key={i}
              x1={getX(i - 1)}
              y1={getY(altitudes[i - 1])}
              x2={getX(i)}
              y2={getY(d.altitude)}
              stroke="#FFA500"
              strokeWidth={2}
            />
          ) : null
        )}

        {/* Sun as a circle at current hour */}
        {nowIdx >= 0 && (
          <Circle
            cx={getX(nowIdx)}
            cy={getY(altitudes[nowIdx])}
            r={10}
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth={2}
          />
        )}

        {/* X-Axis labels */}
        {uniqueLabelIndices.map(idx => (
          <SvgText
            key={idx}
            x={getX(idx)}
            y={height - padding + 15}
            fontSize="10"
            fill="#333"
            textAnchor="middle"
          >
            {times[idx]}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};