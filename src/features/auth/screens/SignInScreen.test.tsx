/* eslint-disable global-require, import/no-extraneous-dependencies, no-console, testing-library/await-async-query, testing-library/render-result-naming-convention */
import { useRouter } from 'expo-router';
import { type ReactElement } from 'react';

import { signInWithEmailPassword } from '@/api';
import { useAuthSessionStore } from '@/stores';

import {
  makeDogRow,
  makeSession,
  makeUserRow,
} from '../../../../test/utils/builders';
import SignInScreen from './SignInScreen';

type TestInstance = {
  children: unknown[];
  findAll: (predicate: (node: TestInstance) => boolean) => TestInstance[];
  findByProps: (props: Record<string, unknown>) => TestInstance;
  props: Record<string, unknown>;
  type: unknown;
};

type TestRendererInstance = {
  root: TestInstance;
  unmount: () => void;
};

const TestRenderer = require('react-test-renderer') as {
  act: (callback: () => Promise<void> | void) => Promise<void> | void;
  create: (element: ReactElement) => TestRendererInstance;
};

const { act } = TestRenderer;

const originalConsoleError = console.error;
const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowWarning = jest.fn();

jest.mock('react-native', () => {
  const React = require('react');

  const createHostComponent =
    (name: string) =>
    ({ children, ...props }: { children?: unknown }) =>
      React.createElement(name, props, children);

  return {
    Platform: {
      select: (options: Record<string, unknown>) =>
        options.ios ?? options.default ?? null,
    },
    Pressable: createHostComponent('Pressable'),
    StyleSheet: {
      create: (styles: unknown) => styles,
      hairlineWidth: 1,
    },
    Text: createHostComponent('Text'),
    TextInput: createHostComponent('TextInput'),
    View: createHostComponent('View'),
  };
});

jest.mock('@/api', () => ({
  signInWithEmailPassword: jest.fn(),
}));

jest.mock('@/components/ui', () => ({
  BarklogStatusBanner: ({
    description,
    title,
  }: {
    description?: string;
    title: string;
  }) => {
    const React = require('react');

    return React.createElement(
      'View',
      null,
      React.createElement('Text', null, title),
      description ? React.createElement('Text', null, description) : null,
    );
  },
  useBarklogFeedback: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess,
    showWarning: mockShowWarning,
  }),
}));

jest.mock('@/managers/HapticManager', () => ({
  __esModule: true,
  default: {
    error: jest.fn(async () => undefined),
    success: jest.fn(async () => undefined),
    warning: jest.fn(async () => undefined),
  },
}));

jest.mock('../components/AuthIcons', () => ({
  EyeOffIcon: () => {
    const React = require('react');

    return React.createElement('Text', null, 'eye');
  },
}));

jest.mock('../components/AuthLayout', () => {
  const React = require('react');

  return {
    AuthLayout: ({
      children,
      subtitle,
      title,
    }: {
      children: unknown;
      subtitle: string;
      title: string;
    }) =>
      React.createElement(
        'View',
        null,
        React.createElement('Text', null, title),
        React.createElement('Text', null, subtitle),
        children,
      ),
  };
});

jest.mock('../../../components/ui/PrimaryButton', () => {
  const React = require('react');

  return {
    PrimaryButton: ({
      disabled,
      label,
      onPress,
    }: {
      disabled?: boolean;
      label: string;
      onPress: () => void;
    }) =>
      React.createElement(
        'Pressable',
        {
          accessibilityLabel: label,
          accessibilityRole: 'button',
          disabled,
          onPress,
        },
        React.createElement('Text', null, label),
      ),
  };
});

function renderSignInScreen() {
  let renderer: TestRendererInstance | undefined;

  act(() => {
    renderer = TestRenderer.create(<SignInScreen />);
  });

  if (!renderer) {
    throw new Error('Sign-in screen did not render');
  }

  return renderer;
}

function unmountScreen(renderer: TestRendererInstance) {
  act(() => {
    renderer.unmount();
  });
}

function getTextCount(root: TestInstance, text: string) {
  return root.findAll(
    (node) => node.type === 'Text' && node.children.includes(text),
  ).length;
}

async function fillInput(
  root: TestInstance,
  placeholder: string,
  value: string,
) {
  const input = root.findByProps({ placeholder });
  const onChangeText = input.props.onChangeText as (nextValue: string) => void;

  await act(async () => {
    onChangeText(value);
  });
}

async function pressButton(root: TestInstance, label: string) {
  const button = root.findByProps({ accessibilityLabel: label });
  const onPress = button.props.onPress as () => void;

  await act(async () => {
    onPress();
    await Promise.resolve();
  });
}

describe('SignInScreen', () => {
  beforeEach(() => {
    useAuthSessionStore.setState(useAuthSessionStore.getInitialState(), true);
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      if (
        typeof message === 'string' &&
        message.includes('react-test-renderer is deprecated')
      ) {
        return;
      }

      originalConsoleError(message, ...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows feedback for missing credentials without routing', async () => {
    const router = useRouter();
    const screen = renderSignInScreen();

    await pressButton(screen.root, 'Sign in');

    expect(signInWithEmailPassword).not.toHaveBeenCalled();
    expect(mockShowWarning).toHaveBeenCalledWith({
      description: 'Enter your email and password to continue',
      title: 'Sign-in needs details',
    });
    expect(
      getTextCount(screen.root, 'Enter your email and password to continue'),
    ).toBe(1);
    expect(router.replace).not.toHaveBeenCalled();

    unmountScreen(screen);
  });

  it('shows failed sign-in feedback without routing', async () => {
    const router = useRouter();

    jest
      .mocked(signInWithEmailPassword)
      .mockRejectedValueOnce(new Error('Invalid email or password'));

    const screen = renderSignInScreen();

    await fillInput(screen.root, 'name@example.com', 'caregiver@example.com');
    await fillInput(screen.root, 'password', 'wrong-pass');
    await pressButton(screen.root, 'Sign in');

    expect(mockShowError).toHaveBeenCalledWith({
      description: 'Invalid email or password',
      title: 'Sign-in failed',
    });
    expect(getTextCount(screen.root, 'Invalid email or password')).toBe(1);
    expect(router.replace).not.toHaveBeenCalled();

    unmountScreen(screen);
  });

  it('routes an existing dog account to tabs after successful sign-in', async () => {
    const router = useRouter();

    jest.mocked(signInWithEmailPassword).mockResolvedValueOnce({
      barklogUser: makeUserRow(),
      contactPreferenceStatus: 'complete',
      dogs: [makeDogRow()],
      onboardingStatus: 'complete',
      session: makeSession(),
    });

    const screen = renderSignInScreen();

    await fillInput(screen.root, 'name@example.com', 'Caregiver@Example.com ');
    await fillInput(screen.root, 'password', 'valid-pass');
    await pressButton(screen.root, 'Sign in');

    expect(signInWithEmailPassword).toHaveBeenCalledWith({
      email: 'caregiver@example.com',
      password: 'valid-pass',
    });
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');

    unmountScreen(screen);
  });
});
