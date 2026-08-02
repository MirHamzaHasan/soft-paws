import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon } from '../../auth/components/AuthIcons';

type MedicationEditorLayoutProps = {
  title: string;
  actionLabel?: string;
  onClosePress: () => void;
  onActionPress?: () => void;
  children: ReactNode;
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
    maxWidth: 448,
  },
  topBar: {
    minHeight: 64,
    paddingHorizontal: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E2DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    minWidth: 54,
    minHeight: 44,
    justifyContent: 'center',
  },
  closeButton: {
    alignItems: 'flex-start',
  },
  actionButton: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
  },
  actionText: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
});

export function MedicationEditorLayout({
  title,
  actionLabel,
  onClosePress,
  onActionPress,
  children,
}: MedicationEditorLayoutProps) {
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
                style={[styles.sideButton, styles.closeButton]}
                onPress={onClosePress}
              >
                <CloseIcon />
              </Pressable>

              <Text style={styles.title}>{title}</Text>

              <Pressable
                accessibilityRole="button"
                style={[styles.sideButton, styles.actionButton]}
                onPress={onActionPress}
              >
                <Text style={styles.actionText}>{actionLabel}</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
