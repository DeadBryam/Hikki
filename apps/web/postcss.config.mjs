const config = {
  plugins: {
    "@tailwindcss/postcss": {
      sources: [
        {
          base: ".",
          negated: [],
          patterns: [
            "app/**/*.{ts,tsx}",
            "components/**/*.{ts,tsx}",
            "lib/**/*.{ts,tsx}",
          ],
        },
      ],
    },
  },
};

export default config;
