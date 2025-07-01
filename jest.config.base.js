module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|tests|test).+(ts|tsx|js)'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
}
