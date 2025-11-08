
const colors = require("@repo/tokens/build/tailwind.colors.json");
const spacing = require("@repo/tokens/build/tailwind.spacing.json");
const radii = require("@repo/tokens/build/tailwind.radii.json");
const shadows = require("@repo/tokens/build/tailwind.shadows.json");

module.exports = {
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radii,
      boxShadow: shadows,
      fontFamily: { sans: ["Inter","system-ui","sans-serif"] }
    }
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
