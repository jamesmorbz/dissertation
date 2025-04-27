export default {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Setup files to run before Jest is loaded
  setupFiles: ['<rootDir>/jest.textencoder.setup.js'],

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Module name mapper to handle aliases and static assets
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle module aliases - adjust this to match your Vite aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Transform files with ts-jest for TypeScript support
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        useESM: true,
        diagnostics: {
          warnOnly: true, // Only warn about TS errors, don't fail the test
        },
      },
    ],
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],

  // For ES modules support
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
};
