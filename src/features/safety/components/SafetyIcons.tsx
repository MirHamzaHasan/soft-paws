import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function SearchFieldIcon({ color = '#B4ADA7', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="5.8" stroke={color} strokeWidth={2} />
      <Path
        d="M15.1 15.1L19.6 19.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ToxicWarningIcon({ color = '#C37E76', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4L21 19H3L12 4Z" fill={color} />
      <Rect x="11.15" y="9" width="1.7" height="5.1" rx="0.85" fill="#FAFAFA" />
      <Circle cx="12" cy="16.65" r="1.05" fill="#FAFAFA" />
    </Svg>
  );
}

export function ToxicBadgeIcon({ color = '#FAFAFA', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4L21 19H3L12 4Z" fill={color} />
      <Rect x="11.1" y="9" width="1.8" height="5.4" rx="0.9" fill="#B2261B" />
      <Circle cx="12" cy="16.75" r="1.1" fill="#B2261B" />
    </Svg>
  );
}

export function SkullIcon({ color = '#F3D9D7', size = 108 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="25" r="20" fill={color} />
      <Rect x="22" y="37" width="20" height="12" rx="3" fill={color} />
      <Circle cx="24" cy="25" r="5.5" fill="#FFFCFA" />
      <Circle cx="40" cy="25" r="5.5" fill="#FFFCFA" />
      <Path d="M32 28L38 38H26L32 28Z" fill="#FFFCFA" />
      <Rect x="24" y="44" width="4" height="10" rx="2" fill={color} />
      <Rect x="30" y="44" width="4" height="10" rx="2" fill={color} />
      <Rect x="36" y="44" width="4" height="10" rx="2" fill={color} />
    </Svg>
  );
}

export function PhoneIcon({ color = '#FFFCFA', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.97 4.72L9.23 4.14C9.84 3.98 10.48 4.27 10.77 4.83L12.29 7.75C12.54 8.24 12.43 8.84 12.02 9.21L10.47 10.62C11.38 12.55 12.95 14.12 14.88 15.03L16.29 13.48C16.66 13.07 17.26 12.96 17.75 13.21L20.67 14.73C21.23 15.02 21.52 15.66 21.36 16.27L20.78 18.53C20.59 19.3 19.9 19.84 19.11 19.8C11.58 19.43 5.07 12.92 4.7 5.39C4.66 4.6 5.2 3.91 5.97 3.72L6.97 4.72Z"
        fill={color}
      />
    </Svg>
  );
}

export function InfoIcon({ color = '#B2261B', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Rect
        x="11.15"
        y="10.2"
        width="1.7"
        height="6.2"
        rx="0.85"
        fill="#FFFCFA"
      />
      <Circle cx="12" cy="7.6" r="1.2" fill="#FFFCFA" />
    </Svg>
  );
}
