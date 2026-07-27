import { type ReactNode } from 'react';

import { BarklogButton } from './BarklogButton';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  size?: 'default' | 'large';
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  leadingIcon,
  trailingIcon,
  size = 'default',
  backgroundColor = '#0A0A0A',
  borderColor = 'transparent',
  labelColor = '#FAFAFA',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <BarklogButton
      label={label}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      size={size}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      labelColor={labelColor}
      disabled={disabled}
      onPress={onPress}
    />
  );
}
