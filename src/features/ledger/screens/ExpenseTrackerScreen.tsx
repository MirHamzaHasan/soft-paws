import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  type BarklogExpenseCategory,
  createLocalExpense,
  type ExpenseModel,
  listLocalExpensesForDogYear,
} from '@/db';
import { getDogAvatar } from '@/features/dogs/utils/dogDisplay';
import { buildExpensesCsv } from '@/features/export/utils/exportBuilders';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { shareTextDocument } from '../../export/services/exportDocumentService';
import { HomeShell } from '../../home/components/HomeShell';
import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';
import { openPremiumGate } from '../../premium/utils/premiumNavigation';
import { LedgerDonutCard } from '../components/LedgerDonutCard';
import {
  FoodExpenseIcon,
  GroomingExpenseIcon,
  LedgerPlusIcon,
  ToyExpenseIcon,
  VetExpenseIcon,
} from '../components/LedgerIcons';
import { LedgerTransactionRow } from '../components/LedgerTransactionRow';
import { LedgerTrendCard } from '../components/LedgerTrendCard';

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  hero: {
    gap: 10,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  amount: {
    color: '#1F2528',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -0.8,
  },
  amountMeta: {
    color: '#6B727A',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  addButtonWrap: {
    alignSelf: 'flex-start',
    width: 146,
  },
  transactionsHeader: {
    color: '#0A0A0A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E4E0DC',
    marginTop: -8,
  },
  transactionList: {
    gap: 8,
  },
  viewAll: {
    alignSelf: 'center',
    color: '#4F575F',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    marginTop: 2,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E0DC',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  formTitle: {
    color: '#0A0A0A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
  },
  field: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    color: '#1F2528',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formCell: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipCell: {
    flexShrink: 0,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

const EXPENSE_CATEGORIES: BarklogExpenseCategory[] = [
  'food',
  'vet',
  'grooming',
  'medication',
  'toys',
  'boarding',
  'insurance',
  'other',
];

const CATEGORY_META: Record<
  BarklogExpenseCategory,
  {
    color: string;
    icon: ReactNode;
    label: string;
  }
> = {
  boarding: {
    color: '#EDE8FF',
    icon: <ToyExpenseIcon />,
    label: 'Boarding',
  },
  food: {
    color: '#EAF5E7',
    icon: <FoodExpenseIcon />,
    label: 'Food',
  },
  grooming: {
    color: '#FFE8E6',
    icon: <GroomingExpenseIcon />,
    label: 'Grooming',
  },
  insurance: {
    color: '#EEF2F3',
    icon: <VetExpenseIcon />,
    label: 'Insurance',
  },
  medication: {
    color: '#F3EEFF',
    icon: <VetExpenseIcon />,
    label: 'Medication',
  },
  other: {
    color: '#F1EFEC',
    icon: <ToyExpenseIcon />,
    label: 'Other',
  },
  toys: {
    color: '#EAF0F7',
    icon: <ToyExpenseIcon />,
    label: 'Toys',
  },
  vet: {
    color: '#FFF3D9',
    icon: <VetExpenseIcon />,
    label: 'Vet',
  },
};

function formatTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatExpenseDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  }).format(parsedDate);
}

function buildCategoryData(expenses: ExpenseModel[]) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0) || 1;

  return EXPENSE_CATEGORIES.map((category) => {
    const amount = expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      color: CATEGORY_META[category].color,
      label: CATEGORY_META[category].label,
      value: Math.round((amount / total) * 100),
    };
  }).filter((item) => item.value > 0);
}

function buildMonthlyTrendData(expenses: ExpenseModel[]) {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthKey = month.toISOString().slice(0, 7);
    const value = expenses
      .filter((expense) => expense.date.startsWith(monthKey))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      label: new Intl.DateTimeFormat(undefined, { month: 'short' })
        .format(month)
        .toUpperCase(),
      value,
    };
  });
}

