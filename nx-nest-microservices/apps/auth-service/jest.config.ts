export default {
  displayName: 'auth-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json' }]
  },
  moduleNameMapper: {
    '^@ecommerce/(.*)$': '<rootDir>/../../libs/$1/src/index.ts'
  }
};
