import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolvePublicVetShareReport } from '../api/publicVetShareReportClient';
import type { VetShareReportSnapshot } from '../utils/vetReportBuilder';
import { buildLocalVetQuestions } from '../utils/vetReportBuilder';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  eyebrow: {
    color: '#737373',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '500',
  },
  body: {
    color: '#525252',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E5E4',
    borderRadius: 14,
    backgroundColor: '#F5F5F4',
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  bullet: {
    color: '#404040',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  error: {
    color: '#DC2626',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
});

function SectionList(input: { items: string[]; title: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{input.title}</Text>
      {input.items.map((item) => (
        <Text key={item} style={styles.bullet}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export default function VetShareReportScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [snapshot, setSnapshot] = useState<VetShareReportSnapshot | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setError('This BarkLog vet share link is missing its secure token.');
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    resolvePublicVetShareReport(token)
      .then((response) => {
        if (isMounted) {
          setSnapshot(response.report);
          setExpiresAt(response.expires_at);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('This BarkLog vet share link is unavailable or expired.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const questions = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.generatedReport?.questions.length
      ? snapshot.generatedReport.questions
      : buildLocalVetQuestions(snapshot.context);
  }, [snapshot]);

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator color="#0A0A0A" />
      </View>
    );
  }

  if (error || !snapshot) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BarkLog Vet Share</Text>
        <Text style={styles.title}>Report unavailable</Text>
        <Text style={styles.error}>
          {error ?? 'This BarkLog vet share link is unavailable.'}
        </Text>
      </ScrollView>
    );
  }

  const { context, generatedReport } = snapshot;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>BarkLog Vet Share</Text>
      <Text style={styles.title}>{context.dog.name} Patient Summary</Text>
      <Text style={styles.body}>
        {context.range.label}. This report organizes caregiver-entered records
        and observed patterns. It is not a diagnosis or substitute for
        veterinary care.
      </Text>
      {expiresAt ? (
        <Text style={styles.body}>
          Secure link expires {new Date(expiresAt).toLocaleDateString()}.
        </Text>
      ) : null}

      {generatedReport ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Caregiver Summary</Text>
          <Text style={styles.body}>{generatedReport.summary}</Text>
        </View>
      ) : null}

      <SectionList
        title="Questions to Discuss"
        items={questions.length > 0 ? questions : ['Review the attached logs.']}
      />
      <SectionList
        title="Symptoms and Observations"
        items={context.sections.symptomsAndObservations}
      />
      <SectionList
        title="Mood and Behavior"
        items={context.sections.behaviorAndMood}
      />
      <SectionList title="Medications" items={context.sections.medications} />
      <SectionList
        title="Nutrition and Elimination"
        items={context.sections.nutritionAndElimination}
      />
    </ScrollView>
  );
}
