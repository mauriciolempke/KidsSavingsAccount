const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testMatch: ['**/tests/**/*.(spec|test).(ts|tsx)'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@persistence/(.*)$': '<rootDir>/src/persistence/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@state/(.*)$': '<rootDir>/src/state/$1'
  }
};

module.exports = createJestConfig(customJestConfig);


