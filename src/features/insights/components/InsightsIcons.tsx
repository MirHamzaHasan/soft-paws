import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

type SizeOnlyIconProps = {
  size?: number;
};

export function SparklesIcon({ color = '#5A34C3', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.8 3.8L7.95 7.05L11.2 8.2L7.95 9.35L6.8 12.6L5.65 9.35L2.4 8.2L5.65 7.05L6.8 3.8Z"
        fill={color}
      />
      <Path
        d="M16.8 8.4L17.6 10.7L19.9 11.5L17.6 12.3L16.8 14.6L16 12.3L13.7 11.5L16 10.7L16.8 8.4Z"
        fill={color}
      />
    </Svg>
  );
}

export function MealsIcon({ size = 18 }: SizeOnlyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#F6FBF5" stroke="#D9EBCF" />
      <Path
        d="M8 8.2C8 7.54 8.54 7 9.2 7C9.86 7 10.4 7.54 10.4 8.2V10.8H11.8V8.2C11.8 7.54 12.34 7 13 7C13.66 7 14.2 7.54 14.2 8.2V10.8C14.2 12.1 13.26 13.17 12 13.38V17"
        stroke="#E6C99B"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WalksIcon({ size = 18 }: SizeOnlyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#FFF9EA" stroke="#F4DA85" />
      <Circle cx="8.2" cy="9" r="1.8" fill="#1B73D1" />
      <Circle cx="11.7" cy="7.5" r="1.8" fill="#1B73D1" />
      <Circle cx="15.2" cy="9" r="1.8" fill="#1B73D1" />
      <Path
        d="M11.7 10.6C9.5 10.6 7.7 12.42 7.7 14.3C7.7 15.68 8.75 16.7 10.04 16.7C10.68 16.7 11.15 16.49 11.7 16.05C12.25 16.49 12.72 16.7 13.36 16.7C14.65 16.7 15.7 15.68 15.7 14.3C15.7 12.42 13.9 10.6 11.7 10.6Z"
        fill="#1B73D1"
      />
    </Svg>
  );
}

export function PoopsIcon({ size = 18 }: SizeOnlyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#FFF5F3" stroke="#FFD6D0" />
      <Path
        d="M8.7 14.8C8.7 12.7 10.18 11.4 12 11.4C13.82 11.4 15.3 12.7 15.3 14.8C15.3 16.53 13.96 17.8 12 17.8C10.04 17.8 8.7 16.53 8.7 14.8Z"
        fill="#9D3123"
      />
      <Path
        d="M10.1 11.5C10.1 10.3 10.97 9.44 12 9.44C13.03 9.44 13.9 10.3 13.9 11.5"
        fill="#B46C57"
      />
      <Circle cx="10.95" cy="14.25" r="0.6" fill="#FAFAFA" />
      <Circle cx="13.05" cy="14.25" r="0.6" fill="#FAFAFA" />
      <Path
        d="M10.7 15.8C11.13 16.1 11.53 16.24 12 16.24C12.47 16.24 12.87 16.1 13.3 15.8"
        stroke="#FAFAFA"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MedsIcon({ size = 18 }: SizeOnlyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#FFF5FB" stroke="#E9D7FF" />
      <Path
        d="M9.4 8.3C10.55 7.15 12.42 7.15 13.57 8.3L15.7 10.43C16.85 11.58 16.85 13.45 15.7 14.6L14.7 15.6L8.4 9.3L9.4 8.3Z"
        fill="#B96E2B"
      />
      <Path
        d="M8.4 9.3L14.7 15.6L13.7 16.6C12.55 17.75 10.68 17.75 9.53 16.6L7.4 14.47C6.25 13.32 6.25 11.45 7.4 10.3L8.4 9.3Z"
        fill="#F5D445"
      />
      <Path
        d="M10.55 7.15L16.85 13.45"
        stroke="#FAFAFA"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ExportIcon({ color = '#FAFAFA', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5.5V14.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8.6 11.4L12 14.8L15.4 11.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5 18.3H18.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ShareIcon({ color = '#0A0A0A', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5.5" r="2.2" fill={color} />
      <Circle cx="6.2" cy="12.1" r="2.2" fill={color} />
      <Circle cx="18" cy="18.5" r="2.2" fill={color} />
      <Path
        d="M8.1 11.1L16.1 6.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M8.1 13.1L16.1 17.4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
