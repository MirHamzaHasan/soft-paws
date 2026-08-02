import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarklogStatusBanner, useBarklogFeedback } from "@/components/ui";
import {
  captureBarklogError,
  queueBarklogEvent,
} from "@/features/observability";
import HapticManager from "@/managers/HapticManager";
import { getSelectedDog, useAuthSessionStore } from "@/stores";
import { getBarklogErrorMessage } from "@/utils/barklogErrorMessages";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { OnboardingCirclePlate } from "../../onboarding/components/OnboardingCirclePlate";
import { PawIcon } from "../../onboarding/components/OnboardingIcons";
import { PremiumFeatureRow } from "../components/PremiumFeatureRow";
import {
  BARKLOG_PREMIUM_PLANS,
  type BarklogPremiumPlanId,
  FREE_ACCESS_GUARANTEES,
  PAYWALL_FEATURE_ROWS,
} from "../data/premiumCatalog";
import { purchaseBarklogPlan } from "../services/revenueCatService";
import { usePremiumPresentationStore } from "../stores/usePremiumPresentationStore";
import {
  getPremiumEntitlementState,
  getTrialDaysRemaining,
} from "../utils/premiumAccess";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
  },
  title: {
    color: "#1F2528",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "400",
    letterSpacing: -1.2,
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 520,
    color: "#5D656D",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
    textAlign: "center",
  },
  pill: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#AAB3B8",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    color: "#4E5660",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  features: {
    width: "100%",
    gap: 10,
    paddingTop: 2,
  },
  guaranteeBox: {
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2DDD8",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  guaranteeTitle: {
    color: "#1F2528",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  guaranteeText: {
    color: "#5D656D",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  bottom: {
    gap: 14,
  },
  status: {
    borderRadius: 12,
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusText: {
    color: "#4F575F",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    textAlign: "center",
  },
  error: {
    backgroundColor: "#FCEBEB",
  },
  errorText: {
    color: "#791F1F",
  },
  maybeLater: {
    color: "#7A817F",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "center",
    paddingVertical: 8,
  },
});

function getPaywallHeadline(input: {
  dogName: string;
  reason?: string;
  trialStateLabel: string;
}) {
  if (input.reason === "trial-ended") {
    return `Keep BarkLog working harder for ${input.dogName}`;
  }

  if (input.trialStateLabel === "Premium") {
    return "BarkLog Premium is active";
  }

  return `Unlock more care context for ${input.dogName}`;
}

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string }>();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const setBarklogUser = useAuthSessionStore((state) => state.setBarklogUser);
  const dismissTrialExpiryPaywall = usePremiumPresentationStore(
    (state) => state.dismissTrialExpiryPaywall,
  );
  const [purchasingPlan, setPurchasingPlan] =
    useState<BarklogPremiumPlanId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorTone, setErrorTone] = useState<"danger" | "warning">("danger");
  const feedback = useBarklogFeedback();
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const dogName = selectedDog?.name ?? "your dog";
  const entitlementState = getPremiumEntitlementState(barklogUser);
  const trialDaysRemaining = getTrialDaysRemaining(barklogUser);
  const headline = getPaywallHeadline({
    dogName,
    reason: params.reason,
    trialStateLabel: entitlementState.label,
  });
  const pillLabel = useMemo(() => {
    if (entitlementState.kind === "trial-expired") {
      return "Trial ended";
    }

    if (entitlementState.kind === "trial") {
      return trialDaysRemaining === 1
        ? "Trial ends tomorrow"
        : `${trialDaysRemaining} trial days left`;
    }

    return entitlementState.label;
  }, [entitlementState.kind, entitlementState.label, trialDaysRemaining]);

  const handlePurchase = async (planId: BarklogPremiumPlanId) => {
    if (!barklogUser?.id) {
      const nextError = "Sign in again to start BarkLog Premium.";

      setError(nextError);
      setErrorTone("warning");
      await HapticManager.warning();
      return;
    }

    setPurchasingPlan(planId);
    setError(null);
    setErrorTone("danger");
    setMessage(null);

    try {
      const result = await purchaseBarklogPlan({
        planId,
        userId: barklogUser.id,
      });
      setBarklogUser(result.user);
      setMessage(`${result.plan.title} Premium is active.`);
      await HapticManager.success();
      feedback.showSuccess({
        title: "Premium active",
        description: `${result.plan.title} Premium is active.`,
      });
      router.replace("/(tabs)");
    } catch (purchaseError) {
      const safeMessage = getBarklogErrorMessage(purchaseError, {
        domain: "purchase",
      });
      const isCancellation = safeMessage.startsWith("Purchase cancelled");

      queueBarklogEvent("premium_purchase_failed", {
        plan_id: planId,
        reason: isCancellation ? "cancelled" : "failed",
      });
      setError(safeMessage);
      setErrorTone(isCancellation ? "warning" : "danger");

      if (isCancellation) {
        await HapticManager.warning();
      } else {
        captureBarklogError(purchaseError, {
          source: "premium.paywall_purchase",
          extra: {
            plan_id: planId,
          },
        });
        await HapticManager.error();
      }
    } finally {
      setPurchasingPlan(null);
    }
  };

  const handleMaybeLater = () => {
    if (barklogUser?.id && entitlementState.kind === "trial-expired") {
      dismissTrialExpiryPaywall(barklogUser.id);
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "right", "bottom", "left"]}
      >
        <ScrollView
          contentContainerStyle={styles.screen}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <OnboardingCirclePlate size={72}>
              <PawIcon size={34} />
            </OnboardingCirclePlate>
            <Text style={styles.title}>{headline}</Text>
            <Text style={styles.subtitle}>
              Premium unlocks the intelligence and creation tools. Your core
              care record stays available even if you do not subscribe.
            </Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{pillLabel}</Text>
            </View>

            <View style={styles.features}>
              {PAYWALL_FEATURE_ROWS.slice(0, 5).map((feature) => (
                <PremiumFeatureRow key={feature} label={feature} />
              ))}
            </View>

            <View style={styles.guaranteeBox}>
              <Text style={styles.guaranteeTitle}>Always free</Text>
              <Text style={styles.guaranteeText}>
                {FREE_ACCESS_GUARANTEES.join(" • ")}
              </Text>
            </View>
          </View>

          <View style={styles.bottom}>
            {message ? (
              <BarklogStatusBanner
                tone="success"
                title="Premium active"
                description={message}
              />
            ) : null}
            {error ? (
              <BarklogStatusBanner
                tone={errorTone}
                title={
                  errorTone === "warning"
                    ? "Purchase not completed"
                    : "Premium not updated"
                }
                description={error}
              />
            ) : null}

            <PrimaryButton
              label={
                purchasingPlan === "annual"
                  ? "Starting annual..."
                  : `${BARKLOG_PREMIUM_PLANS.annual.priceLabel} - Save with annual`
              }
              size="large"
              disabled={Boolean(purchasingPlan)}
              onPress={() => {
                handlePurchase("annual").catch(() => undefined);
              }}
            />
            <PrimaryButton
              label={
                purchasingPlan === "monthly"
                  ? "Starting monthly..."
                  : BARKLOG_PREMIUM_PLANS.monthly.priceLabel
              }
              size="large"
              backgroundColor="#FFFCFA"
              borderColor="#AAB3B8"
              labelColor="#1F2528"
              disabled={Boolean(purchasingPlan)}
              onPress={() => {
                handlePurchase("monthly").catch(() => undefined);
              }}
            />
            <Pressable accessibilityRole="button" onPress={handleMaybeLater}>
              <Text style={styles.maybeLater}>Not now</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
