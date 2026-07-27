import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function SettingsIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.9 3.9H13.1L13.62 5.9C14.14 6.07 14.64 6.28 15.1 6.56L16.94 5.63L18.5 7.19L17.57 9.03C17.85 9.49 18.06 9.99 18.23 10.51L20.23 11.03V13.25L18.23 13.77C18.06 14.29 17.85 14.79 17.57 15.25L18.5 17.09L16.94 18.65L15.1 17.72C14.64 18 14.14 18.21 13.62 18.38L13.1 20.38H10.9L10.38 18.38C9.86 18.21 9.36 18 8.9 17.72L7.06 18.65L5.5 17.09L6.43 15.25C6.15 14.79 5.94 14.29 5.77 13.77L3.77 13.25V11.03L5.77 10.51C5.94 9.99 6.15 9.49 6.43 9.03L5.5 7.19L7.06 5.63L8.9 6.56C9.36 6.28 9.86 6.07 10.38 5.9L10.9 3.9Z"
        fill={color}
      />
      <Circle cx="12" cy="12.14" r="3.15" fill="#FAFAFA" />
    </Svg>
  );
}

export function ClockIcon({ color = '#6F767D', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Path
        d="M12 7.9V12.2L15.2 14.1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ color = '#596169', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6.8L14.2 12L9 17.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WarningIcon({ color = '#A8342A', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4L21 19H3L12 4Z"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
      />
      <Rect x="11.1" y="9" width="1.8" height="5.4" rx="0.9" fill="#FAFAFA" />
      <Circle cx="12" cy="16.8" r="1.1" fill="#FAFAFA" />
    </Svg>
  );
}

export function OfflineIcon({ color = '#2F353B', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 9.6C6.56 7.85 9.17 6.9 12 6.9C14.83 6.9 17.44 7.85 19.5 9.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M7.7 12.8C8.92 11.83 10.41 11.3 12 11.3C13.59 11.3 15.08 11.83 16.3 12.8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M10.9 16.4C11.25 16.16 11.62 16.04 12 16.04C12.38 16.04 12.75 16.16 13.1 16.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="19" r="1.5" fill={color} />
      <Path
        d="M4 4L20 20"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloudSyncIcon({ color = '#B0B7BF', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.7 18.1C6.65 18.1 5 16.46 5 14.43C5 12.5 6.5 10.92 8.4 10.78C8.99 8.68 10.92 7.2 13.18 7.2C15.96 7.2 18.22 9.45 18.22 12.23V12.35C19.87 12.59 21.14 14.01 21.14 15.73C21.14 17.61 19.62 19.14 17.73 19.14H8.7V18.1Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M12 17.4V12.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9.95 14.2L12 12.15L14.05 14.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10.7L12 4.8L19.5 10.7V19.2H14.5V14.6H9.5V19.2H4.5V10.7Z"
        fill={color}
      />
    </Svg>
  );
}

export function ArchiveTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.1 6.5H18.9L17.9 18.2H6.1L5.1 6.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M7.7 6.5V4.9H16.3V6.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9 10.9H15"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LogTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.8} />
      <Rect x="11" y="7.8" width="2" height="8.4" rx="1" fill={color} />
      <Rect x="7.8" y="11" width="8.4" height="2" rx="1" fill={color} />
    </Svg>
  );
}

export function HouseholdTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8.3" cy="9" r="2.2" fill={color} />
      <Circle cx="15.7" cy="9" r="2.2" fill={color} />
      <Path
        d="M4.9 17.7C5.58 15.73 6.9 14.7 8.66 14.7C10.42 14.7 11.74 15.73 12.42 17.7"
        fill={color}
      />
      <Path
        d="M11.58 17.7C12.26 15.73 13.58 14.7 15.34 14.7C17.1 14.7 18.42 15.73 19.1 17.7"
        fill={color}
      />
    </Svg>
  );
}

export function GalleryTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.5"
        y="6.1"
        width="15"
        height="11.8"
        rx="2.4"
        stroke={color}
        strokeWidth={1.8}
      />
      <Circle cx="9.1" cy="10.2" r="1.2" fill={color} />
      <Path
        d="M7.1 16.1L11.1 12.2L13.7 14.7L16.7 11.9L19.1 14.4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LedgerTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.5"
        y="6.2"
        width="15"
        height="11.6"
        rx="2.4"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M7.7 12H16.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9.5 9.5V14.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 10.4C14.05 10 13.45 9.8 12.8 9.8C11.77 9.8 10.95 10.31 10.95 11.07C10.95 11.82 11.66 12.16 12.8 12.42C13.94 12.68 14.65 13.02 14.65 13.77C14.65 14.53 13.83 15.04 12.8 15.04C12.11 15.04 11.46 14.81 11 14.36"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MedsTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.8"
        y="6.1"
        width="14.4"
        height="12.2"
        rx="2.6"
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect x="11" y="8.2" width="2" height="8" rx="1" fill={color} />
      <Rect x="8" y="11.2" width="8" height="2" rx="1" fill={color} />
    </Svg>
  );
}

export function MemoriesTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.3 5.4H14.8C16.13 5.4 17.2 6.47 17.2 7.8V18.6H7.7C6.37 18.6 5.3 17.53 5.3 16.2V5.4Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M17.2 7.8H18.2C19.52 7.8 20.6 8.88 20.6 10.2V18.6H17.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M8.4 9.4H14.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M8.4 12.6H14.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TimelineTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.8 6.3H9.5L11.7 8.4H19.2V17.7H14.5L12.3 15.6H4.8V6.3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M10.8 8.4V15.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function InsightsTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.5"
        y="5.3"
        width="15"
        height="13.4"
        rx="2.4"
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect x="7.2" y="12.3" width="2.2" height="3.7" rx="1.1" fill={color} />
      <Rect x="10.9" y="9.5" width="2.2" height="6.5" rx="1.1" fill={color} />
      <Rect x="14.6" y="7.4" width="2.2" height="8.6" rx="1.1" fill={color} />
    </Svg>
  );
}

export function ProfileTabIcon({ color = '#0A0A0A', size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.2" r="3.2" fill={color} />
      <Path
        d="M5.4 18.3C6.43 15.68 8.9 14.1 12 14.1C15.1 14.1 17.57 15.68 18.6 18.3"
        fill={color}
      />
    </Svg>
  );
}
