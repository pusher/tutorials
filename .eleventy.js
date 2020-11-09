require("dotenv").config();
const marked = require("marked");
const pluginTOC = require("eleventy-plugin-toc");
const { tags: CONTENTFUL_TAGS } = require("./tags.json");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3"],
    ul: true,
    wrapperClass: "toc-list",
  });

  eleventyConfig.addPassthroughCopy("css");

  eleventyConfig.addFilter("widont", (string) => {
    if (string) {
      return string.split(" ").length > 2
        ? string.replace(/\s([^\s<]+)\s*$/, "&nbsp;$1")
        : string;
    }
  });

  eleventyConfig.addFilter("markdown", (content) => {
    return marked(content);
  });

  eleventyConfig.addFilter("getValues", (contentfulObj) => {
    return contentfulObj.map((obj) => obj.fields.name).join(", ");
  });

  eleventyConfig.addFilter("readableDate", (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("extractTags", (string) => {
    const arrayOfNames = string.split(",").map((tag) => {
      return tag.trim();
    });
    return arrayOfNames
      .map((name) => CONTENTFUL_TAGS.filter((tag) => tag.name === name))
      .reduce((a, b) => a.concat(b), []);
  });

  CONTENTFUL_TAGS.forEach((tag) => {
    eleventyConfig.addCollection(tag.url, (collectionApi) => {
      const filtered = collectionApi
        .getFilteredByTag("tutorials")
        .filter((post) => post.data.tutorial.tags.includes(tag.name));

      return filtered;
    });
  });

  return {
    templateFormats: ["md", "html", "njk", "mjs"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,

    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
};
