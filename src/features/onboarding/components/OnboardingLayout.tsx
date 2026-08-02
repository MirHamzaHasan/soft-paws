import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingStepDots } from './OnboardingStepDots';

type OnboardingLayoutProps = {
  title?: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  surfaceVariant?: 'plain' | 'card';
  heroTopSpacing?: number;
  bodyTopSpacing?: number;
  subtitleMaxWidth?: number;
  heroContent?: ReactNode;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 28,
    alignItems: 'center',
  },
  surfaceBase: {
    width: '100%',
    maxWidth: 448,
  },
  surfacePlain: {
    paddingHorizontal: 24,
    paddingTop: 132,
    paddingBottom: 20,
  },
  surfaceCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export function OnboardingLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  surfaceVariant = 'plain',
  heroTopSpacing,
  bodyTopSpacing,
  subtitleMaxWidth = 360,
  heroContent,
}: OnboardingLayoutProps) {
  const isCard = surfaceVariant === 'card';
  const resolvedHeroTopSpacing = heroTopSpacing ?? (isCard ? 36 : 40);
  const resolvedBodyTopSpacing = bodyTopSpacing ?? 34;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.surfaceBase,
            isCard ? styles.surfaceCard : styles.surfacePlain,
          ]}
        >
          <OnboardingStepDots
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          {heroContent ? (
            <View style={{ marginTop: resolvedHeroTopSpacing }}>
              {heroContent}
            </View>
          ) : (
            <View style={[styles.hero, { marginTop: resolvedHeroTopSpacing }]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={[styles.subtitle, { maxWidth: subtitleMaxWidth }]}>
                {subtitle}
              </Text>
            </View>
          )}

          <View style={{ marginTop: resolvedBodyTopSpacing }}>{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
