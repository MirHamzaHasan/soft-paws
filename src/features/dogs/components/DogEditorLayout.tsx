import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon } from '../../auth/components/AuthIcons';

type DogEditorLayoutProps = {
  title: string;
  onClosePress: () => void;
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
    maxWidth: 760,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    marginTop: 56,
    color: '#2F373A',
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '400',
    letterSpacing: -1.5,
  },
  body: {
    marginTop: 56,
  },
});

export function DogEditorLayout({
  title,
  onClosePress,
  children,
}: DogEditorLayoutProps) {
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
                accessibilityLabel="Close add dog screen"
                accessibilityRole="button"
                hitSlop={12}
                style={styles.closeButton}
                onPress={onClosePress}
              >
                <CloseIcon />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>{title}</Text>
              <View style={styles.body}>{children}</View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
