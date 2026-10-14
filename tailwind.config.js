module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#091815",
        surface: "#122621",
        gold: "#D6BE85",
        ink: "#F4F2EA",
        muted: "#A6B8AE",
      },
    },
  },
  plugins: [],
};
