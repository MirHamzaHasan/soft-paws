import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type DogSafetyProfile,
  getToxicitySeverityLabel,
  getToxicityWeightContext,
  type ToxicityItem,
  type ToxicitySeverity,
} from '../data/toxicityDatabase';
import { InfoIcon, PhoneIcon, SkullIcon, ToxicBadgeIcon } from './SafetyIcons';

type ToxicityResultCardProps = {
  dog: DogSafetyProfile;
  item: ToxicityItem;
  onCallPoisonControl: () => void;
  onOpenSource: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0C8C2',
    backgroundColor: '#FFF7F5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 22,
  },
  cardSafe: {
    borderColor: '#D9E3D4',
    backgroundColor: '#F7FBF4',
  },
  cardCaution: {
    borderColor: '#EED9A7',
    backgroundColor: '#FFF9EA',
  },
  cardToxic: {
    borderColor: '#F0C8C2',
    backgroundColor: '#FFF7F5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  badgeSafe: {
    backgroundColor: '#2E7D32',
  },
  badgeCaution: {
    backgroundColor: '#9A650F',
  },
  badgeToxic: {
    backgroundColor: '#B2261B',
  },
  badge: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: '#B2261B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    color: '#FFFCFA',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  content: {
    gap: 18,
  },
  title: {
    color: '#9A1F16',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    letterSpacing: -0.6,
  },
  body: {
    color: '#A5352C',
    fontSize: 17,
    lineHeight: 32,
    fontWeight: '400',
  },
  signsTitle: {
    color: '#5E6670',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  signsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signPill: {
    borderRadius: 999,
    backgroundColor: '#FFFCFA',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5DCD5',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  signText: {
    color: '#40474E',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  weightContext: {
    borderRadius: 16,
    backgroundColor: '#FFFCFA',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5DCD5',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  weightText: {
    color: '#4F575F',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  actions: {
    gap: 14,
  },
  actionButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionFilled: {
    backgroundColor: '#B2261B',
    borderColor: '#B2261B',
  },
  actionOutline: {
    backgroundColor: '#FFFCFA',
    borderColor: '#B2261B',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  actionLabelFilled: {
    color: '#FFFCFA',
  },
  actionLabelOutline: {
    color: '#B2261B',
  },
});

function ToxicityActionButton({
  disabled = false,
  label,
  onPress,
  tone,
  icon,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  tone: 'filled' | 'outline';
  icon: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        styles.actionButton,
        tone === 'filled' ? styles.actionFilled : styles.actionOutline,
        disabled ? { opacity: 0.5 } : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.actionContent}>
        {icon}
        <Text
          style={[
            styles.actionLabel,
            tone === 'filled'
              ? styles.actionLabelFilled
              : styles.actionLabelOutline,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function getSeverityStyles(severity: ToxicitySeverity) {
  if (severity === 'safe') {
    return {
      badge: styles.badgeSafe,
      card: styles.cardSafe,
      titleColor: '#2E6E32',
    };
  }

  if (severity === 'caution') {
    return {
      badge: styles.badgeCaution,
      card: styles.cardCaution,
      titleColor: '#8A5A0A',
    };
  }

  return {
    badge: styles.badgeToxic,
    card: styles.cardToxic,
    titleColor: '#9A1F16',
  };
}

export function ToxicityResultCard({
  dog,
  item,
  onCallPoisonControl,
  onOpenSource,
}: ToxicityResultCardProps) {
  const severityStyles = getSeverityStyles(item.severity);

  return (
    <View style={[styles.card, severityStyles.card]}>
      <View style={styles.topRow}>
        <View style={[styles.badge, severityStyles.badge]}>
          <ToxicBadgeIcon />
          <Text style={styles.badgeText}>
            {getToxicitySeverityLabel(item.severity)}
          </Text>
        </View>

        <SkullIcon />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: severityStyles.titleColor }]}>
          {item.name}
        </Text>
        <Text style={styles.body}>{item.details}</Text>
        <Text style={styles.body}>{item.action}</Text>

        <View style={styles.weightContext}>
          <Text style={styles.weightText}>
            {getToxicityWeightContext(item, dog)}
          </Text>
        </View>

        <Text style={styles.signsTitle}>Watch for</Text>
        <View style={styles.signsWrap}>
          {item.signs.map((sign) => (
            <View key={sign} style={styles.signPill}>
              <Text style={styles.signText}>{sign}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <ToxicityActionButton
          label="Call Poison Control"
          tone="filled"
          icon={<PhoneIcon />}
          onPress={onCallPoisonControl}
        />
        <ToxicityActionButton
          label={`Source: ${item.sourceName}`}
          tone="outline"
          icon={<InfoIcon />}
          onPress={onOpenSource}
        />
      </View>
    </View>
  );
}
