import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

type LedgerTrendDatum = {
  label: string;
  value: number;
  color?: string;
};

type LedgerTrendCardProps = {
  title: string;
  data: LedgerTrendDatum[];
  style?: ViewStyle;
};

const CHART_HEIGHT = 80;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
  },
  chart: {
    height: CHART_HEIGHT + 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  track: {
    width: '100%',
    maxWidth: 54,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 2,
    backgroundColor: '#ECEAE8',
  },
  label: {
    color: '#77706A',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  baseline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E1DDD8',
  },
});

export function LedgerTrendCard({ title, data, style }: LedgerTrendCardProps) {
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
        duration: 420,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [data]);

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chart}>
        {data.map((item, index) => {
          const normalizedHeight = (item.value / maxValue) * CHART_HEIGHT;
          const animatedValue =
            animatedValues.current[index] ?? new Animated.Value(0);
          const barHeight = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, normalizedHeight],
          });

          return (
            <View key={item.label} style={styles.column}>
              <View style={styles.track}>
                <Animated.View
                  style={[
                    styles.fill,
                    {
                      height: barHeight,
                      backgroundColor: item.color ?? '#E7E5E3',
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.baseline} />
    </View>
  );
}
