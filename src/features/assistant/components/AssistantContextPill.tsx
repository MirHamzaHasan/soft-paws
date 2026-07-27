import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type AssistantContextPillProps = {
  label: string;
  icon?: ReactNode;
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#AEB6BD',
    backgroundColor: '#E8EFEF',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    color: '#2B3136',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});

export function AssistantContextPill({
  label,
  icon,
}: AssistantContextPillProps) {
  return (
    <View style={styles.pill}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
