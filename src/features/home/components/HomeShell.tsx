import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBottomTabBar } from './HomeBottomTabBar';
import { HomeHeader } from './HomeHeader';

type AppTabKey =
  | 'archive'
  | 'gallery'
  | 'home'
  | 'household'
  | 'insights'
  | 'ledger'
  | 'log'
  | 'meds'
  | 'memories'
  | 'profile'
  | 'timeline';

type HomeTabRoute =
  | '/'
  | '/home-offline'
  | '/expenses'
  | '/profile'
  | '/insights'
  | '/household'
  | '/memory-book'
  | '/add-medication'
  | '/photo-journal'
  | '/timeline'
  | '/timeline-empty';

type HomeShellProps = {
  children: ReactNode;
  activeTab: AppTabKey;
  headerTitle?: string;
  headerVariant?: 'default' | 'compact';
  headerAvatarEmoji?: string;
  headerAvatarBackgroundColor?: string;
  headerDogName?: string;
  headerDogMeta?: string;
  tabVariant?: 'main' | 'care' | 'household' | 'journal';
  tabRoutes?: Partial<Record<AppTabKey, HomeTabRoute>>;
  showTabBar?: boolean;
  overlay?: ReactNode;
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 390,
    paddingHorizontal: 12,
    paddingTop: 18,
  },
  overlayWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 72,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  overlayInner: {
    width: '100%',
    maxWidth: 390,
  },
});

export function HomeShell({
  children,
  activeTab,
  headerTitle,
  headerVariant,
  headerAvatarEmoji,
  headerAvatarBackgroundColor,
  headerDogName,
  headerDogMeta,
  tabVariant = 'main',
  tabRoutes,
  showTabBar = true,
  overlay,
}: HomeShellProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <View style={styles.screen}>
        <HomeHeader
          appTitle={headerTitle}
          variant={headerVariant}
          avatarEmoji={headerAvatarEmoji}
          avatarBackgroundColor={headerAvatarBackgroundColor}
          dogName={headerDogName}
          dogMeta={headerDogMeta}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>

        {showTabBar ? (
          <HomeBottomTabBar
            activeTab={activeTab}
            variant={tabVariant}
            routes={tabRoutes}
          />
        ) : null}

        {overlay ? (
          <View pointerEvents="box-none" style={styles.overlayWrap}>
            <View style={styles.overlayInner}>{overlay}</View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
