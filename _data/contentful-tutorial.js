const contentful = require("contentful");
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
});

// Contentful gives 100 entries at a time, we have more than that so have to get all of them

module.exports = async () => {
  // find out how many we have in total
  const { total } = await client.getEntries({
    content_type: "post",
    limit: 1,
  });

  // Make x requests to Contentful for each batch of entries
  const arrayOfGetEntriesPromises = [...Array(Math.ceil(total / 100))].map(
    async (_, i) => {
      const entries = await client.getEntries({
        content_type: "post",
        order: "sys.createdAt",
        skip: 100 * i,
      });

      return entries.items.map((tutorials) => {
        tutorials.fields.date = new Date(tutorials.sys.updatedAt);
        return tutorials.fields;
      });
    }
  );

  const arrayOfEntriesBatches = await Promise.all(arrayOfGetEntriesPromises);

  // Transform [[{...}, {...}], [{...}, {...}]]
  // to [{...}, {...}, {...}, {...}]
  const allTutorials = arrayOfEntriesBatches.reduce((a, b) => a.concat(b), []);

  return allTutorials;
};
