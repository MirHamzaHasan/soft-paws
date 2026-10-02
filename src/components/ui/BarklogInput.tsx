import { type ReactNode } from 'react';
import { Input, Paragraph, XStack, YStack } from 'tamagui';

import { barklogTypography } from '@/theme/tokens';

type BarklogInputProps = {
  label?: string;
  hint?: string;
  value: string;
  placeholder?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  secureTextEntry?: boolean;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'number-pad'
    | 'decimal-pad'
    | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  autoComplete?: 'email' | 'password';
};

export function BarklogInput({
  label,
  hint,
  value,
  placeholder,
  leading,
  trailing,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  onChangeText,
  accessibilityLabel,
  autoComplete,
}: BarklogInputProps) {
  return (
    <YStack gap="$xs">
      {label ? (
        <Paragraph
          color="$textMuted"
          fontFamily="$body"
          fontSize={barklogTypography.overline}
          lineHeight={16}
          fontWeight="500"
          letterSpacing={1.2}
          textTransform="uppercase"
        >
          {label}
        </Paragraph>
      ) : null}

      <XStack
        ai="center"
        gap="$sm"
        minHeight="$input"
        px="$md"
        bg="$inputBackground"
        bc="$inputBorder"
        bw={1}
        br="$lg"
      >
        {leading}
        <Input
          unstyled
          accessibilityLabel={accessibilityLabel ?? label}
          autoComplete={autoComplete}
          flex={1}
          color="$inputText"
          fontFamily="$body"
          fontSize={barklogTypography.body}
          placeholder={placeholder}
          placeholderTextColor="$textFaint"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          value={value}
          onChangeText={onChangeText}
        />
        {trailing}
      </XStack>

      {hint ? (
        <Paragraph
          color="$textMuted"
          fontFamily="$body"
          fontSize={barklogTypography.caption}
          lineHeight={16}
        >
          {hint}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
