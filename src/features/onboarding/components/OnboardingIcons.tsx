import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function CameraIcon({ color = '#0A0A0A', size = 32 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="7" width="18" height="13" rx="2" fill={color} />
      <Path d="M8 7L9.7 4.8H14.3L16 7" fill={color} />
      <Circle cx="12" cy="13.5" r="3.2" fill="#FAFAFA" />
      <Circle cx="12" cy="13.5" r="1.6" fill={color} />
    </Svg>
  );
}

export function CameraAddIcon({ color = '#B6BBBE', size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Rect x="5" y="9" width="14" height="11" rx="1.8" fill={color} />
      <Path d="M8.7 9L10.2 7H13.8L15.3 9" fill={color} />
      <Circle cx="12" cy="14.5" r="3.2" fill="#FAFAFA" />
      <Circle cx="12" cy="14.5" r="1.7" fill={color} />
      <Circle cx="20.6" cy="8.2" r="4.4" fill="#FAFAFA" />
      <Path
        d="M20.6 6.1V10.3"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path
        d="M18.5 8.2H22.7"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchIcon({ color = '#AEA7A0', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="5.5" stroke={color} strokeWidth={2} />
      <Path
        d="M15 15L20 20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BellIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4.75C9.65 4.75 7.75 6.65 7.75 9V11.05C7.75 11.86 7.49 12.64 7 13.28L5.92 14.69C5.3 15.5 5.88 16.66 6.9 16.66H17.1C18.12 16.66 18.7 15.5 18.08 14.69L17 13.28C16.51 12.64 16.25 11.86 16.25 11.05V9C16.25 6.65 14.35 4.75 12 4.75Z"
        fill={color}
      />
      <Path
        d="M10.15 18.1C10.45 18.96 11.16 19.5 12 19.5C12.84 19.5 13.55 18.96 13.85 18.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Rect x="10.8" y="3" width="2.4" height="2.4" rx="1.2" fill={color} />
    </Svg>
  );
}

export function HealthIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="5.5" width="17" height="13" rx="2" fill={color} />
      <Path
        d="M6.5 12H9L10.7 9L13.1 15L14.9 12H17.5"
        stroke="#FAFAFA"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PawIcon({ color = '#0A0A0A', size = 40 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="7.2" cy="8" r="2.1" fill={color} />
      <Circle cx="11.2" cy="6.5" r="2.1" fill={color} />
      <Circle cx="15.2" cy="8" r="2.1" fill={color} />
      <Circle cx="18.2" cy="11.2" r="2.1" fill={color} />
      <Path
        d="M12.1 11.4C9.28 11.4 7 13.75 7 16.2C7 18.03 8.38 19.4 10.16 19.4C11.03 19.4 11.64 19.11 12.1 18.63C12.56 19.11 13.17 19.4 14.04 19.4C15.82 19.4 17.2 18.03 17.2 16.2C17.2 13.75 14.92 11.4 12.1 11.4Z"
        fill={color}
      />
    </Svg>
  );
}

export function TrialBadgeIcon({ color = '#0A0A0A', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L14.2 4.35L16.77 4.2L17.9 6.52L20.2 7.65L20.05 10.22L21.4 12.43L19.32 14L18.95 16.53L16.38 16.68L14.8 18.76L12.6 17.4L10.03 17.55L8.9 15.23L6.6 14.1L6.75 11.53L5.4 9.32L7.48 7.75L7.85 5.22L10.42 5.07L12 3Z"
        fill={color}
      />
      <Path
        d="M9.3 11.9L11.1 13.7L14.9 9.9"
        stroke="#FAFAFA"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon({ color = '#0A0A0A', size = 36 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={color} />
      <Path
        d="M7.8 12.2L10.55 14.95L16.2 9.3"
        stroke="#FAFAFA"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
