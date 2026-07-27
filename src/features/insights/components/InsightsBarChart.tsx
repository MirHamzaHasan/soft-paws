import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

type InsightsBarDatum = {
  label: string;
  value: number;
  accent: string;
  surface: string;
};

type InsightsBarChartProps = {
  title: string;
  subtitle: string;
  data: InsightsBarDatum[];
  style?: ViewStyle;
};

const CHART_HEIGHT = 148;

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 22,
  },
  header: {
    gap: 8,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
  },
  subtitle: {
    color: '#66707A',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  chart: {
    height: CHART_HEIGHT + 36,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  value: {
    color: '#48515A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  track: {
    width: '100%',
    maxWidth: 44,
    height: CHART_HEIGHT,
    borderRadius: 22,
    backgroundColor: '#F4F0EC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: 22,
  },
  label: {
    color: '#8C847D',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export function InsightsBarChart({
  title,
  subtitle,
  data,
  style,
}: InsightsBarChartProps) {
  const animatedValues = useRef<Animated.Value[]>([]);

  if (animatedValues.current.length !== data.length) {
    animatedValues.current = data.map(
      (_, index) => animatedValues.current[index] ?? new Animated.Value(0),
    );
  }

  useEffect(() => {
    const animations = animatedValues.current.map((value, index) => {
      value.setValue(0);

      return Animated.timing(value, {
        toValue: 1,
        duration: 520,
        delay: index * 75,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [data, animatedValues]);

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.chart}>
        {data.map((item, index) => {
          const normalizedHeight = (item.value / maxValue) * CHART_HEIGHT;
          const animatedValue =
            animatedValues.current[index] ?? new Animated.Value(0);
          const fillHeight = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, normalizedHeight],
          });

          return (
            <View key={item.label} style={styles.column}>
              <Text style={styles.value}>{item.value}</Text>
              <View style={[styles.track, { backgroundColor: item.surface }]}>
                <Animated.View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: item.accent,
                      height: fillHeight,
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
