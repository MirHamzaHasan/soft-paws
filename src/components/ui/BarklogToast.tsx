import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';

import { barklogColors } from '@/theme/tokens';

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
    background: string;
    border: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  default: {
    background: '$surfaceRaised',
    border: '$borderColor',
    iconColor: barklogColors.ink,
    titleColor: '$textPrimary',
  },
  success: {
    background: '$surfaceRaised',
    border: '$trainingBorder',
    iconColor: barklogColors.success,
    titleColor: '$textPrimary',
  },
  warning: {
    background: '$surfaceRaised',
    border: '$walkBorder',
    iconColor: barklogColors.warning,
    titleColor: '$textPrimary',
  },
  danger: {
    background: '$surfaceRaised',
    border: '$symptomBorder',
    iconColor: barklogColors.danger,
    titleColor: '$textPrimary',
  },
  ai: {
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
      role={tone === 'danger' ? 'alert' : undefined}
      gap="$sm"
      bg={colors.background}
      bc={colors.border}
      bw={1}
      br="$xl"
      px="$md"
      py={10}
    >
      <XStack ai="center" jc="center" bg="$surface" br="$pill" h={32} w={32}>
        {icon ?? getDefaultIcon(tone, colors.iconColor)}
      </XStack>
      <YStack flex={1} gap={2} py={1}>
        <Paragraph
          color={colors.titleColor}
          fontFamily="$body"
          fontSize={15}
          lineHeight={20}
          fontWeight="500"
        >
          {title}
        </Paragraph>
        {description ? (
          <Paragraph
            color="$textMuted"
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
