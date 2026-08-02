import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeAvatar } from './HomeAvatar';
import { SettingsIcon } from './HomeIcons';

type HomeHeaderProps = {
  appTitle?: string;
  dogName?: string;
  dogMeta?: string;
  variant?: 'default' | 'compact';
  avatarEmoji?: string;
  avatarBackgroundColor?: string;
};

const styles = StyleSheet.create({
  chrome: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  inner: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  copy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  copyCompact: {
    justifyContent: 'center',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '500',
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '400',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function HomeHeader({
  appTitle = 'BarkLog',
  dogName = 'Max',
  dogMeta = 'Golden Retriever · 3y',
  variant = 'default',
  avatarEmoji,
  avatarBackgroundColor,
}: HomeHeaderProps) {
  const router = useRouter();
  const compact = variant === 'compact';

  return (
    <View style={styles.chrome}>
      <View style={styles.inner}>
        <View style={styles.identity}>
          <HomeAvatar
            emoji={avatarEmoji}
            backgroundColor={avatarBackgroundColor}
            size={36}
          />

          <View style={[styles.copy, compact ? styles.copyCompact : null]}>
            <Text style={styles.title}>{appTitle}</Text>
            {compact ? null : (
              <Text style={styles.subtitle}>
                {dogName} · {dogMeta}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <SettingsIcon color="#9A938C" />
        </Pressable>
      </View>
    </View>
  );
}
