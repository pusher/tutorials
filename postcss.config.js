const postcssPresetEnv = require("postcss-preset-env");
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-nested"),
    require("postcss-easing-gradients"),
    postcssPresetEnv(),
    ...(process.env.NODE_ENV === "production"
      ? [
          purgecss({
            content: ["_site/**/*.html"],
          }),
          require("cssnano"),
        ]
      : []),
  ],
};
