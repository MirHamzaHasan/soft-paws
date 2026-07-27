import { styled, YStack } from 'tamagui';

export const BarklogCard = styled(YStack, {
  name: 'BarklogCard',
  backgroundColor: '$surface',
  borderColor: '$borderColor',
  borderRadius: '$lg',
  borderWidth: 1,
  padding: '$lg',
  gap: '$md',

  variants: {
    tone: {
      default: {},
      raised: {
        backgroundColor: '$surfaceRaised',
      },
      ai: {
        backgroundColor: '$aiBackground',
        borderColor: '$aiBorder',
      },
      success: {
        backgroundColor: '$surfaceRaised',
        borderColor: '$success',
      },
      warning: {
        backgroundColor: '$surfaceRaised',
        borderColor: '$warning',
      },
      danger: {
        backgroundColor: '$surfaceRaised',
        borderColor: '$danger',
      },
    },
    chromeless: {
      true: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
    },
  } as const,

  defaultVariants: {
    tone: 'default',
  },
});
