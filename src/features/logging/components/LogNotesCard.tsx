import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AddPhotoIcon } from './LoggingIcons';

type LogNotesCardProps = {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  labelVariant?: 'caps' | 'body';
  placeholder?: string;
  showPhotoRow?: boolean;
  photoPlacement?: 'inside' | 'below' | 'none';
  photoSelected?: boolean;
  onPhotoPress?: () => void;
  minHeight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
};

const styles = StyleSheet.create({
  field: {
    gap: 14,
  },
  label: {
    color: '#A7A099',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  labelBody: {
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0,
    textTransform: 'none',
  },
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
  },
  input: {
    minHeight: 108,
    color: '#111111',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlignVertical: 'top',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E3DDD8',
    marginHorizontal: 6,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoText: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  photoTextSelected: {
    color: '#145E22',
  },
});

export function LogNotesCard({
  value,
  onChangeText,
  label = 'NOTES',
  labelVariant = 'caps',
  placeholder = 'Added some pumpkin today...',
  showPhotoRow = true,
  photoPlacement = 'inside',
  photoSelected = false,
  onPhotoPress,
  minHeight = 108,
  backgroundColor = '#FFFCFA',
  borderRadius = 22,
  borderColor = '#DDD8D2',
}: LogNotesCardProps) {
  const showPhotoInside = showPhotoRow && photoPlacement === 'inside';
  const showPhotoBelow = showPhotoRow && photoPlacement === 'below';
  const showLabel = label.length > 0;
  const photoLabel = photoSelected ? 'Photo attached' : 'Add Photo';
  const photoContent = (
    <View style={styles.photoRow}>
      <AddPhotoIcon color={photoSelected ? '#145E22' : '#111111'} />
      <Text
        style={[
          styles.photoText,
          photoSelected ? styles.photoTextSelected : null,
        ]}
      >
        {photoLabel}
      </Text>
    </View>
  );
  const renderPhotoPressable = () => {
    if (!onPhotoPress) {
      return photoContent;
    }

    return (
      <Pressable accessibilityRole="button" onPress={onPhotoPress}>
        {photoContent}
      </Pressable>
    );
  };

  return (
    <View style={styles.field}>
      {showLabel ? (
        <Text
          style={[
            styles.label,
            labelVariant === 'body' ? styles.labelBody : null,
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[styles.card, { backgroundColor, borderRadius, borderColor }]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline
          placeholder={placeholder}
          placeholderTextColor="#B4ADA7"
          style={[styles.input, { minHeight }]}
        />

        {showPhotoInside ? (
          <>
            <View style={styles.divider} />

            {renderPhotoPressable()}
          </>
        ) : null}
      </View>

      {showPhotoBelow ? renderPhotoPressable() : null}
    </View>
  );
}
