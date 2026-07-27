import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '../../auth/components/AuthIcons';

type AssistantLayoutProps = {
  title: string;
  onBackPress: () => void;
  trailing?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
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
  trailingWrap: {
    position: 'absolute',
    right: 24,
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
  },
  body: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
});

export function AssistantLayout({
  title,
  onBackPress,
  trailing,
  footer,
  children,
}: AssistantLayoutProps) {
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
                accessibilityRole="button"
                style={styles.backButton}
                onPress={onBackPress}
              >
                <ArrowLeftIcon />
              </Pressable>

              <Text style={styles.title}>{title}</Text>

              <View style={styles.trailingWrap}>{trailing}</View>
            </View>

            <View style={styles.body}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>

            {footer}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
