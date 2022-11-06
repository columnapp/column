/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  // setupFilesAfterEnv: ['jest-expect-message'],
  testPathIgnorePatterns: ['/__fixtures__/', '/__utils__/', 'dist/'],
  modulePaths: ['<rootDir>'],
}
export default config
