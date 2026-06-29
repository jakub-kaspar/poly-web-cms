module.exports = function (eleventyConfig) {

  // ── Pass-through static assets ──────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("main.js");
  eleventyConfig.addPassthroughCopy("i18n.js");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("references_graded");
  eleventyConfig.addPassthroughCopy("hormann_tiles");
  eleventyConfig.addPassthroughCopy("certs");
  eleventyConfig.addPassthroughCopy("lang");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("konfigurator.html");
  eleventyConfig.addPassthroughCopy("offers");
  eleventyConfig.addWatchTarget("konfigurator.html");

  // ── Source / output dirs ─────────────────────────────────────────────────────
  return {
    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      data:     "../_data",   // _data/ is at project root, not inside src/
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
  };
};
