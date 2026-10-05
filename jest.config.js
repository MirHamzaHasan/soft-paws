module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',

    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm|@noble/hashes|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/db/events/createLocalEvent.ts',
    './src/db/sync/engine.ts',
    './src/db/sync/transport.ts',
    './src/features/export/utils/exportBuilders.ts',
    './src/features/auth/utils/authRouting.ts',
    './src/features/medications/utils/medicationSchedule.ts',
    './src/features/premium/data/premiumCatalog.ts',
    './src/features/premium/utils/premiumAccess.ts',
    './src/features/safety/data/toxicityDatabase.ts',
    './src/stores/useAuthSessionStore.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
};
