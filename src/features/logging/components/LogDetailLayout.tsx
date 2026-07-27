import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '../../auth/components/AuthIcons';

type LogDetailLayoutProps = {
  title: string;
  onBackPress: () => void;
  children: ReactNode;
  headerVariant?: 'caps' | 'brand';
  trailing?: ReactNode;
  footer?: ReactNode;
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
    maxWidth: 720,
  },
  topBar: {
    minHeight: 74,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E2DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
  titleBrand: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0,
    textTransform: 'none',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  trailingWrap: {
    position: 'absolute',
    right: 24,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function LogDetailLayout({
  title,
  onBackPress,
  children,
  headerVariant = 'caps',
  trailing,
  footer,
}: LogDetailLayoutProps) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.screen}>
          <View style={styles.shell}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={12}
                style={styles.backButton}
                onPress={onBackPress}
              >
                <ArrowLeftIcon />
              </Pressable>

              <Text
                style={[
                  styles.title,
                  headerVariant === 'brand' ? styles.titleBrand : null,
                ]}
              >
                {title}
              </Text>

              <View style={styles.trailingWrap}>{trailing}</View>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {footer}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
