module.exports = {
  locales: ["en"],
  output: "src/locales/$LOCALE/$NAMESPACE.json",
  input: ["src/**/*.{ts,tsx}"],
  sort: true,
  createOldCatalogs: false,
  keepRemoved: false,
  defaultNamespace: "english",
  defaultValue: (locale, namespace, key) => key,
  indentation: 2,
  lineEnding: "auto",
}
