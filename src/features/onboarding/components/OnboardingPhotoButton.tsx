import { type ReactNode } from 'react';

import { OnboardingCirclePlate } from './OnboardingCirclePlate';
import { CameraIcon } from './OnboardingIcons';

type OnboardingPhotoButtonProps = {
  size?: number;
  icon?: ReactNode;
  alignSelf?: 'center' | 'flex-start';
  accessibilityLabel?: string;
  onPress?: () => void;
};

export function OnboardingPhotoButton({
  size,
  icon,
  alignSelf,
  accessibilityLabel = 'Add dog photo',
  onPress = () => {},
}: OnboardingPhotoButtonProps) {
  return (
    <OnboardingCirclePlate
      size={size}
      alignSelf={alignSelf}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      {icon ?? <CameraIcon />}
    </OnboardingCirclePlate>
  );
}
