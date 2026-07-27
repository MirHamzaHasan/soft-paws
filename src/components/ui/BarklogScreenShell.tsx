import { Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, ScrollView, YStack } from 'tamagui';

import { barklogTypography } from '@/theme/tokens';

type BarklogScreenShellProps = {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  scrollable?: boolean;
};

export function BarklogScreenShell({
  title,
  subtitle,
  footer,
  children,
  scrollable = true,
}: BarklogScreenShellProps) {
  const content = (
    <YStack flex={1} w="100%" maxWidth={760} alignSelf="center">
      <YStack flex={1} px="$lg" pt="$xl" pb="$2xl" gap="$lg">
        {title ? (
          <YStack gap="$xs">
            <Paragraph
              color="$textPrimary"
              fontFamily="$heading"
              fontSize={barklogTypography.display}
              lineHeight={34}
              fontWeight="500"
              letterSpacing={-0.8}
            >
              {title}
            </Paragraph>
            {subtitle ? (
              <Paragraph
                color="$textMuted"
                fontFamily="$body"
                fontSize={barklogTypography.body}
                lineHeight={20}
              >
                {subtitle}
              </Paragraph>
            ) : null}
          </YStack>
        ) : null}

        {children}
      </YStack>
    </YStack>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FAFAFA' }}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <YStack flex={1} bg="$background">
          {scrollable ? (
            <ScrollView
              flex={1}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
          {footer}
        </YStack>
      </SafeAreaView>
    </>
  );
}
