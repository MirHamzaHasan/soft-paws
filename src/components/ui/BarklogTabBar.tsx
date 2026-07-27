import { type ReactNode } from 'react';
import { Button, Paragraph, XStack, YStack } from 'tamagui';

import { barklogTypography } from '@/theme/tokens';

export type BarklogTabBarItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onPress?: () => void;
};

type BarklogTabBarProps = {
  items: BarklogTabBarItem[];
  variant?: 'main' | 'compact';
};

export function BarklogTabBar({ items, variant = 'main' }: BarklogTabBarProps) {
  const compact = variant === 'compact';

  return (
    <YStack bg="$background" bc="$borderColor" borderTopWidth={1}>
      <XStack
        w="100%"
        maxWidth={760}
        alignSelf="center"
        px="$sm"
        pt="$sm"
        pb="$xs"
        justifyContent="space-between"
      >
        {items.map((item) => {
          const color = item.active ? '$tabActive' : '$tabText';

          return (
            <Button
              key={item.key}
              unstyled
              flex={1}
              minHeight={60}
              ai="center"
              jc="center"
              gap="$xs"
              br="$xl"
              pressStyle={{ opacity: 0.92 }}
              onPress={item.onPress}
            >
              {item.icon}
              <Paragraph
                color={color}
                fontFamily="$body"
                fontSize={
                  compact
                    ? barklogTypography.caption
                    : barklogTypography.caption + 1
                }
                lineHeight={compact ? 16 : 18}
                fontWeight="400"
                letterSpacing={compact ? 0.8 : 0.2}
                textTransform={compact ? 'uppercase' : 'none'}
              >
                {item.label}
              </Paragraph>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
