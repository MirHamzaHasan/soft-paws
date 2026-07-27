import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function PremiumCheckIcon({ color = '#5E6670', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M4.8 11.5L8.7 15.4L17.2 6.9"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PremiumLockIcon({ color = '#0A0A0A', size = 34 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5.2" y="10.2" width="13.6" height="10.8" rx="2.6" fill={color} />
      <Path
        d="M8.5 10.2V7.9C8.5 5.97 10.07 4.4 12 4.4C13.93 4.4 15.5 5.97 15.5 7.9V10.2"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx="12" cy="15.2" r="1.4" fill="#FAFAFA" />
    </Svg>
  );
}

export function RestoreArrowIcon({ color = '#0A0A0A', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M17.2 10.3A6.2 6.2 0 1 1 15.1 5.65"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M14.4 4.1H18V7.7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PremiumGlowIcon({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      <Circle cx="110" cy="110" r="90" fill="#FFF8EC" />
      <Circle cx="110" cy="110" r="66" fill="#FFFCFA" />
      <Rect
        x="72"
        y="72"
        width="76"
        height="76"
        rx="38"
        fill="#F3F5F4"
        stroke="#BBC4C8"
        strokeWidth="1.4"
      />
    </Svg>
  );
}
