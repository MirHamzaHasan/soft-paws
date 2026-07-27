import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IllustrationProps = {
  size?: number;
};

export function ArchiveStackIllustration({ size = 260 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 260 260" fill="none">
      <Rect
        x="42"
        y="74"
        width="158"
        height="184"
        rx="16"
        fill="#ECEFEE"
        stroke="#C3C9CC"
        strokeWidth="2"
        transform="rotate(-6 42 74)"
      />
      <Rect
        x="74"
        y="72"
        width="158"
        height="184"
        rx="16"
        fill="#EEF1F0"
        stroke="#C3C9CC"
        strokeWidth="2"
        transform="rotate(4 74 72)"
      />
      <Rect
        x="50"
        y="64"
        width="170"
        height="204"
        rx="16"
        fill="#FFFCFA"
        stroke="#B9C0C4"
        strokeWidth="2"
      />
      <Rect
        x="112"
        y="44"
        width="64"
        height="42"
        rx="16"
        fill="#E4EBEA"
        stroke="#B9C0C4"
        strokeWidth="2"
      />
      <Rect x="126" y="56" width="36" height="12" rx="6" fill="#C6CDCF" />
      <Rect x="95" y="130" width="80" height="2" rx="1" fill="#D9DFE1" />
      <Rect x="86" y="154" width="98" height="2" rx="1" fill="#D9DFE1" />
      <Rect x="84" y="178" width="102" height="2" rx="1" fill="#D9DFE1" />
      <Path
        d="M128.5 195.5C135.3 188.1 146.7 188.1 153.5 195.5L162.7 205.5C169.7 213.1 164.3 225.5 153.9 225.5H128.1C117.7 225.5 112.3 213.1 119.3 205.5L128.5 195.5Z"
        fill="#F3F4F3"
      />
      <Circle cx="124" cy="192" r="7" fill="#E5E9E8" />
      <Circle cx="138" cy="182" r="7" fill="#E5E9E8" />
      <Circle cx="152" cy="182" r="7" fill="#E5E9E8" />
      <Circle cx="166" cy="192" r="7" fill="#E5E9E8" />
    </Svg>
  );
}

export function ErrorReceiptIllustration({ size = 230 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 230 230" fill="none">
      <Path
        d="M69 55H162V171C162 178.18 156.18 184 149 184H82C74.82 184 69 178.18 69 171V55Z"
        fill="#EFF2F3"
      />
      <Path
        d="M69 55L80 65L91 55L102 65L113 55L124 65L135 55L146 65L157 55L168 65V160C168 173.25 157.25 184 144 184H85C71.75 184 61 173.25 61 160V97H69V55Z"
        fill="#E7EAEC"
      />
      <Circle
        cx="115"
        cy="122"
        r="46"
        fill="#FFFCFA"
        stroke="#DADFE2"
        strokeWidth="2"
      />
      <Path d="M115 91L137 129H93L115 91Z" fill="#2E3538" />
      <Rect x="112" y="104" width="6" height="18" rx="3" fill="#FFFCFA" />
      <Circle cx="115" cy="126.5" r="3" fill="#FFFCFA" />
      <Rect x="132" y="93" width="18" height="18" rx="9" fill="#DCE2E6" />
      <Rect x="141" y="112" width="9" height="52" rx="4.5" fill="#DCE2E6" />
    </Svg>
  );
}

export function RefreshArrowIcon({ size = 22 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M17.8 10.4A6.8 6.8 0 1 1 15.5 5.3"
        stroke="#FFFCFA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M14.8 3.7H18.5V7.4"
        stroke="#FFFCFA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
