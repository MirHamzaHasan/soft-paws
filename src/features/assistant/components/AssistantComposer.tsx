import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AssistantSendIcon } from './AssistantIcons';

type AssistantComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  questionsRemaining: number;
  onUpgradePress?: () => void;
  onSendPress?: () => void;
};

const styles = StyleSheet.create({
  chrome: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C8D0D5',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  inputWrap: {
    minHeight: 118,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#B2BAC1',
    backgroundColor: '#FFFCFA',
    paddingLeft: 18,
    paddingRight: 16,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  input: {
    flex: 1,
    minHeight: 80,
    color: '#4B525A',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  meta: {
    color: '#4A525A',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  upgrade: {
    color: '#4A525A',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
});

export function AssistantComposer({
  value,
  onChangeText,
  questionsRemaining,
  onUpgradePress,
  onSendPress,
}: AssistantComposerProps) {
  return (
    <View style={styles.chrome}>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          multiline
          placeholder="Ask about Max's health, habits, or records."
          placeholderTextColor="#848B93"
          style={styles.input}
          onChangeText={onChangeText}
        />

        <Pressable
          accessibilityRole="button"
          style={styles.sendButton}
          onPress={onSendPress}
        >
          <AssistantSendIcon />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {questionsRemaining} Questions Remaining
        </Text>
        <Pressable accessibilityRole="button" onPress={onUpgradePress}>
          <Text style={styles.upgrade}>Upgrade</Text>
        </Pressable>
      </View>
    </View>
  );
}
