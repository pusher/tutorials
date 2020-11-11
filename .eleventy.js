require("dotenv").config();
const marked = require("marked");
const markdownIt = require("markdown-it");
const pluginTOC = require("eleventy-plugin-toc");
const prism = require("markdown-it-prism");
const markdownItAnchor = require("markdown-it-anchor");

const { tags: CONTENTFUL_TAGS } = require("./tags.json");

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget("./_tmp/style.min.css");
  eleventyConfig.addPassthroughCopy({
    "./_tmp/style.min.css": "./css/style.min.css",
  });

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3"],
    ul: true,
    wrapperClass: "toc-list",
  });

  const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });

  md.use(prism, {
    defaultLanguage: "javascript",
    init: (Prism) => {
      Prism.languages["language-javascript"] = Prism.languages["javascript"];
      Prism.languages["language-js"] = Prism.languages["javascript"];
      Prism.languages["vue"] = Prism.languages["javascript"];
      Prism.languages["language-go"] = Prism.languages["go"];
      Prism.languages["language-php"] = Prism.languages["php"];
      Prism.languages["language-bash"] = Prism.languages["bash"];
      Prism.languages["language-shell"] = Prism.languages["shell"];
      Prism.languages["language-jsx"] = Prism.languages["javascript"];
      Prism.languages["language-typescript"] = Prism.languages["javascript"];
      Prism.languages["script"] = Prism.languages["javascript"];
      Prism.languages["xcode"] = Prism.languages["swift"];
      Prism.languages["language-swift"] = Prism.languages["swift"];
      Prism.languages["language-html"] = Prism.languages["html"];
      Prism.languages["language-json"] = Prism.languages["json"];
      Prism.languages["language-css"] = Prism.languages["css"];
      Prism.languages["language-java"] = Prism.languages["java"];
      Prism.languages["SQL"] = Prism.languages["sql"];
      Prism.languages["gradle"] = Prism.languages["xml"];
      Prism.languages["language-gradle"] = Prism.languages["xml"];
      Prism.languages["env"] = Prism.languages["markup"];
    },
  });

  md.use(markdownItAnchor, {
    level: [2, 3, 4, 5],
    permalink: true,
    permalinkClass: "link bn",
    permalinkSymbol: "∞",
    permalinkBefore: true,
  });

  //
  // Nunjucks filters
  //

  // MarkdownIt, which is 11ty’s default mardown parser
  // is used for the content as works with syntax highlighter
  eleventyConfig.addFilter("markdown", (content) => {
    const cleanedUp = content.replace(/``` c#/gi, "``` dotnet");
    return md.render(cleanedUp);
  });

  // BUT for the TOC we need to used Marked as that works with
  // the TOC plugin.
  eleventyConfig.addFilter("markdownTOC", (content) => {
    return marked(content);
  });

  eleventyConfig.addFilter("widont", (string) => {
    if (string) {
      return string.split(" ").length > 2
        ? string.replace(/\s([^\s<]+)\s*$/, "&nbsp;$1")
        : string;
    }
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

  //
  // Create collections of tutorials for each Contentful tag
  //

  CONTENTFUL_TAGS.forEach((tag) => {
    eleventyConfig.addCollection(tag.url, (collectionApi) => {
      const filtered = collectionApi
        .getFilteredByTag("tutorials")
        .filter((post) => post.data.tutorial.tags.includes(tag.name));

      return filtered;
    });
  });

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

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
