import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type InsightsNarrativeCardProps = {
  eyebrow: string;
  title?: string;
  body: string;
  eyebrowIcon?: ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  eyebrowColor?: string;
  bodyColor?: string;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E1DB',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 14,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    letterSpacing: -0.6,
  },
  body: {
    color: '#5F6670',
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '400',
  },
});

export function InsightsNarrativeCard({
  eyebrow,
  title,
  body,
  eyebrowIcon,
  borderColor = '#E5E1DB',
  backgroundColor = '#FFFCFA',
  eyebrowColor = '#7A847F',
  bodyColor = '#5F6670',
}: InsightsNarrativeCardProps) {
  return (
    <View style={[styles.card, { borderColor, backgroundColor }]}>
      <View style={styles.eyebrowRow}>
        {eyebrowIcon}
        <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{eyebrow}</Text>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.body, { color: bodyColor }]}>{body}</Text>
    </View>
  );
}
