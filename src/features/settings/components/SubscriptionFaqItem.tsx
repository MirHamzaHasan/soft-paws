import { StyleSheet, Text, View } from 'react-native';

type SubscriptionFaqItemProps = {
  question: string;
  answer: string;
};

const styles = StyleSheet.create({
  item: {
    gap: 16,
  },
  question: {
    color: '#0A0A0A',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  answerWrap: {
    borderLeftWidth: 2,
    borderLeftColor: '#E2DDD8',
    paddingLeft: 18,
  },
  answer: {
    color: '#5D656D',
    fontSize: 16,
    lineHeight: 30,
    fontWeight: '400',
  },
});

export function SubscriptionFaqItem({
  question,
  answer,
}: SubscriptionFaqItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.answerWrap}>
        <Text style={styles.answer}>{answer}</Text>
      </View>
    </View>
  );
}
