import Svg, { Line, Path, Polyline, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function CalendarEditIcon({ color = '#A7A099', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="5.5"
        width="12"
        height="13"
        rx="2"
        stroke={color}
        strokeWidth={1.8}
      />
      <Line
        x1="7.5"
        y1="3.8"
        x2="7.5"
        y2="7.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="12.5"
        y1="3.8"
        x2="12.5"
        y2="7.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="4.9"
        y1="9.3"
        x2="15.1"
        y2="9.3"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M15.7 17.35L19.9 13.15C20.43 12.62 21.29 12.62 21.82 13.15C22.34 13.67 22.34 14.53 21.82 15.06L17.62 19.26L15 19.95L15.7 17.35Z"
        fill={color}
      />
    </Svg>
  );
}

export function AddPhotoIcon({ color = '#111111', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="7" width="15" height="11" rx="2" fill={color} />
      <Path d="M8.2 7L9.5 5.3H13.5L14.8 7" fill={color} />
      <Rect x="17.6" y="4.6" width="2.2" height="6" rx="1.1" fill={color} />
      <Rect x="15.7" y="6.5" width="6" height="2.2" rx="1.1" fill={color} />
      <Path
        d="M11.5 10.1C13.16 10.1 14.5 11.44 14.5 13.1C14.5 14.76 13.16 16.1 11.5 16.1C9.84 16.1 8.5 14.76 8.5 13.1C8.5 11.44 9.84 10.1 11.5 10.1Z"
        fill="#FAFAFA"
      />
      <Path
        d="M11.5 11.45C12.41 11.45 13.15 12.19 13.15 13.1C13.15 14.01 12.41 14.75 11.5 14.75C10.59 14.75 9.85 14.01 9.85 13.1C9.85 12.19 10.59 11.45 11.5 11.45Z"
        fill={color}
      />
    </Svg>
  );
}

export function PlusSquareIcon({ color = '#5E34C6', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect
        x="2.2"
        y="2.2"
        width="11.6"
        height="11.6"
        rx="2.4"
        stroke={color}
        strokeWidth={1.6}
      />
      <Line
        x1="8"
        y1="4.8"
        x2="8"
        y2="11.2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line
        x1="4.8"
        y1="8"
        x2="11.2"
        y2="8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronDoubleDownIcon({
  color = '#767B81',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="6 8 12 14 18 8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="6 12 12 18 18 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ color = '#FAFAFA', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="5 12.5 10 17 19 7.5"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LooseLinesIcon({ color = '#0A0A0A', size = 34 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <Path
        d="M6.5 9.8C9 8.3 11.4 8.3 13.9 9.8C16.3 11.2 18.7 11.2 21.1 9.8C23.6 8.3 26 8.3 28.5 9.8"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 16.9C9 15.4 11.4 15.4 13.9 16.9C16.3 18.3 18.7 18.3 21.1 16.9C23.6 15.4 26 15.4 28.5 16.9"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
      />
      <Path
        d="M6.5 24C9 22.5 11.4 22.5 13.9 24C16.3 25.4 18.7 25.4 21.1 24C23.6 22.5 26 22.5 28.5 24"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SolidDotIcon({ color = '#0A0A0A', size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Rect width={size} height={size} rx={size / 2} fill={color} />
    </Svg>
  );
}
