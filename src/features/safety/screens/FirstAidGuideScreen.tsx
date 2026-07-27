import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';

import { AssistantAlertIcon } from '../../assistant/components/AssistantIcons';
import { AssistantLayout } from '../../assistant/components/AssistantLayout';
import { FirstAidStepCard } from '../components/FirstAidStepCard';
import {
  CallEmergencyIcon,
  InfoOutlineIcon,
} from '../components/SafetyEmergencyIcons';
import { getFirstAidGuide } from '../data/firstAidGuides';
import { ASPCA_POISON_CONTROL_PHONE } from '../data/toxicityDatabase';
import { callPhoneNumber, openTrustedSource } from '../services/safetyActions';

const styles = StyleSheet.create({
  stack: {
    gap: 28,
  },
  pill: {
    alignSelf: 'stretch',
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#B2433E',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillText: {
    flex: 1,
    color: '#FFFCFA',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  callout: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C9776D',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  calloutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calloutTitle: {
    color: '#B2433E',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  calloutBody: {
    color: '#5E6670',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  timerCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C9776D',
    backgroundColor: '#FFF7F5',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  timerLabel: {
    color: '#9A1F16',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timerValue: {
    color: '#0A0A0A',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '400',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timerAction: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C9776D',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerActionText: {
    color: '#9A1F16',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  source: {
    color: '#7C746C',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function FirstAidGuideScreen() {
  const router = useRouter();
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const guide = useMemo(() => getFirstAidGuide(topic), [topic]);
  const initialTimerSeconds = guide.timerSeconds ?? 0;
  const [remainingSeconds, setRemainingSeconds] = useState(initialTimerSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setRemainingSeconds(initialTimerSeconds);
    setTimerRunning(false);
  }, [initialTimerSeconds]);

  useEffect(() => {
    if (!timerRunning || remainingSeconds <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, timerRunning]);

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <View style={styles.pill}>
          <CallEmergencyIcon />
          <Text style={styles.pillText}>{guide.emergencyAction}</Text>
        </View>

        <Text style={styles.title}>
          {guide.title}
          {'\n'}First Aid
        </Text>

        <View style={styles.callout}>
          <View style={styles.calloutTitleRow}>
            <InfoOutlineIcon />
            <Text style={styles.calloutTitle}>{guide.warningTitle}</Text>
          </View>
          <Text style={styles.calloutBody}>{guide.warningBody}</Text>
        </View>

        {guide.timerSeconds ? (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>CPR cycle timer</Text>
            <Text style={styles.timerValue}>
              {formatTimer(remainingSeconds)}
            </Text>
            <View style={styles.timerActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.timerAction}
                onPress={() => setTimerRunning((current) => !current)}
              >
                <Text style={styles.timerActionText}>
                  {timerRunning ? 'Pause' : 'Start'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.timerAction}
                onPress={() => {
                  setRemainingSeconds(initialTimerSeconds);
                  setTimerRunning(false);
                }}
              >
                <Text style={styles.timerActionText}>Reset</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {guide.steps.map((step, index) => (
          <FirstAidStepCard
            key={step.title}
            index={String(index + 1).padStart(2, '0')}
            title={step.title}
            body={step.body}
            illustration={step.illustration}
          />
        ))}

        <PrimaryButton
          label={
            guide.id === 'poisoning'
              ? 'Call Poison Control'
              : 'Open Emergency SOS'
          }
          size="large"
          backgroundColor="#B2433E"
          borderColor="#B2433E"
          onPress={() => {
            if (guide.id === 'poisoning') {
              callPhoneNumber(ASPCA_POISON_CONTROL_PHONE).catch(() => {});
              return;
            }

            router.push('/emergency');
          }}
        />

        <Pressable
          accessibilityRole="link"
          onPress={() => {
            openTrustedSource(guide.sourceUrl).catch(() => {});
          }}
        >
          <Text style={styles.source}>SOURCE: {guide.sourceName}</Text>
        </Pressable>
      </View>
    </AssistantLayout>
  );
}
