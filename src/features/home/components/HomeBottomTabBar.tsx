import { useRouter } from 'expo-router';

import { BarklogTabBar } from '@/components/ui';

import {
  ArchiveTabIcon,
  GalleryTabIcon,
  HomeTabIcon,
  HouseholdTabIcon,
  InsightsTabIcon,
  LedgerTabIcon,
  LogTabIcon,
  MedsTabIcon,
  MemoriesTabIcon,
  ProfileTabIcon,
  TimelineTabIcon,
} from './HomeIcons';

type HomeTabKey =
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

type HomeTabVariant = 'main' | 'care' | 'household' | 'journal';
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

type HomeBottomTabBarProps = {
  activeTab: HomeTabKey;
  variant?: HomeTabVariant;
  routes?: Partial<Record<HomeTabKey, HomeTabRoute>>;
};

const MAIN_TAB_META: {
  key: HomeTabKey;
  label: string;
  route?: HomeTabRoute;
}[] = [
  { key: 'home', label: 'Home', route: '/' },
  { key: 'timeline', label: 'Timeline', route: '/timeline' },
  { key: 'insights', label: 'Insights', route: '/insights' },
  { key: 'profile', label: 'Profile', route: '/profile' },
];

const CARE_TAB_META: {
  key: HomeTabKey;
  label: string;
  route?: HomeTabRoute;
}[] = [
  { key: 'archive', label: 'ARCHIVE' },
  { key: 'ledger', label: 'LEDGER', route: '/expenses' },
  { key: 'memories', label: 'MEMORIES' },
  { key: 'profile', label: 'PROFILE', route: '/profile' },
];

const HOUSEHOLD_TAB_META: {
  key: HomeTabKey;
  label: string;
  route?: HomeTabRoute;
}[] = [
  { key: 'archive', label: 'ARCHIVE', route: '/timeline' },
  { key: 'household', label: 'HOUSEHOLD', route: '/household' },
  { key: 'meds', label: 'MEDS', route: '/add-medication' },
  { key: 'profile', label: 'PROFILE', route: '/profile' },
];

const JOURNAL_TAB_META: {
  key: HomeTabKey;
  label: string;
  route?: HomeTabRoute;
}[] = [
  { key: 'archive', label: 'ARCHIVE', route: '/timeline' },
  { key: 'log', label: 'LOG', route: '/' },
  { key: 'gallery', label: 'GALLERY', route: '/photo-journal' },
  { key: 'meds', label: 'MEDS', route: '/add-medication' },
];

function renderIcon(key: HomeTabKey, color: string) {
  switch (key) {
    case 'archive':
      return <ArchiveTabIcon color={color} />;
    case 'gallery':
      return <GalleryTabIcon color={color} />;
    case 'home':
      return <HomeTabIcon color={color} />;
    case 'household':
      return <HouseholdTabIcon color={color} />;
    case 'ledger':
      return <LedgerTabIcon color={color} />;
    case 'log':
      return <LogTabIcon color={color} />;
    case 'meds':
      return <MedsTabIcon color={color} />;
    case 'memories':
      return <MemoriesTabIcon color={color} />;
    case 'timeline':
      return <TimelineTabIcon color={color} />;
    case 'insights':
      return <InsightsTabIcon color={color} />;
    case 'profile':
      return <ProfileTabIcon color={color} />;
    default:
      return <HomeTabIcon color={color} />;
  }
}

export function HomeBottomTabBar({
  activeTab,
  variant = 'main',
  routes,
}: HomeBottomTabBarProps) {
  const router = useRouter();
  let tabs = MAIN_TAB_META;

  if (variant === 'care') {
    tabs = CARE_TAB_META;
  } else if (variant === 'household') {
    tabs = HOUSEHOLD_TAB_META;
  } else if (variant === 'journal') {
    tabs = JOURNAL_TAB_META;
  }

  return (
    <BarklogTabBar
      variant={variant === 'main' ? 'main' : 'compact'}
      items={tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const color = isActive ? '#0A0A0A' : '#B1AAA4';
        const route = routes?.[tab.key] ?? tab.route;

        return {
          key: tab.key,
          label: tab.label,
          icon: renderIcon(tab.key, color),
          active: isActive,
          onPress: route ? () => router.replace(route) : undefined,
        };
      })}
    />
  );
}
