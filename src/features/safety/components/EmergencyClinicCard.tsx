import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';

type EmergencyClinicCardProps = {
  title: string;
  meta: string;
  illustration: ReactNode;
  actionIcon?: ReactNode;
  onDirectionsPress?: () => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CBD2D7',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
    gap: 18,
    paddingBottom: 22,
  },
  illustrationWrap: {
    overflow: 'hidden',
  },
  copy: {
    gap: 8,
    paddingHorizontal: 24,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
  },
  meta: {
    color: '#5E6670',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  },
  action: {
    paddingHorizontal: 24,
  },
});

export function EmergencyClinicCard({
  title,
  meta,
  illustration,
  actionIcon,
  onDirectionsPress,
}: EmergencyClinicCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.illustrationWrap}>{illustration}</View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <View style={styles.action}>
        <PrimaryButton
          label="Get Directions"
          size="large"
          leadingIcon={actionIcon}
          backgroundColor="#EAF0F3"
          borderColor="#BFC8CE"
          labelColor="#2F353B"
          onPress={onDirectionsPress ?? (() => {})}
        />
      </View>
    </View>
  );
}
