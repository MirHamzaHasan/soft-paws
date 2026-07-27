import Svg, { Line, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function ArrowLeftIcon({ color = '#0A0A0A', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19L5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({ color = '#FAFAFA', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12H19M12 5L19 12L12 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeOffIcon({ color = '#A79F98', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.7 5.1C11.13 5.03 11.56 5 12 5c5.23 0 8.48 4.18 9.29 5.35.1.14.15.3.15.47s-.05.33-.15.47c-.43.62-1.56 2.12-3.3 3.38M6.61 6.63C4.53 8.03 3.18 9.87 2.71 10.55a.78.78 0 0 0 0 .9C3.52 12.62 6.77 16.8 12 16.8c1.36 0 2.59-.28 3.69-.72M9.88 9.88a3 3 0 0 0 4.24 4.24"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="4.5"
        y1="4.5"
        x2="19.5"
        y2="19.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MailIcon({ color = '#A79F98', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke={color}
        strokeWidth={1.7}
      />
      <Path
        d="M5.75 8L12 12.5L18.25 8"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockIcon({ color = '#A79F98', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="6.5"
        y="10.5"
        width="11"
        height="9"
        rx="2"
        stroke={color}
        strokeWidth={1.7}
      />
      <Path
        d="M8.5 10V8.5C8.5 6.57 10.07 5 12 5C13.93 5 15.5 6.57 15.5 8.5V10"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="13.25"
        x2="12"
        y2="15.75"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseIcon({ color = '#232A2E', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5.5"
        y1="5.5"
        x2="18.5"
        y2="18.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="18.5"
        y1="5.5"
        x2="5.5"
        y2="18.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
