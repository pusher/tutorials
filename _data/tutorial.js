const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Contentful gives 100 entries at a time, we have more than that so have to get all of them

module.exports = async () => {
  // Find out how many we have in total
  const { total } = await client.getEntries({
    content_type: "post",
    limit: 1,
  });

  // Make array getEntries async functions
  let pendingGetEntries = [];
  for (let fetched = 0; fetched < total; fetched += 100) {
    pendingGetEntries.push(async () => {
      const entries = await client.getEntries({
        content_type: "post",
        order: "-fields.reviewDate",
        skip: fetched,
      });

      return entries.items.map((tutorials) => {
        tutorials.fields.tags = tutorials.fields.tags.map(
          (tag) => tag.fields.name
        );
        return tutorials.fields;
      });
    });
  }

  // Run each getEntries function and wait for all to resolve
  const completedEntriesBatches = await Promise.all(
    pendingGetEntries.map((f) => f())
  );

  // Transform [[{...}, {...}], [{...}, {...}]]
  // to [{...}, {...}, {...}, {...}]
  return completedEntriesBatches.reduce((a, b) => a.concat(b), []);
};
