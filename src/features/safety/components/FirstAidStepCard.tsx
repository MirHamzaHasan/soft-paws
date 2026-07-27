import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type FirstAidStepCardProps = {
  index: string;
  title: string;
  body: string;
  illustration?: ReactNode;
};

const styles = StyleSheet.create({
  step: {
    gap: 18,
  },
  index: {
    color: '#3A4448',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '400',
  },
  indexLine: {
    width: 28,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3A4448',
    marginTop: 6,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  body: {
    color: '#5E6670',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  illustrationWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export function FirstAidStepCard({
  index,
  title,
  body,
  illustration,
}: FirstAidStepCardProps) {
  return (
    <View style={styles.step}>
      <View>
        <Text style={styles.index}>{index}</Text>
        <View style={styles.indexLine} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {illustration ? (
        <View style={styles.illustrationWrap}>{illustration}</View>
      ) : null}
    </View>
  );
}
