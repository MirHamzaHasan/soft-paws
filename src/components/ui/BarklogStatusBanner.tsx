import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { Paragraph, XStack, YStack } from 'tamagui';

import { barklogColors } from '@/theme/tokens';

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
    background: string;
    border: string;
    iconColor: string;
    textColor: string;
  }
> = {
  default: {
    background: '$surface',
    border: '$borderColor',
    iconColor: barklogColors.ink,
    textColor: '$textPrimary',
  },
  success: {
    background: '$trainingBackground',
    border: '$trainingBorder',
    iconColor: barklogColors.success,
    textColor: '$trainingText',
  },
  warning: {
    background: '$walkBackground',
    border: '$walkBorder',
    iconColor: barklogColors.warning,
    textColor: '$walkText',
  },
  danger: {
    background: '$symptomBackground',
    border: '$symptomBorder',
    iconColor: barklogColors.danger,
    textColor: '$symptomText',
  },
  ai: {
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
      role={tone === 'danger' ? 'alert' : undefined}
      bg={colors.background}
      bc={colors.border}
      br="$xl"
      bw={1}
      gap="$sm"
      px="$md"
      py={10}
    >
      <XStack
        ai="center"
        jc="center"
        bg="$surfaceRaised"
        br="$pill"
        h={32}
        w={32}
      >
        {getBannerIcon(tone, colors.iconColor)}
      </XStack>
      <YStack flex={1} gap={2} py={1}>
        <Paragraph
          color={colors.textColor}
          fontFamily="$body"
          fontSize={15}
          fontWeight="500"
          lineHeight={20}
        >
          {title}
        </Paragraph>
        {description ? (
          <Paragraph
            color={colors.textColor}
            fontFamily="$body"
            fontSize={13}
            lineHeight={18}
          >
            {description}
          </Paragraph>
        ) : null}
      </YStack>
    </XStack>
  );
}
