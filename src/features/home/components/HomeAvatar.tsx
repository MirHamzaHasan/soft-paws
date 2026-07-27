import { StyleSheet, Text, View } from 'react-native';

type HomeAvatarProps = {
  emoji?: string;
  backgroundColor?: string;
  size?: number;
};

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export function HomeAvatar({
  emoji = '🐶',
  backgroundColor = '#1A1A1A',
  size = 56,
}: HomeAvatarProps) {
  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={{
          fontSize: Math.round(size * 0.5),
          lineHeight: Math.round(size * 0.58),
        }}
      >
        {emoji}
      </Text>
    </View>
  );
}
