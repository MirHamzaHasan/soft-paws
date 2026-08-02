import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BarklogStatusBanner } from "@/components/ui";
import { captureBarklogError } from "@/features/observability";
import HapticManager from "@/managers/HapticManager";
import { getSelectedDog, useAuthSessionStore } from "@/stores";
import { getBarklogErrorMessage } from "@/utils/barklogErrorMessages";

import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { AssistantLayout } from "../../assistant/components/AssistantLayout";
import { RestoreArrowIcon } from "../../premium/components/PremiumIcons";
import { BARKLOG_PREMIUM_PLANS } from "../../premium/data/premiumCatalog";
import {
  getRevenueCatConfiguration,
  openSubscriptionManagement,
  restoreBarklogPurchases,
} from "../../premium/services/revenueCatService";
import {
  getPremiumEntitlementState,
  getTrialDaysRemaining,
} from "../../premium/utils/premiumAccess";
import { SubscriptionFaqItem } from "../components/SubscriptionFaqItem";
import { SubscriptionPlanCard } from "../components/SubscriptionPlanCard";

const styles = StyleSheet.create({
  stack: {
    gap: 20,
  },
  hero: {
    gap: 14,
  },
  title: {
    color: "#1F2528",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "400",
    letterSpacing: -1.6,
  },
  subtitle: {
    color: "#5D656D",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2DDD8",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  statusTitle: {
    color: "#1F2528",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  statusText: {
    color: "#5D656D",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  errorText: {
    color: "#791F1F",
  },
  faqTitle: {
    color: "#0A0A0A",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "400",
    letterSpacing: -1,
  },
  faqList: {
    gap: 16,
  },
});

function formatRenewalDate(trialEndsAt: string | null) {
  if (!trialEndsAt) {
    return "Managed by your app store";
  }

  const date = new Date(trialEndsAt);

  if (Number.isNaN(date.getTime())) {
    return "Managed by your app store";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const setBarklogUser = useAuthSessionStore((state) => state.setBarklogUser);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "warning">(
    "success",
  );
  const [error, setError] = useState<string | null>(null);
  const [errorTone, setErrorTone] = useState<"danger" | "warning">("danger");
  const [restoring, setRestoring] = useState(false);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const entitlementState = getPremiumEntitlementState(barklogUser);
  const trialDaysRemaining = getTrialDaysRemaining(barklogUser);
  const revenueCatConfiguration = getRevenueCatConfiguration();
  let planTitle = "Free";

  if (entitlementState.hasAccess) {
    planTitle = entitlementState.kind === "trial" ? "Premium Trial" : "Premium";
  }

  const renewalLabel =
    entitlementState.kind === "trial" ? "Trial ends on" : "Billing status";
  let renewalDate = "No active premium renewal";

  if (entitlementState.kind === "trial") {
    renewalDate = formatRenewalDate(barklogUser?.trial_ends_at ?? null);
  } else if (entitlementState.hasAccess) {
    renewalDate = "Active through app-store entitlement";
  }
  const subtitle = useMemo(() => {
    if (entitlementState.kind === "trial") {
      return trialDaysRemaining === 1
        ? "Premium trial ends tomorrow"
        : `${trialDaysRemaining} premium trial days remaining`;
    }

    if (entitlementState.hasAccess) {
      return "Premium features are available";
    }

    return `${selectedDog?.name ?? "Your dog"} keeps logging, timeline, CSV export, and PDF export in free mode.`;
  }, [
    entitlementState.hasAccess,
    entitlementState.kind,
    selectedDog?.name,
    trialDaysRemaining,
  ]);

  const handleRestore = async () => {
    if (!barklogUser) {
      const nextError = "Sign in again to restore purchases.";

      setError(nextError);
      setErrorTone("warning");
      await HapticManager.warning();
      return;
    }

    setRestoring(true);
    setError(null);
    setErrorTone("danger");
    setMessage(null);

    try {
      const result = await restoreBarklogPurchases({ user: barklogUser });

      if (result.restored) {
        setBarklogUser(result.user);
        setMessage("BarkLog Premium access is restored.");
        setMessageTone("success");
        await HapticManager.success();
      } else {
        if (result.user) {
          setBarklogUser(result.user);
        }

        setMessage(result.message);
        setMessageTone("warning");
        await HapticManager.warning();
      }
    } catch (restoreError) {
      const safeMessage = getBarklogErrorMessage(restoreError, {
        domain: "purchase",
        fallback: "Unable to restore purchases right now.",
      });

      setError(safeMessage);
      setErrorTone("danger");
      captureBarklogError(restoreError, {
        source: "settings.restore_purchases",
      });
      await HapticManager.error();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <AssistantLayout title="Subscription" onBackPress={() => router.back()}>
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.title}>Your Plan</Text>
          <Text style={styles.subtitle}>
            Manage premium access, restore purchases, or return to free mode
            without losing the care record.
          </Text>
        </View>

        <SubscriptionPlanCard
          title={planTitle}
          status={entitlementState.label}
          subtitle={subtitle}
          renewalLabel={renewalLabel}
          renewalDate={renewalDate}
          price={`${BARKLOG_PREMIUM_PLANS.annual.priceLabel} or ${BARKLOG_PREMIUM_PLANS.monthly.priceLabel}`}
          onManagePress={() => {
            openSubscriptionManagement().catch(async (manageError) => {
              const safeMessage = getBarklogErrorMessage(manageError, {
                domain: "purchase",
                fallback: "Unable to open subscription management.",
              });

              setError(safeMessage);
              setErrorTone("danger");
              captureBarklogError(manageError, {
                source: "settings.open_subscription_management",
              });
              await HapticManager.error();
            });
          }}
        />

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Premium access status</Text>
          <Text style={styles.statusText}>
            Store connection:{" "}
            {revenueCatConfiguration.configured
              ? "ready"
              : "not ready in this build"}
          </Text>
        </View>

        {message ? (
          <BarklogStatusBanner
            tone={messageTone}
            title={
              messageTone === "success"
                ? "Premium restored"
                : "No active Premium found"
            }
            description={message}
          />
        ) : null}
        {error ? (
          <BarklogStatusBanner
            tone={errorTone}
            title={
              errorTone === "warning"
                ? "Sign-in needed"
                : "Subscription unavailable"
            }
            description={error}
          />
        ) : null}

        {!entitlementState.hasAccess ? (
          <PrimaryButton
            label="Unlock Premium"
            size="large"
            onPress={() => router.push("/paywall")}
          />
        ) : null}

        <PrimaryButton
          label={restoring ? "Restoring..." : "Restore purchases"}
          size="large"
          leadingIcon={<RestoreArrowIcon />}
          backgroundColor="#FFFCFA"
          borderColor="#0A0A0A"
          labelColor="#0A0A0A"
          disabled={restoring}
          onPress={() => {
            handleRestore().catch(() => undefined);
          }}
        />

        <Text style={styles.faqTitle}>FAQ</Text>

        <View style={styles.faqList}>
          <SubscriptionFaqItem
            question="How do I cancel my subscription?"
            answer="Use Manage subscription to open your native app-store subscription settings. Premium remains available until the store entitlement ends."
          />
          <SubscriptionFaqItem
            question="Will I lose my logs if I cancel?"
            answer="No. Logging, timeline access, CSV export, and PDF export remain available. Premium gates only leverage features such as AI, multi-dog, monthly trends, memory book, and expense tracking."
          />
          <SubscriptionFaqItem
            question="Can I switch plans?"
            answer="Yes. Plan changes are handled by the app store. BarkLog uses the RevenueCat premium entitlement as the single access signal."
          />
        </View>
      </View>
    </AssistantLayout>
  );
}
