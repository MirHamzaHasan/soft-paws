import { StyleSheet, Text, View } from 'react-native';

import { HomeShell } from '../../home/components/HomeShell';
import { ArchiveStackIllustration } from '../../states/components/StateIllustrations';

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 720,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingBottom: 60,
  },
  title: {
    color: '#273136',
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  message: {
    maxWidth: 420,
    color: '#5D666E',
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default function TimelineEmptyScreen() {
  return (
    <HomeShell
      activeTab="timeline"
      headerVariant="compact"
      headerAvatarEmoji="🧑"
      headerAvatarBackgroundColor="#E4E8F2"
      tabRoutes={{ timeline: '/timeline-empty' }}
    >
      <View style={styles.wrap}>
        <ArchiveStackIllustration />
        <Text style={styles.title}>The Archive is Empty</Text>
        <Text style={styles.message}>
          Nothing logged yet today. Tap any button on Home to get started.
        </Text>
      </View>
    </HomeShell>
  );
}
