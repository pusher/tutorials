const contentful = require("contentful");
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
});
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

module.exports = async () => {
  return client
    .getEntries({ content_type: "post", order: "sys.createdAt" })
    .then(function (response) {
      console.log(">>>", response.items[response.items.length - 1]);
      const tutorials = response.items.map(function (tutorials) {
        tutorials.fields.date = new Date(tutorials.sys.updatedAt);
        return tutorials.fields;
      });
      return tutorials;
    })
    .catch(console.error);
};
