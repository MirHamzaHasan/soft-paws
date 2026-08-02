import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuthSessionStore } from '@/stores';

import { HomeBottomTabBar } from '../../home/components/HomeBottomTabBar';
import { MedsIcon, PoopsIcon } from '../../insights/components/InsightsIcons';
import { LogDetailLayout } from '../../logging/components/LogDetailLayout';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { ArchiveFilterPill } from '../components/ArchiveFilterPill';
import { PhotoJournalTile } from '../components/PhotoJournalTile';

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  compareButton: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareText: {
    color: '#0A0A0A',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  cell: {
    flexBasis: '32.6%',
    flexGrow: 1,
  },
  emojiArt: {
    fontSize: 48,
  },
});

export default function PhotoJournalGalleryScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const premiumAccess = hasPremiumAccess(barklogUser);

  return (
    <LogDetailLayout
      title="BARKLOG"
      headerVariant="caps"
      trailing={
        <Pressable
          accessibilityRole="button"
          style={styles.compareButton}
          onPress={() => {
            if (!premiumAccess) {
              openPremiumGate(router, 'photo-compare');
            }
          }}
        >
          <Text style={styles.compareText}>Compare</Text>
        </Pressable>
      }
      footer={
        <HomeBottomTabBar
          activeTab="gallery"
          variant="journal"
          routes={{
            archive: '/timeline',
            gallery: '/photo-journal',
          }}
        />
      }
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <Text style={styles.title}>Photo journal</Text>

        <View style={styles.filters}>
          <ArchiveFilterPill label="All" selected onPress={() => {}} />
          <ArchiveFilterPill label="Symptoms" onPress={() => {}} />
          <ArchiveFilterPill label="Poop" onPress={() => {}} />
          <ArchiveFilterPill label="Meals" onPress={() => {}} />
          <ArchiveFilterPill label="Walks" onPress={() => {}} />
        </View>

        <View style={styles.grid}>
          {[
            {
              date: 'OCT 24',
              bg: '#5D8C42',
              art: <Text style={styles.emojiArt}>🐶</Text>,
            },
            {
              date: 'OCT 23',
              bg: '#1E272E',
              art: <Text style={styles.emojiArt}>🥣</Text>,
            },
            {
              date: 'OCT 21',
              bg: '#6D4A2B',
              art: <Text style={styles.emojiArt}>🐕</Text>,
            },
            {
              date: 'OCT 20',
              bg: '#FFF5F3',
              art: <PoopsIcon size={62} />,
              color: '#9D3123',
            },
            {
              date: 'OCT 19',
              bg: '#4D4942',
              art: <Text style={styles.emojiArt}>🐾</Text>,
            },
            {
              date: 'OCT 18',
              bg: '#F0EBE2',
              art: <Text style={styles.emojiArt}>😴</Text>,
              color: '#0A0A0A',
            },
            {
              date: 'OCT 15',
              bg: '#F4F0FF',
              art: <MedsIcon size={62} />,
              color: '#5A34C3',
            },
            {
              date: 'OCT 14',
              bg: '#20311F',
              art: <Text style={styles.emojiArt}>🐕‍🦺</Text>,
            },
            {
              date: 'OCT 10',
              bg: '#2B2624',
              art: <Text style={styles.emojiArt}>🐶</Text>,
            },
          ].map((item) => (
            <View key={item.date} style={styles.cell}>
              <PhotoJournalTile
                dateLabel={item.date}
                backgroundColor={item.bg}
                labelColor={item.color}
                artwork={item.art}
              />
            </View>
          ))}
        </View>
      </View>
    </LogDetailLayout>
  );
}
