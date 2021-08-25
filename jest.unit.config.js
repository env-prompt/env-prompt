const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/test/unit/**/*.ts'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
  collectCoverage: true,
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!**/node_modules/**",
  ]
};
