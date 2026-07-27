import {
  Check,
  Dog,
  Droplets,
  LayoutGrid,
  MoonStar,
} from 'lucide-react-native';
import { useState } from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';

import {
  BarklogButton,
  BarklogCard,
  BarklogInput,
  BarklogScreenShell,
  BarklogStatusBanner,
  BarklogTabBar,
  BarklogToast,
} from '@/components/ui';
import { barklogTypography } from '@/theme/tokens';

export default function DesignSystemPreviewScreen() {
  const [email, setEmail] = useState('caregiver@example.com');
  const [activeTab, setActiveTab] = useState('home');

  return (
    <BarklogScreenShell
      title="Design system preview"
      subtitle="Internal QA surface for BarkLog Tamagui tokens and primitives."
      footer={
        <BarklogTabBar
          items={[
            {
              key: 'home',
              label: 'Home',
              icon: <Dog size={22} />,
              active: activeTab === 'home',
              onPress: () => setActiveTab('home'),
            },
            {
              key: 'care',
              label: 'Care',
              icon: <Droplets size={22} />,
              active: activeTab === 'care',
              onPress: () => setActiveTab('care'),
            },
            {
              key: 'insights',
              label: 'Insights',
              icon: <LayoutGrid size={22} />,
              active: activeTab === 'insights',
              onPress: () => setActiveTab('insights'),
            },
          ]}
        />
      }
    >
      <YStack gap="$lg">
        <BarklogCard tone="raised">
          <Paragraph
            color="$textPrimary"
            fontFamily="$heading"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Buttons
          </Paragraph>

          <XStack gap="$md" flexWrap="wrap">
            <BarklogButton
              label="Primary"
              leadingIcon={<Check size={18} />}
              onPress={() => {}}
            />
            <BarklogButton
              label="Secondary"
              tone="secondary"
              onPress={() => {}}
            />
            <BarklogButton label="AI" tone="ai" onPress={() => {}} />
          </XStack>
        </BarklogCard>

        <BarklogCard tone="ai">
          <Paragraph
            color="$aiText"
            fontFamily="$heading"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Inputs and feedback
          </Paragraph>

          <BarklogInput
            label="Caregiver email"
            hint="Inter 400/500 is loaded globally through Expo fonts."
            value={email}
            placeholder="you@example.com"
            onChangeText={setEmail}
          />

          <YStack gap="$sm">
            <BarklogToast
              title="Event saved"
              description="Logged to this device and ready to sync."
              tone="success"
            />
            <BarklogToast
              title="Sync will retry"
              description="BarkLog will try again when the connection improves."
              tone="warning"
            />
            <BarklogToast
              title="AI draft ready"
              description="Review before sharing with your care team."
              tone="ai"
            />
          </YStack>
        </BarklogCard>

        <BarklogCard tone="raised">
          <Paragraph
            color="$textPrimary"
            fontFamily="$heading"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Status banners
          </Paragraph>

          <YStack gap="$sm">
            <BarklogStatusBanner
              tone="danger"
              title="Log not saved"
              description="Check the required fields and try again."
            />
            <BarklogStatusBanner
              tone="warning"
              title="Backup paused"
              description="New entries are safe on this device."
            />
            <BarklogStatusBanner
              tone="success"
              title="Care record exported"
              description="The file is ready to share from this device."
            />
          </YStack>
        </BarklogCard>

        <BarklogCard tone="default">
          <Paragraph
            color="$textPrimary"
            fontFamily="$heading"
            fontSize={barklogTypography.title}
            lineHeight={24}
            fontWeight="500"
          >
            Dark-mode note
          </Paragraph>
          <XStack ai="center" gap="$sm">
            <MoonStar size={18} />
            <Paragraph color="$textMuted" fontSize={barklogTypography.body}>
              Emergency SOS is forced to the light theme at the app-shell level.
            </Paragraph>
          </XStack>
        </BarklogCard>
      </YStack>
    </BarklogScreenShell>
  );
}
