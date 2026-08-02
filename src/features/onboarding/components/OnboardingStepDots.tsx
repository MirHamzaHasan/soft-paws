import { StyleSheet, View } from 'react-native';

type OnboardingStepDotsProps = {
  currentStep: number;
  totalSteps: number;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E7E5E4',
  },
  dotActive: {
    backgroundColor: '#0A0A0A',
  },
});

export function OnboardingStepDots({
  currentStep,
  totalSteps,
}: OnboardingStepDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;

        return (
          <View
            key={step}
            style={[styles.dot, step === currentStep ? styles.dotActive : null]}
          />
        );
      })}
    </View>
  );
}
