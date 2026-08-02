import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from './AuthIcons';
import { AUTH_COLORS, MAX_AUTH_WIDTH } from './authTheme';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  heroAlign?: 'left' | 'center';
  heroTopSpacing: number;
  bodyTopSpacing: number;
  centerContent?: boolean;
  onBackPress?: () => void;
  showTopDivider?: boolean;
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
    paddingBottom: 40,
  },
  scrollContentCentered: {
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 80,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  topBarDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AUTH_COLORS.border,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlock: {
    gap: 8,
  },
  heroLeft: {
    alignItems: 'flex-start',
  },
  heroCenter: {
    alignItems: 'center',
  },
  title: {
    color: AUTH_COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: AUTH_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  alignLeft: {
    textAlign: 'left',
  },
  alignCenter: {
    textAlign: 'center',
  },
});

export function AuthLayout({
  title,
  subtitle,
  children,
  heroAlign = 'center',
  heroTopSpacing,
  bodyTopSpacing,
  centerContent = false,
  onBackPress = () => {},
  showTopDivider = false,
}: AuthLayoutProps) {
  const isLeftAligned = heroAlign === 'left';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.screen}>
          <View style={styles.shell}>
            <View
              style={[
                styles.topBar,
                showTopDivider ? styles.topBarDivider : null,
              ]}
            >
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={12}
                style={styles.backButton}
                onPress={onBackPress}
              >
                <ArrowLeftIcon />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                centerContent ? styles.scrollContentCentered : null,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.heroBlock,
                  isLeftAligned ? styles.heroLeft : styles.heroCenter,
                  { marginTop: heroTopSpacing },
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    isLeftAligned ? styles.alignLeft : styles.alignCenter,
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    isLeftAligned ? styles.alignLeft : styles.alignCenter,
                  ]}
                >
                  {subtitle}
                </Text>
              </View>

              <View style={{ marginTop: bodyTopSpacing }}>{children}</View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
