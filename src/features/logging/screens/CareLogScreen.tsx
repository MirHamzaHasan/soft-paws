import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { EXPANDED_CARE_LOG_OPTIONS } from '@/types/events';

import { LogDetailLayout } from '../components/LogDetailLayout';

const styles = StyleSheet.create({
  stack: {
    gap: 22,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  list: {
    gap: 12,
  },
  card: {
    minHeight: 88,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E0DC',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F4',
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  cardTitle: {
    color: '#1F2528',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  cardBody: {
    color: '#687079',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  footnote: {
    color: '#7A828A',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
});

export default function CareLogScreen() {
  const router = useRouter();

  return (
    <LogDetailLayout
      title="Care Log"
      headerVariant="brand"
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.title}>Care log</Text>
          <Text style={styles.body}>
            Add less-frequent observations without crowding the daily one-tap
            Home grid.
          </Text>
        </View>

        <View style={styles.list}>
          {EXPANDED_CARE_LOG_OPTIONS.map((option) => (
            <Pressable
              key={option.eventType}
              accessibilityRole="button"
              style={styles.card}
              onPress={() => router.push(`/log/${option.eventType}` as Href)}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardBody}>{option.description}</Text>
              </View>
              <ChevronRightIcon />
            </Pressable>
          ))}
        </View>

        <Text style={styles.footnote}>
          These are caregiver-entered observations. BarkLog keeps raw logs free
          and offline on this device.
        </Text>
      </View>
    </LogDetailLayout>
  );
}
