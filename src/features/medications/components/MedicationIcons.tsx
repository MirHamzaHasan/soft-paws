import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function MedicationChevronDownIcon({
  color = '#7E848B',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4.5 6.8L9 11.3L13.5 6.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MedicationForkIcon({
  color = '#5A626A',
  size = 20,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Line
        x1="5"
        y1="2.5"
        x2="5"
        y2="17"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Line
        x1="3.2"
        y1="2.5"
        x2="3.2"
        y2="7.2"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Line
        x1="6.8"
        y1="2.5"
        x2="6.8"
        y2="7.2"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M13.8 2.9C15.44 4.42 15.55 6.98 14.17 8.54L12.8 10.1V17"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MedicationCalendarIcon({
  color = '#5A626A',
  size = 20,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x="3"
        y="4.5"
        width="14"
        height="12"
        rx="2.2"
        stroke={color}
        strokeWidth={1.6}
      />
      <Line
        x1="6.2"
        y1="2.8"
        x2="6.2"
        y2="6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line
        x1="13.8"
        y1="2.8"
        x2="13.8"
        y2="6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line x1="4" y1="7.8" x2="16" y2="7.8" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function MedicationClockIcon({
  color = '#5A626A',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="6.4" stroke={color} strokeWidth={1.6} />
      <Path
        d="M9 5.8V9.1L11.2 10.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
