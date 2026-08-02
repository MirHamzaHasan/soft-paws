import type React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.32)',
  },
  card: {
    minWidth: 176,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
  },
  text: {
    marginTop: 12,
    color: '#0A0A0A',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={visible}
    >
      <View style={styles.container}>
        <View
          accessibilityLabel={message}
          accessibilityRole="progressbar"
          style={styles.card}
        >
          <ActivityIndicator size="small" color="#0A0A0A" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;
