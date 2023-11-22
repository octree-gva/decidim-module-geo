module.exports = {
  useTabs: false,
  trailingComma: "none",
  tabWidth: 2,
  printWidth: 90,
  overrides: [
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        singleQuote: false
      }
    }
  ]
}