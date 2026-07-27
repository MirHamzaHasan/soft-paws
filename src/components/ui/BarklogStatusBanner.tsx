import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { Paragraph, XStack, YStack } from 'tamagui';

import { barklogColors, barklogTypography } from '@/theme/tokens';

export type BarklogStatusBannerTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ai';

export type BarklogStatusBannerProps = {
  description?: string;
  title: string;
  tone: BarklogStatusBannerTone;
};

const bannerToneStyles: Record<
  BarklogStatusBannerTone,
  {
    accent: string;
    background: string;
    border: string;
    iconColor: string;
    textColor: string;
  }
> = {
  default: {
    accent: barklogColors.ink,
    background: '$surface',
    border: '$borderColor',
    iconColor: barklogColors.ink,
    textColor: '$textPrimary',
  },
  success: {
    accent: barklogColors.success,
    background: '$trainingBackground',
    border: '$trainingBorder',
    iconColor: barklogColors.success,
    textColor: '$trainingText',
  },
  warning: {
    accent: barklogColors.warning,
    background: '$walkBackground',
    border: '$walkBorder',
    iconColor: barklogColors.warning,
    textColor: '$walkText',
  },
  danger: {
    accent: barklogColors.danger,
    background: '$symptomBackground',
    border: '$symptomBorder',
    iconColor: barklogColors.danger,
    textColor: '$symptomText',
  },
  ai: {
    accent: barklogColors.aiAccent,
    background: '$aiBackground',
    border: '$aiBorder',
    iconColor: barklogColors.aiAccent,
    textColor: '$aiText',
  },
};

function getBannerIcon(tone: BarklogStatusBannerTone, color: string) {
  const iconProps = { color, size: 19, strokeWidth: 2.2 };

  switch (tone) {
    case 'success':
      return <CheckCircle2 {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'danger':
      return <AlertCircle {...iconProps} />;
    case 'ai':
      return <Sparkles {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
}

export function BarklogStatusBanner({
  description,
  title,
  tone,
}: BarklogStatusBannerProps) {
  const colors = bannerToneStyles[tone];

  return (
    <XStack
      ai="flex-start"
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      bg={colors.background}
      bc={colors.border}
      br="$lg"
      bw={1}
      gap="$sm"
      overflow="hidden"
      pr="$md"
      py="$md"
    >
      <XStack alignSelf="stretch" bg={colors.accent} br="$pill" w={3} />
      <XStack ai="center" jc="center" mt={1} w={22}>
        {getBannerIcon(tone, colors.iconColor)}
      </XStack>
      <YStack flex={1} gap="$xs">
        <Paragraph
          color={colors.textColor}
          fontFamily="$body"
          fontSize={barklogTypography.body}
          fontWeight="500"
          lineHeight={20}
        >
          {title}
        </Paragraph>
        {description ? (
          <Paragraph
            color={colors.textColor}
            fontFamily="$body"
            fontSize={barklogTypography.caption}
            lineHeight={16}
          >
            {description}
          </Paragraph>
        ) : null}
      </YStack>
    </XStack>
  );
}
