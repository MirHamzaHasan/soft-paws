import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function ProfileMedicationIcon({
  color = '#5C6369',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect
        x="5"
        y="4.5"
        width="12"
        height="13"
        rx="2.4"
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect x="9.6" y="7.1" width="2.8" height="7.8" rx="1.2" fill={color} />
      <Rect x="7.1" y="9.6" width="7.8" height="2.8" rx="1.2" fill={color} />
    </Svg>
  );
}

export function ProfileVaccinationIcon({
  color = '#5C6369',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M6.2 7.2L10.2 11.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9.5 5.5L15.8 11.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M13.6 13.6L16.8 16.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Rect
        x="3.7"
        y="11.1"
        width="4.2"
        height="5.2"
        rx="1.2"
        stroke={color}
        strokeWidth={1.8}
      />
      <Rect
        x="14.2"
        y="4.7"
        width="2.7"
        height="5.3"
        rx="1"
        stroke={color}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function ProfileGroomingIcon({
  color = '#5C6369',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="7" cy="7.2" r="2.2" stroke={color} strokeWidth={1.6} />
      <Circle cx="7" cy="14.8" r="2.2" stroke={color} strokeWidth={1.6} />
      <Path
        d="M9 9.1L17.2 17.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9 13L17.2 4.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileAllergyIcon({
  color = '#5C6369',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="2.4" stroke={color} strokeWidth={1.7} />
      <Path
        d="M11 3.6V5.7"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M11 16.3V18.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M3.6 11H5.7"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M16.3 11H18.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M5.8 5.8L7.3 7.3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M14.7 14.7L16.2 16.2"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M16.2 5.8L14.7 7.3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M7.3 14.7L5.8 16.2"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileVetIcon({ color = '#5C6369', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect x="4.3" y="4.1" width="13.4" height="13.8" rx="2.4" fill={color} />
      <Rect x="9.4" y="7" width="3.2" height="8" rx="1.2" fill="#FAFAFA" />
      <Rect x="7" y="9.4" width="8" height="3.2" rx="1.2" fill="#FAFAFA" />
    </Svg>
  );
}

export function ProfileCheckStatusIcon({
  color = '#7A8288',
  size = 24,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M7.1 12.4L10.3 15.5L16.9 8.9"
        stroke="#FAFAFA"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileWarningStatusIcon({
  color = '#9C7313',
  size = 24,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.9L21.2 19.6H2.8L12 3.9Z" fill={color} />
      <Rect x="11.1" y="9" width="1.8" height="5.6" rx="0.9" fill="#FAFAFA" />
      <Circle cx="12" cy="17.4" r="1.1" fill="#FAFAFA" />
    </Svg>
  );
}

export function ProfileExportIcon({ color = '#5C6369', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 4.2V14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M7.1 8.1L11 4.2L14.9 8.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="4.3"
        y="14.2"
        width="13.4"
        height="3.9"
        rx="1.7"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function ProfileEmergencyIcon({
  color = '#A4362E',
  size = 22,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 4.4L12.6 9.4L17.6 7.8L14.1 11L17.6 14.2L12.6 12.6L11 17.6L9.4 12.6L4.4 14.2L7.9 11L4.4 7.8L9.4 9.4L11 4.4Z"
        fill={color}
      />
    </Svg>
  );
}

export function ProfileChevronIcon({
  color = '#6D747B',
  size = 20,
  direction = 'down',
}: IconProps & { direction?: 'down' | 'up' | 'right' }) {
  const pathMap = {
    down: 'M5.4 7.2L10 11.8L14.6 7.2',
    right: 'M7.4 5.4L12 10L7.4 14.6',
    up: 'M5.4 12.8L10 8.2L14.6 12.8',
  } as const;
  const path = pathMap[direction];

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d={path}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
