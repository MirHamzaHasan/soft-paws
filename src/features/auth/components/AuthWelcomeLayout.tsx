import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_COLORS, MAX_AUTH_WIDTH } from './authTheme';

type AuthWelcomeLayoutProps = {
  hero: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footerNote?: string;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: AUTH_COLORS.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_AUTH_WIDTH,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 180,
    gap: 18,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: AUTH_COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B1AAA4',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomBlock: {
    gap: 24,
  },
  footerNote: {
    color: '#B1AAA4',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export function AuthWelcomeLayout({
  hero,
  title,
  subtitle,
  children,
  footerNote,
}: AuthWelcomeLayoutProps) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.screen}>
          <View style={styles.shell}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <View style={styles.brandBlock}>
                  {hero}

                  <View style={styles.copyBlock}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                  </View>
                </View>

                <View style={styles.bottomBlock}>
                  {children}
                  {footerNote ? (
                    <Text style={styles.footerNote}>{footerNote}</Text>
                  ) : null}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
