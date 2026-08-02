import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import type { EventModel } from "../../../db";
import { getSelectedDog, useAuthSessionStore } from "../../../stores";
import type { Json } from "../../../types/supabase";
import { AssistantAlertIcon } from "../../assistant/components/AssistantIcons";
import { HomeBottomTabBar } from "../../home/components/HomeBottomTabBar";
import { LedgerTrendCard } from "../../ledger/components/LedgerTrendCard";
import { LogDetailLayout } from "../../logging/components/LogDetailLayout";
import {
  getPremiumFeatureLabel,
  hasPremiumAccess,
} from "../../premium/utils/premiumAccess";
import { openPremiumGate } from "../../premium/utils/premiumNavigation";
import { MealsIcon } from "../components/InsightsIcons";
import { InsightsLineChartCard } from "../components/InsightsLineChartCard";
import { InsightsProgressRow } from "../components/InsightsProgressRow";
import {
  type EventSummary,
  loadMonthlyEvents,
} from "../utils/insightSummaries";

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#0A0A0A",
    fontSize: 56,
    lineHeight: 62,
    fontWeight: "400",
    letterSpacing: -1.1,
  },
  subtitle: {
    color: "#5D656D",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  monthSwitcher: {
    minWidth: 136,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E3DFDB",
    backgroundColor: "#F6F7F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  monthLabel: {
    color: "#1F2528",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  monthYear: {
    color: "#1F2528",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  premiumCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8CCFF",
    backgroundColor: "#F7F4FF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  premiumTitle: {
    color: "#3E2A9E",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
  },
  premiumBody: {
    color: "#4C3AA8",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  routineCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E1DB",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  routineTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  routineTitle: {
    color: "#0A0A0A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
  },
  routineValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  routineValue: {
    color: "#1B2024",
    fontSize: 56,
    lineHeight: 60,
    fontWeight: "400",
    letterSpacing: -1.1,
  },
  routineMeta: {
    color: "#0F6A22",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  routineDetail: {
    color: "#5D656D",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  symptomsCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E1DB",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  statusText: {
    color: "#687079",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
});

function asDetailsRecord(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function getNumber(value: Json | undefined) {
  return typeof value === "number" ? value : null;
}

function getStringArray(value: Json | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function buildWeekBuckets(events: EventModel[]) {
  return [0, 1, 2, 3].map((weekIndex) =>
    events
      .filter((event) => {
        const day = new Date(event.occurredAt).getDate();
        return Math.floor((day - 1) / 7) === weekIndex;
      })
      .reduce((total, event) => {
        if (event.type !== "walk") {
          return total;
        }

        return (
          total + (getNumber(asDetailsRecord(event.details).duration_min) ?? 0)
        );
      }, 0),
  );
}

function buildWeightValues(
  events: EventModel[],
  fallbackWeight?: number | null,
) {
  const weightEvents = events.filter((event) => event.type === "weight");

  if (weightEvents.length === 0) {
    return Array.from({ length: 4 }, () => fallbackWeight ?? 0);
  }

  return [0, 1, 2, 3].map((weekIndex) => {
    const weekWeight = weightEvents.find((event) => {
      const day = new Date(event.occurredAt).getDate();
      return Math.floor((day - 1) / 7) === weekIndex;
    });

    return (
      getNumber(asDetailsRecord(weekWeight?.details).weight_lbs) ??
      fallbackWeight ??
      0
    );
  });
}

function getRoutinePercent(summary: EventSummary, daysElapsed: number) {
  const expectedMealLogs = Math.max(daysElapsed * 2, 1);
  return Math.min(
    100,
    Math.round((summary.mealCount / expectedMealLogs) * 100),
  );
}

function getTopSymptoms(events: EventModel[]) {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    if (event.type !== "symptom") {
      return;
    }

    getStringArray(asDetailsRecord(event.details).symptoms).forEach(
      (symptom) => {
        counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
      },
    );
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
}

export default function MonthlyTrendsScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [monthOffset, setMonthOffset] = useState(0);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [monthLabel, setMonthLabel] = useState("This month");
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!selectedDog?.id || !premiumAccess) {
        return () => {
          isMounted = false;
        };
      }

      loadMonthlyEvents({ dogId: selectedDog.id, monthOffset })
        .then((snapshot) => {
          if (isMounted) {
            setEvents(snapshot.events);
            setMonthLabel(snapshot.label);
            setSummary(snapshot.summary);
            setError(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError("Unable to load monthly trends.");
          }
        });

      return () => {
        isMounted = false;
      };
    }, [monthOffset, premiumAccess, selectedDog?.id]),
  );

  const walkBuckets = buildWeekBuckets(events);
  const weightValues = buildWeightValues(events, selectedDog?.weight_lbs);
  const routinePercent = summary
    ? getRoutinePercent(summary, new Date().getDate())
    : 0;
  const topSymptoms = getTopSymptoms(events);

  return (
    <LogDetailLayout
      title="BarkLog"
      headerVariant="brand"
      trailing={<AssistantAlertIcon />}
      footer={<HomeBottomTabBar activeTab="insights" />}
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        {!premiumAccess ? (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>
              {getPremiumFeatureLabel("monthly-trends")}
            </Text>
            <Text style={styles.premiumBody}>
              Monthly trends are a premium intelligence surface. Your basic
              logging, timeline, and export access stay available.
            </Text>
            <PrimaryButton
              label="Unlock with Premium"
              size="large"
              onPress={() => openPremiumGate(router, "monthly-trends")}
            />
          </View>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Trends</Text>
            <Text style={styles.subtitle}>
              A curated view of monthly rhythms.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.monthSwitcher}
            onPress={() => setMonthOffset((current) => current - 1)}
          >
            <Text style={styles.monthLabel}>{monthLabel}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.statusText}>{error}</Text> : null}

        <InsightsLineChartCard
          title="Weight"
          labels={["W1", "W2", "W3", "W4"]}
          values={weightValues}
          strokeColor="#0A0A0A"
          dotColor="#FAFAFA"
        />

        <LedgerTrendCard
          title="Activity"
          data={walkBuckets.map((value, index) => ({
            color: value > 0 ? "#FFE277" : "#FFF8DE",
            label: `W${index + 1}`,
            value,
          }))}
        />

        <View style={styles.routineCard}>
          <View style={styles.routineTitleRow}>
            <Text style={styles.routineTitle}>Routine</Text>
            <MealsIcon size={24} />
          </View>

          <View style={styles.routineValueRow}>
            <Text style={styles.routineValue}>{routinePercent}%</Text>
            <Text style={styles.routineMeta}>On Schedule</Text>
          </View>

          <Text style={styles.routineDetail}>
            {summary?.mealCount ?? 0} meal logs this month
          </Text>
        </View>

        <View style={styles.symptomsCard}>
          <Text style={styles.routineTitle}>Symptoms</Text>
          {topSymptoms.length > 0 ? (
            topSymptoms.map(([symptom, count]) => (
              <InsightsProgressRow
                key={symptom}
                label={symptom.replace(/[-_]/g, " ")}
                value={`${count} Logs`}
                percent={Math.min(100, count * 20)}
                accent="#A8342A"
              />
            ))
          ) : (
            <InsightsProgressRow
              label="No symptom clusters"
              value="0 Logs"
              percent={0}
              accent="#8B6509"
            />
          )}
        </View>
      </View>
    </LogDetailLayout>
  );
}
