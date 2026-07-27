import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function SettingsEmailIcon({ color = '#7C858D', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="6.2" width="16" height="11.6" rx="2.2" fill={color} />
      <Path
        d="M5.2 7.4L12 12.3L18.8 7.4"
        stroke="#FFFCFA"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SettingsSubscriptionIcon({
  color = '#7C858D',
  size = 28,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4L18.2 6.25V12.3C18.2 15.35 15.57 18.14 12 19.3C8.43 18.14 5.8 15.35 5.8 12.3V6.25L12 4Z"
        fill={color}
      />
      <Circle cx="12" cy="10.5" r="2.05" fill="#FFFCFA" />
      <Path
        d="M12 8.2V12.8"
        stroke="#FFFCFA"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SettingsRulerIcon({ color = '#7C858D', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4.3" y="7.3" width="15.4" height="9.4" rx="2.2" fill={color} />
      <Path d="M8 7.3V12" stroke="#FFFCFA" strokeWidth={1.6} />
      <Path d="M11.2 7.3V10.5" stroke="#FFFCFA" strokeWidth={1.6} />
      <Path d="M14.4 7.3V12" stroke="#FFFCFA" strokeWidth={1.6} />
      <Path d="M17.6 7.3V10.5" stroke="#FFFCFA" strokeWidth={1.6} />
    </Svg>
  );
}

export function SettingsMoonIcon({ color = '#7C858D', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.9 4.8C15.06 4.45 14.14 4.25 13.17 4.25C9.22 4.25 6.02 7.45 6.02 11.4C6.02 15.35 9.22 18.55 13.17 18.55C15.82 18.55 18.13 17.11 19.36 14.98C18.74 15.17 18.08 15.28 17.39 15.28C13.67 15.28 10.66 12.27 10.66 8.55C10.66 7.11 11.11 5.78 11.88 4.68C12.05 4.45 12.01 4.13 11.79 3.96C11.58 3.8 11.28 3.82 11.09 4.01C9.57 5.55 8.62 7.66 8.62 9.99C8.62 14.69 12.43 18.5 17.13 18.5C18.13 18.5 19.08 18.33 19.97 18.02C20.39 17.87 20.54 17.34 20.27 16.99C18.94 15.27 18.15 13.11 18.15 10.76C18.15 8.52 18.88 6.45 20.1 4.78C20.36 4.43 20.17 3.94 19.73 3.86C18.43 3.63 17.12 3.85 15.9 4.8Z"
        fill={color}
      />
    </Svg>
  );
}
