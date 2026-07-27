import { StyleSheet, TextInput, View } from 'react-native';

import { SearchFieldIcon } from './SafetyIcons';

type SafetySearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  surface: {
    minHeight: 68,
    paddingHorizontal: 18,
    backgroundColor: '#F8F6F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  input: {
    flex: 1,
    minHeight: 68,
    color: '#5F6670',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  underline: {
    height: 1,
    backgroundColor: '#787067',
  },
});

export function SafetySearchField({
  value,
  onChangeText,
  placeholder = 'Search a food, plant...',
}: SafetySearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.surface}>
        <SearchFieldIcon />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B4ADA7"
          style={styles.input}
        />
      </View>
      <View style={styles.underline} />
    </View>
  );
}
