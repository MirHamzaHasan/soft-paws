import { Stack } from 'expo-router';
import { type ReactNode, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '../../auth/components/AuthIcons';

type AssistantLayoutProps = {
  title: string;
  onBackPress: () => void;
  trailing?: ReactNode;
  footer?: ReactNode;
  scrollToLatest?: boolean;
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
    maxWidth: 768,
    alignSelf: 'center',
  },
  topBar: {
    minHeight: 64,
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
});

export function AssistantLayout({
  title,
  onBackPress,
  trailing,
  footer,
  scrollToLatest = false,
  children,
}: AssistantLayoutProps) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => {
                  if (scrollToLatest)
                    scrollRef.current?.scrollToEnd({ animated: true });
                }}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>

            {footer}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
