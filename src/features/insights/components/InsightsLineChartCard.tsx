import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type InsightsLineChartCardProps = {
  title: string;
  labels: string[];
  values: number[];
  strokeColor: string;
  dotColor?: string;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 130;
const PADDING_X = 12;
const PADDING_Y = 18;

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 20,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '400',
  },
  chartFrame: {
    minHeight: CHART_HEIGHT + 36,
    justifyContent: 'flex-end',
  },
  animatedLayer: {
    width: '100%',
  },
  labelsRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  label: {
    color: '#616A72',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  baseline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DED8D2',
    marginTop: 12,
    marginHorizontal: 6,
  },
});

function clampRange(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

export function InsightsLineChartCard({
  title,
  labels,
  values,
  strokeColor,
  dotColor,
}: InsightsLineChartCardProps) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, labels, values]);

  const graph = useMemo(() => {
    const safeValues = values.length > 0 ? values : [0];
    const { min, max } = clampRange(safeValues);
    const usableWidth = CHART_WIDTH - PADDING_X * 2;
    const usableHeight = CHART_HEIGHT - PADDING_Y * 2;
    const stepX =
      safeValues.length > 1 ? usableWidth / (safeValues.length - 1) : 0;

    const points = safeValues.map((value, index) => {
      const x = PADDING_X + stepX * index;
      const ratio = (value - min) / (max - min);
      const y = CHART_HEIGHT - PADDING_Y - ratio * usableHeight;
      return { x, y };
    });

    const path = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    return { points, path };
  }, [values]);

  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartFrame}>
        <Animated.View
          style={[
            styles.animatedLayer,
            {
              opacity: enter,
              transform: [{ translateY }],
            },
          ]}
        >
          <Svg
            width="100%"
            height={CHART_HEIGHT}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            <Line
              x1={PADDING_X}
              y1={CHART_HEIGHT - PADDING_Y}
              x2={CHART_WIDTH - PADDING_X}
              y2={CHART_HEIGHT - PADDING_Y}
              stroke="#EFE9E3"
              strokeWidth="1"
            />
            <Path
              d={graph.path}
              stroke={strokeColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {graph.points.map((point, index) => (
              <Circle
                key={`${labels[index] ?? index}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill={dotColor ?? strokeColor}
              />
            ))}
          </Svg>
        </Animated.View>

        <View style={styles.labelsRow}>
          {labels.map((label) => (
            <Text key={label} style={styles.label}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.baseline} />
      </View>
    </View>
  );
}
