import { type ReactNode } from 'react';
import { Platform } from 'react-native';
import { Button, Paragraph, XStack } from 'tamagui';

import { barklogTypography } from '@/theme/tokens';

type BarklogButtonTone = 'primary' | 'secondary' | 'ai' | 'danger';

type BarklogButtonProps = {
  label: string;
  onPress: () => void;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  size?: 'default' | 'large';
  tone?: BarklogButtonTone;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const toneDefaults: Record<
  BarklogButtonTone,
  { backgroundColor: string; borderColor: string; labelColor: string }
> = {
  primary: {
    backgroundColor: '$buttonBackground',
    borderColor: '$buttonBorder',
    labelColor: '$buttonText',
  },
  secondary: {
    backgroundColor: '$surfaceRaised',
    borderColor: '$borderColor',
    labelColor: '$textPrimary',
  },
  ai: {
    backgroundColor: '$aiBackground',
    borderColor: '$aiBorder',
    labelColor: '$aiText',
  },
  danger: {
    backgroundColor: '$danger',
    borderColor: '$danger',
    labelColor: '$buttonText',
  },
};

export function BarklogButton({
  label,
  onPress,
  leadingIcon,
  trailingIcon,
  size = 'default',
  tone = 'primary',
  backgroundColor,
  borderColor,
  labelColor,
  disabled = false,
  accessibilityLabel,
}: BarklogButtonProps) {
  const defaults = toneDefaults[tone];
  const large = size === 'large';

  return (
    <Button
      unstyled
      accessibilityLabel={
        Platform.OS === 'web' ? undefined : (accessibilityLabel ?? label)
      }
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      minHeight={large ? '$buttonLg' : '$button'}
      px={large ? '$xl' : '$lg'}
      bg={backgroundColor ?? defaults.backgroundColor}
      bc={borderColor ?? defaults.borderColor}
      bw={1}
      br="$xl"
      ai="center"
      jc="center"
      pressStyle={disabled ? undefined : { opacity: 0.92 }}
      onPress={onPress}
    >
      <XStack ai="center" jc="center" gap="$sm">
        {leadingIcon}
        <Paragraph
          color={labelColor ?? defaults.labelColor}
          fontFamily="$body"
          fontSize={large ? barklogTypography.title : barklogTypography.body}
          lineHeight={large ? 24 : 20}
          fontWeight="500"
        >
          {label}
        </Paragraph>
        {trailingIcon}
      </XStack>
    </Button>
  );
}
