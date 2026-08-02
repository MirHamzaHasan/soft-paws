import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type LedgerDonutSlice = {
  label: string;
  value: number;
  color: string;
};

type LedgerDonutCardProps = {
  title: string;
  data: LedgerDonutSlice[];
};

const SIZE = 112;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  legendCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D5D1',
  },
  legendLabel: {
    color: '#2D3135',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  legendValue: {
    color: '#5E6670',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
});

export function LedgerDonutCard({ title, data }: LedgerDonutCardProps) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, data]);

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartWrap}>
        <Animated.View
          style={{
            opacity: enter,
            transform: [
              {
                scale: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          }}
        >
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
              {data.map((slice) => {
                const sliceLength = (slice.value / total) * CIRCUMFERENCE;
                const circleOffset = CIRCUMFERENCE - offset;
                offset += sliceLength;

                return (
                  <Circle
                    key={slice.label}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${sliceLength} ${CIRCUMFERENCE}`}
                    strokeDashoffset={circleOffset}
                    strokeLinecap="butt"
                  />
                );
              })}

              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS - STROKE / 2 + 1}
                fill="#FFFCFA"
              />
            </G>
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.legend}>
        {data.map((slice) => (
          <View key={slice.label} style={styles.legendRow}>
            <View style={styles.legendCopy}>
              <View
                style={[styles.legendDot, { backgroundColor: slice.color }]}
              />
              <Text style={styles.legendLabel}>{slice.label}</Text>
            </View>
            <Text style={styles.legendValue}>{slice.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
