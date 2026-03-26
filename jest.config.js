module.exports = {
  // Indica que use el motor de pruebas de Expo
  preset: 'jest-expo',

  // IMPORTANTE: Aquí le decimos que ejecute tus mocks ANTES de los tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Esta sección evita que librerías nativas rompan el test
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|unimodules|react-navigation|@react-navigation|react-native-reanimated|@react-native-async-storage)',
  ],

  // Configuración de la tabla de cobertura (Coverage)
  collectCoverage: true,
  collectCoverageFrom: [
    'screens/**/*.js',    // Esto medirá tu HomeScreen
    'services/**/*.js',   // Esto medirá tu authService
    'hooks/**/*.js',      // Esto medirá tus hooks
    '!**/node_modules/**',
  ],

  // Indica dónde buscar los archivos de prueba
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Extensiones permitidas
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};