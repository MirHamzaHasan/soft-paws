import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { captureBarklogError } from '../services/crashReportingService';

type ObservabilityBoundaryProps = {
  children: ReactNode;
};

type ObservabilityBoundaryState = {
  error: Error | null;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F3EE',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0DBD5',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 14,
  },
  eyebrow: {
    color: '#8D867F',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  button: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFCFA',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export class ObservabilityBoundary extends Component<
  ObservabilityBoundaryProps,
  ObservabilityBoundaryState
> {
  public constructor(props: ObservabilityBoundaryProps) {
    super(props);

    this.state = {
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureBarklogError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
      level: 'fatal',
      source: 'react_error_boundary',
    });
  }

  public render() {
    const { children } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>BarkLog recovered</Text>
          <Text style={styles.title}>Something interrupted this screen.</Text>
          <Text style={styles.body}>
            Your local logs remain on this device. The issue was recorded for
            review.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
