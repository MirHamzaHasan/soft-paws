import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';

import { barklogColors, barklogTypography } from '@/theme/tokens';

export type BarklogToastTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ai';

export type BarklogToastProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: BarklogToastTone;
};

const toastToneStyles: Record<
  BarklogToastTone,
  {
    accent: string;
    background: string;
    border: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  default: {
    accent: barklogColors.ink,
    background: '$surfaceRaised',
    border: '$borderColor',
    iconColor: barklogColors.ink,
    titleColor: '$textPrimary',
  },
  success: {
    accent: barklogColors.success,
    background: '$surfaceRaised',
    border: '$trainingBorder',
    iconColor: barklogColors.success,
    titleColor: '$textPrimary',
  },
  warning: {
    accent: barklogColors.warning,
    background: '$surfaceRaised',
    border: '$walkBorder',
    iconColor: barklogColors.warning,
    titleColor: '$textPrimary',
  },
  danger: {
    accent: barklogColors.danger,
    background: '$surfaceRaised',
    border: '$symptomBorder',
    iconColor: barklogColors.danger,
    titleColor: '$textPrimary',
  },
  ai: {
    accent: barklogColors.aiAccent,
    background: '$aiBackground',
    border: '$aiBorder',
    iconColor: barklogColors.aiAccent,
    titleColor: '$aiText',
  },
};

function getDefaultIcon(tone: BarklogToastTone, color: string) {
  const iconProps = { color, size: 18, strokeWidth: 2.2 };

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

export function BarklogToast({
  title,
  description,
  icon,
  tone = 'default',
}: BarklogToastProps) {
  const colors = toastToneStyles[tone];

  return (
    <XStack
      ai="flex-start"
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      gap="$sm"
      bg={colors.background}
      bc={colors.border}
      bw={1}
      br="$lg"
      overflow="hidden"
      pr="$md"
      py="$md"
    >
      <XStack alignSelf="stretch" bg={colors.accent} br="$pill" w={3} />
      <XStack ai="center" jc="center" mt={1} w={22}>
        {icon ?? getDefaultIcon(tone, colors.iconColor)}
      </XStack>
      <YStack flex={1} gap="$xs">
        <Paragraph
          color={colors.titleColor}
          fontFamily="$body"
          fontSize={barklogTypography.body}
          lineHeight={20}
          fontWeight="500"
        >
          {title}
        </Paragraph>
        {description ? (
          <Paragraph
            color="$textMuted"
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
