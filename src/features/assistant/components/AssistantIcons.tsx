import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function AssistantHistoryIcon({
  color = '#2F353B',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4.4 8.8A4.6 4.6 0 1 1 5.95 12.25"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M9 5.3V8.9L11.55 10.15"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.9 5.9V8.8H5.8"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AssistantDropletIcon({
  color = '#6A6F75',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.4C9 2.4 4.8 7.15 4.8 10.05C4.8 12.37 6.68 14.25 9 14.25C11.32 14.25 13.2 12.37 13.2 10.05C13.2 7.15 9 2.4 9 2.4Z"
        fill={color}
      />
    </Svg>
  );
}

export function AssistantWeightIcon({
  color = '#6A6F75',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Rect
        x="3.2"
        y="3.7"
        width="11.6"
        height="10.6"
        rx="2.4"
        stroke={color}
        strokeWidth={1.6}
      />
      <Circle cx="9" cy="7.9" r="1.4" stroke={color} strokeWidth={1.4} />
      <Path
        d="M9 7.9L10.9 6.1"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AssistantSendIcon({ color = '#FAFAFA', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M4 17.7L18.2 11L4 4.3L5.4 9.1L12.1 11L5.4 12.9L4 17.7Z"
        fill={color}
      />
    </Svg>
  );
}

export function AssistantAlertIcon({
  color = '#0A0A0A',
  size = 26,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M13 2.7L23.1 8.5V17.9L13 23.7L2.9 17.9V8.5L13 2.7Z"
        fill={color}
      />
      <Rect
        x="12.05"
        y="7.4"
        width="1.9"
        height="8.1"
        rx="0.95"
        fill="#FAFAFA"
      />
      <Circle cx="13" cy="18.4" r="1.1" fill="#FAFAFA" />
    </Svg>
  );
}