export default function ExpenseTrackerScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const premiumAccess = hasPremiumAccess(barklogUser);
  const [expenses, setExpenses] = useState<ExpenseModel[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatTodayDate());
  const [category, setCategory] = useState<BarklogExpenseCategory>('food');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!premiumAccess) {
      openPremiumGate(router, 'expense-tracker');
    }
  }, [premiumAccess, router]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!premiumAccess || !selectedDog?.id) {
        setExpenses([]);
        return () => {
          isMounted = false;
        };
      }

      listLocalExpensesForDogYear({
        dogId: selectedDog.id,
        year: new Date().getFullYear(),
      })
        .then((nextExpenses) => {
          if (isMounted) {
            setExpenses(nextExpenses);
            setError(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Unable to load expenses from this device.');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [premiumAccess, selectedDog?.id]),
  );

  if (!premiumAccess) {
    return null;
  }

  const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryData = buildCategoryData(expenses);
  const avatar = selectedDog
    ? getDogAvatar(selectedDog)
    : { backgroundColor: '#E4E8F2', emoji: '🐶' };

  const reloadExpenses = async () => {
    if (!selectedDog?.id) {
      return;
    }

    const nextExpenses = await listLocalExpensesForDogYear({
      dogId: selectedDog.id,
      year: new Date().getFullYear(),
    });
    setExpenses(nextExpenses);
  };

  const handleAddExpense = async () => {
    if (!barklogUser?.id || !selectedDog?.id) {
      setError('Finish dog setup before adding expenses.');
      return;
    }

    const parsedAmount = Number.parseFloat(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid expense amount.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      await createLocalExpense({
        amount: Math.round(parsedAmount * 100) / 100,
        category,
        date,
        description,
        dogId: selectedDog.id,
        userId: barklogUser.id,
      });
      setAmount('');
      setDescription('');
      setDate(formatTodayDate());
      setStatusMessage('Expense saved locally and ready to sync.');
      await reloadExpenses();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save this expense.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExpenses = async () => {
    if (!selectedDog) {
      return;
    }

    setError(null);
    setStatusMessage(null);

    try {
      const message = await shareTextDocument({
        content: buildExpensesCsv({ dog: selectedDog, expenses }),
        fileName: `${selectedDog.name}-expenses-${new Date().getFullYear()}.csv`,
        mimeType: 'text/csv',
        title: `${selectedDog.name} expense export`,
        uti: 'public.comma-separated-values-text',
      });

      setStatusMessage(message);
    } catch {
      setError('Unable to export expenses right now.');
    }
  };

  return (
    <HomeShell
      activeTab="ledger"
      tabVariant="care"
      headerVariant="compact"
      headerAvatarEmoji={avatar.emoji}
      headerAvatarBackgroundColor={avatar.backgroundColor}
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.title}>
            {selectedDog?.name ? `${selectedDog.name}'s Ledger` : 'Ledger'}
          </Text>

          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatCurrency(totalSpend)}</Text>
            <Text style={styles.amountMeta}>YTD Spend</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add expense</Text>
          <TextInput
            style={styles.field}
            value={description}
            placeholder="Description"
            placeholderTextColor="#8A8178"
            onChangeText={setDescription}
          />
          <View style={styles.formRow}>
            <View style={styles.formCell}>
              <TextInput
                style={styles.field}
                value={amount}
                keyboardType="decimal-pad"
                placeholder="Amount"
                placeholderTextColor="#8A8178"
                onChangeText={setAmount}
              />
            </View>
            <View style={styles.formCell}>
              <TextInput
                style={styles.field}
                value={date}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8A8178"
                onChangeText={setDate}
              />
            </View>
          </View>
          <View style={styles.chipRow}>
            {EXPENSE_CATEGORIES.map((item) => (
              <View key={item} style={styles.chipCell}>
                <OnboardingChoiceChip
                  size="compact"
                  label={CATEGORY_META[item].label}
                  selected={category === item}
                  backgroundColor="#F7F7F6"
                  borderColor="#DDD8D2"
                  onPress={() => setCategory(item)}
                />
              </View>
            ))}
          </View>
          <View style={styles.secondaryActions}>
            <View style={styles.formCell}>
              <PrimaryButton
                label={isSaving ? 'Saving...' : 'Save'}
                leadingIcon={<LedgerPlusIcon />}
                disabled={isSaving}
                onPress={() => {
                  handleAddExpense().catch(() => undefined);
                }}
              />
            </View>
            <View style={styles.formCell}>
              <PrimaryButton
                label="Export CSV"
                backgroundColor="#FFFCFA"
                borderColor="#0A0A0A"
                labelColor="#0A0A0A"
                onPress={() => {
                  handleExportExpenses().catch(() => undefined);
                }}
              />
            </View>
          </View>
        </View>

        <LedgerDonutCard
          title="Spend by Category"
          data={
            categoryData.length > 0
              ? categoryData
              : [{ label: 'No spend', value: 100, color: '#F1EFEC' }]
          }
        />

        <LedgerTrendCard
          title="Monthly Trend"
          data={buildMonthlyTrendData(expenses)}
        />

        <Text style={styles.transactionsHeader}>Recent Transactions</Text>
        <View style={styles.divider} />

        <View style={styles.transactionList}>
          {expenses.slice(0, 8).map((expense) => {
            const meta = CATEGORY_META[expense.category];

            return (
              <LedgerTransactionRow
                key={expense.id}
                icon={meta.icon}
                iconBackgroundColor={meta.color}
                iconBorderColor="#D7D3CF"
                title={expense.description || meta.label}
                meta={`${meta.label} • ${formatExpenseDate(expense.date)}`}
                amount={`-${formatCurrency(expense.amount)}`}
              />
            );
          })}
          {expenses.length === 0 ? (
            <Text style={styles.statusText}>
              No expenses yet. Add care costs here when you want a longer-term
              ownership ledger.
            </Text>
          ) : null}
        </View>

        {expenses.length > 8 ? (
          <Text style={styles.viewAll}>Showing latest 8 transactions</Text>
        ) : null}
        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
        {error ? (
          <Text style={[styles.statusText, { color: '#B02921' }]}>{error}</Text>
        ) : null}
      </View>
    </HomeShell>
  );
}
