import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function GastroIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.2 4.7C9.2 4.7 8.9 7.4 10.7 8.8C12 9.82 12.4 11.05 12.4 12.5V18.6H7.7C6.26 18.6 5.1 17.44 5.1 16V12.6C5.1 10.37 6.52 8.4 8.63 7.7L9.2 4.7Z"
        fill={color}
      />
      <Path
        d="M13.1 6.2C15.7 6.58 17.7 8.81 17.7 11.5V18.6H13.1V6.2Z"
        fill={color}
      />
    </Svg>
  );
}

export function MobilityIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.2 15.7L9.7 11.2L12.5 14L18.8 7.7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.8 7.7H18.8V11.7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NeuroIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 6.1C5.68 6.1 4.45 7.33 4.45 8.85C4.45 10.37 5.68 11.6 7.2 11.6V6.1Z"
        fill={color}
      />
      <Path
        d="M16.8 6.1C18.32 6.1 19.55 7.33 19.55 8.85C19.55 10.37 18.32 11.6 16.8 11.6V6.1Z"
        fill={color}
      />
      <Path
        d="M7.2 12.4C5.68 12.4 4.45 13.63 4.45 15.15C4.45 16.67 5.68 17.9 7.2 17.9V12.4Z"
        fill={color}
      />
      <Path
        d="M16.8 12.4C18.32 12.4 19.55 13.63 19.55 15.15C19.55 16.67 18.32 17.9 16.8 17.9V12.4Z"
        fill={color}
      />
      <Path d="M9.4 5.1H14.6V18.9H9.4V5.1Z" fill={color} />
    </Svg>
  );
}

export function EyeEarIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.9 12C5.7 8.8 8.47 7.2 12 7.2C15.53 7.2 18.3 8.8 20.1 12C18.3 15.2 15.53 16.8 12 16.8C8.47 16.8 5.7 15.2 3.9 12Z"
        fill={color}
      />
      <Circle cx="12" cy="12" r="2.2" fill="#FFFCFA" />
    </Svg>
  );
}
