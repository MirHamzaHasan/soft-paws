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
  BarklogBottomSheet,
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
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
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
              label="Dog name"
              hint="Inter 400/500 is loaded globally through Expo fonts."
              value={email}
              placeholder="Your dog's name"
              onChangeText={setEmail}
            />

            <YStack gap="$sm">
              <BarklogToast
                title="Event saved"
                description="Saved on this device."
                tone="success"
              />
              <BarklogToast
                title="Export a copy"
                description="Keep a copy of your journal outside this device."
                tone="warning"
              />
              <BarklogToast
                title="Care summary ready"
                description="Review your local care history before a vet visit."
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
                title="Local journal"
                description="New entries are saved on this device."
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
                Emergency SOS is forced to the light theme at the app-shell
                level.
              </Paragraph>
            </XStack>
            <BarklogButton
              label="Preview bottom sheet"
              tone="secondary"
              onPress={() => setSheetOpen(true)}
            />
          </BarklogCard>
        </YStack>
      </BarklogScreenShell>

      <BarklogBottomSheet
        accessibilityLabel="Bottom sheet preview"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      >
        <YStack gap="$xs">
          <Paragraph
            color="$textPrimary"
            fontFamily="$heading"
            fontSize={22}
            fontWeight="500"
            lineHeight={28}
          >
            Calm, focused actions
          </Paragraph>
          <Paragraph
            color="$textMuted"
            fontFamily="$body"
            fontSize={14}
            lineHeight={20}
          >
            Sheets keep one decision visible and preserve the care record
            underneath.
          </Paragraph>
        </YStack>
        <BarklogButton label="Done" onPress={() => setSheetOpen(false)} />
      </BarklogBottomSheet>
    </>
  );
}
