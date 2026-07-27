import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import {
  ErrorReceiptIllustration,
  RefreshArrowIcon,
} from '../components/StateIllustrations';
import { StateScreenLayout } from '../components/StateScreenLayout';

export default function ErrorStateScreen() {
  const router = useRouter();

  return (
    <StateScreenLayout
      illustration={<ErrorReceiptIllustration />}
      title="Something went wrong"
      message="We couldn't load this entry into your archive. Please check your connection or try again."
      actions={
        <View style={{ gap: 16 }}>
          <PrimaryButton
            label="Try again"
            size="large"
            leadingIcon={<RefreshArrowIcon />}
            onPress={() => {}}
          />
          <PrimaryButton
            label="Return home"
            size="large"
            backgroundColor="#FFFCFA"
            borderColor="#D9D5D1"
            labelColor="#0A0A0A"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      }
    />
  );
}
