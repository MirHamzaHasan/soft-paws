import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

type IllustrationProps = {
  size?: number;
};

export function EmergencyTriangleIllustration({
  color = '#B2433E',
  size = 126,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 126 126" fill="none">
      <Path d="M63 15L116 107H10L63 15Z" fill={color} />
      <Rect x="58" y="42" width="10" height="34" rx="5" fill="#FFFCFA" />
      <Circle cx="63" cy="89" r="6" fill="#FFFCFA" />
    </Svg>
  );
}

export function CallEmergencyIcon({ color = '#FFFCFA', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M5.5 3.5L7.25 3.05C7.72 2.93 8.21 3.16 8.43 3.58L9.6 5.84C9.8 6.22 9.71 6.69 9.39 6.98L8.19 8.08C8.9 9.57 10.12 10.79 11.61 11.5L12.71 10.3C13 9.98 13.47 9.89 13.85 10.09L16.11 11.26C16.53 11.48 16.76 11.97 16.64 12.44L16.19 14.19C16.04 14.78 15.51 15.2 14.9 15.17C9.08 14.88 4.12 9.92 3.83 4.1C3.8 3.49 4.22 2.96 4.81 2.81L5.5 3.5Z"
        fill={color}
      />
    </Svg>
  );
}

export function DirectionsIcon({ color = '#2F353B', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 2.8L15.2 9L9 15.2L2.8 9L9 2.8Z"
        stroke={color}
        strokeWidth={1.6}
      />
      <Path
        d="M9 5.7V10.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M6.9 8.6L9 10.7L11.1 8.6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MapPreviewIllustration({ size = 360 }: IllustrationProps) {
  return (
    <Svg
      width={size}
      height={Math.round(size * 0.48)}
      viewBox="0 0 360 172"
      fill="none"
    >
      <Rect width="360" height="172" fill="#E5D7B8" />
      <Path
        d="M0 30L48 6L97 28L152 0L205 19L262 4L320 25L360 8"
        stroke="#F5F2EA"
        strokeWidth="9"
      />
      <Path
        d="M18 90L70 40L118 58L177 20L234 54L294 35L360 69"
        stroke="#F2EEE5"
        strokeWidth="9"
      />
      <Path
        d="M6 150L55 112L104 130L158 94L219 138L282 116L346 144"
        stroke="#C7D7BF"
        strokeWidth="11"
      />
      <Path
        d="M236 34C236 18.54 223.46 6 208 6C192.54 6 180 18.54 180 34C180 58 208 87 208 87C208 87 236 58 236 34Z"
        fill="#D43125"
      />
      <Circle cx="208" cy="34" r="12" fill="#F9D9D1" />
      <Ellipse cx="208" cy="90" rx="15" ry="7" fill="#D43125" opacity="0.35" />
      <Ellipse cx="208" cy="96" rx="8" ry="4" fill="#D43125" opacity="0.45" />
    </Svg>
  );
}

export function MedicalBagIcon({ color = '#B2433E', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="7" width="16" height="13" rx="3" fill={color} />
      <Path
        d="M9 7V5.8C9 4.81 9.81 4 10.8 4H13.2C14.19 4 15 4.81 15 5.8V7"
        stroke={color}
        strokeWidth={1.6}
      />
      <Rect x="11" y="10" width="2" height="6" rx="1" fill="#FFFCFA" />
      <Rect x="9" y="12" width="6" height="2" rx="1" fill="#FFFCFA" />
    </Svg>
  );
}

export function BloodDropIcon({ color = '#B2433E', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.4C12 3.4 6.6 9.5 6.6 13.22C6.6 16.2 9.02 18.62 12 18.62C14.98 18.62 17.4 16.2 17.4 13.22C17.4 9.5 12 3.4 12 3.4Z"
        fill={color}
      />
      <Rect x="9" y="11.1" width="6" height="2" rx="1" fill="#FFFCFA" />
    </Svg>
  );
}

export function CprIcon({ color = '#B2433E', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.8" y="8" width="16.4" height="8.8" rx="2.2" fill={color} />
      <Path
        d="M6 12H9L10.4 9.8L12.4 14.4L14 12H18"
        stroke="#FFFCFA"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HeatIcon({ color = '#B2433E', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="10" y="3.8" width="4" height="10.8" rx="2" fill={color} />
      <Circle cx="12" cy="17.2" r="4.2" fill={color} />
    </Svg>
  );
}

export function InfoOutlineIcon({ color = '#B2433E', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" stroke={color} />
      <Rect x="7.2" y="6.2" width="1.6" height="4.7" rx="0.8" fill={color} />
      <Circle cx="8" cy="4.35" r="0.95" fill={color} />
    </Svg>
  );
}

export function ChokingMouthIllustration({ size = 300 }: IllustrationProps) {
  return (
    <Svg
      width={size}
      height={Math.round(size * 0.62)}
      viewBox="0 0 300 186"
      fill="none"
    >
      <Rect
        x="1"
        y="1"
        width="298"
        height="184"
        rx="16"
        fill="#FFFCFA"
        stroke="#D7D3CF"
      />
      <Path
        d="M28 126C62 112 97 95 116 70C134 46 170 38 218 52"
        stroke="#B8BFC4"
        strokeWidth="2"
      />
      <Path d="M58 109C90 98 109 87 132 62" stroke="#B8BFC4" strokeWidth="2" />
      <Path d="M112 73C145 67 173 71 209 88" stroke="#B8BFC4" strokeWidth="2" />
      <Path d="M169 93C183 77 195 71 220 67" stroke="#B8BFC4" strokeWidth="2" />
      <Path
        d="M106 76C126 83 145 104 159 136"
        stroke="#C9CFD3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M162 118C183 122 202 130 232 149"
        stroke="#C9CFD3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M90 104C104 118 116 131 129 154"
        stroke="#D0D5D9"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BackBlowIllustration({ size = 300 }: IllustrationProps) {
  return (
    <Svg
      width={size}
      height={Math.round(size * 0.62)}
      viewBox="0 0 300 186"
      fill="none"
    >
      <Rect
        x="1"
        y="1"
        width="298"
        height="184"
        rx="16"
        fill="#FFFCFA"
        stroke="#D7D3CF"
      />
      <Path
        d="M96 132C94 101 104 69 131 56C145 49 163 49 180 54C196 58 211 70 219 85"
        stroke="#AAB2B8"
        strokeWidth="2"
      />
      <Path
        d="M118 151C141 143 156 126 163 111H188"
        stroke="#AAB2B8"
        strokeWidth="2"
      />
      <Path
        d="M178 68L230 20"
        stroke="#666C73"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <Path
        d="M169 76L194 51"
        stroke="#666C73"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path d="M111 92C115 88 120 86 126 86" stroke="#AAB2B8" strokeWidth="2" />
      <Path d="M148 84C151 85 154 87 156 90" stroke="#AAB2B8" strokeWidth="2" />
    </Svg>
  );
}

export function HeimlichIllustration({ size = 300 }: IllustrationProps) {
  return (
    <Svg
      width={size}
      height={Math.round(size * 0.62)}
      viewBox="0 0 300 186"
      fill="none"
    >
      <Rect
        x="1"
        y="1"
        width="298"
        height="184"
        rx="16"
        fill="#FFFCFA"
        stroke="#D7D3CF"
      />
      <Path
        d="M38 112C81 109 113 116 147 128"
        stroke="#C7CDD1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M141 128C174 91 209 70 261 55"
        stroke="#D8DDE0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M96 102C114 109 129 120 143 136"
        stroke="#AEB6BC"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M136 125C151 112 165 107 184 103"
        stroke="#AEB6BC"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M144 138C161 127 174 120 194 114"
        stroke="#8B9198"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <Path
        d="M180 100C205 97 226 104 248 126"
        stroke="#D5DADF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
