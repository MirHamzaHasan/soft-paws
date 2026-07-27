import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StateScreenLayoutProps = {
  illustration: ReactNode;
  title: string;
  message: string;
  actions: ReactNode;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    paddingHorizontal: 28,
    paddingTop: 74,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 28,
    paddingTop: 42,
  },
  copy: {
    maxWidth: 430,
    alignItems: 'center',
    gap: 18,
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
    color: '#5D666E',
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400',
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
});

export function StateScreenLayout({
  illustration,
  title,
  message,
  actions,
}: StateScreenLayoutProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <View style={styles.screen}>
        <View style={styles.shell}>
          <View style={styles.hero}>
            {illustration}
            <View style={styles.copy}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>

          <View style={styles.actions}>{actions}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}
