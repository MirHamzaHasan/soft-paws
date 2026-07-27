import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function LedgerPlusIcon({ color = '#FAFAFA', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Line
        x1="8"
        y1="3.2"
        x2="8"
        y2="12.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1="3.2"
        y1="8"
        x2="12.8"
        y2="8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FoodExpenseIcon({ color = '#517A41', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Line
        x1="5"
        y1="3"
        x2="5"
        y2="15"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line
        x1="3.2"
        y1="3"
        x2="3.2"
        y2="7.4"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Line
        x1="6.8"
        y1="3"
        x2="6.8"
        y2="7.4"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M12.7 3.2C14.25 4.64 14.35 7.08 13.05 8.58L11.8 10.03V15"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VetExpenseIcon({ color = '#9A6A06', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Rect x="3.2" y="3.2" width="11.6" height="11.6" rx="2.6" fill={color} />
      <Rect x="7.9" y="5.2" width="2.2" height="7.6" rx="1.1" fill="#FAFAFA" />
      <Rect x="5.2" y="7.9" width="7.6" height="2.2" rx="1.1" fill="#FAFAFA" />
    </Svg>
  );
}

export function ToyExpenseIcon({ color = '#3D5F8D', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="6.2" cy="11.1" r="2.8" stroke={color} strokeWidth={1.6} />
      <Path
        d="M8.3 9L12.7 4.6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M11.9 4.4H14.5V7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6.2" cy="11.1" r="0.9" fill={color} />
    </Svg>
  );
}

export function GroomingExpenseIcon({
  color = '#B5413F',
  size = 18,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="5.2" cy="5.5" r="2" stroke={color} strokeWidth={1.4} />
      <Circle cx="5.2" cy="12.5" r="2" stroke={color} strokeWidth={1.4} />
      <Path
        d="M7 7L13.8 13.8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M7 11L13.8 4.2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
