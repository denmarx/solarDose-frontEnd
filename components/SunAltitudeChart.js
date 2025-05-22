import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

export const SunAltitudeChart = ({ sunAltitudes, sunrise, sunset }) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartHeight = screenWidth * 0.5;

  const yAxisWidth = 20; // Set width for Y-axis labels
  const chartPadding = 15; // Padding on both sides of the chart (left and right)
  const chartWidth = screenWidth - yAxisWidth - 2 * chartPadding;

  const yAxisLabels = [90, 75, 60, 45, 30, 15, 0];

  return (
    <View style={[styles.container, { paddingHorizontal: chartPadding }]}>
      {/* Y-axis */}
      <View style={[styles.yAxis, { width: yAxisWidth, height: chartHeight }]}>
        {yAxisLabels.map((label, index) => (
          <Text key={index} style={styles.yAxisLabel}>
            {label}°
          </Text>
        ))}
      </View>

      {/* Chart Area */}
      <View
        style={[
          styles.chartArea,
          {
            width: chartWidth,
            height: chartHeight,
          },
        ]}
      >
        {/* X-axis */}
        <View style={styles.xAxis}>
          <Text style={styles.xAxisLabel}>{sunrise}</Text>
          <Text style={styles.xAxisLabel}>Noon</Text>
          <Text style={styles.xAxisLabel}>{sunset}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxis: {
    justifyContent: 'space-between',
    marginRight: 0, // Small gap between Y-axis labels and the chart
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right', // Align Y-axis labels to the right
  },
  chartArea: {
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    // paddingHorizontal: 5, // Add some inner padding for X-axis labels
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#333',
  },
});
