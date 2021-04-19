# Medblocks UI VSCode Extension

This extension is to help develop fast development of openEHR templates.

## Setup

1. Have a directory with all your webtemplates
2. Open the medblocks-ui panel and explore the web template and copy paste snippets

## Configuration

If you are using different web-component or want to include extra components, add a `medblocksui.config.cjs` file and default export the transform function like so

```js
const transformations = {
  DV_QUANTITY: (leaf) => [
    {
      name: "mb-quantity",
      html: `<mb-quantity path="${leaf.path}" default="kg" label="${leaf.name}">
                ${leaf.inputs[1].list
                  .map(
                    (unit) =>
                      `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`
                  )
                  .join("\n")}
            </mb-quantity>`,
    },
  ],
  DV_CODED_TEXT: (leaf) => [
    {
      name: "My coded text component",
      html: "<mb-coded></mb-coded>",
    },
    {
      name: "My other coded text component",
      html: "<mb-coded></mb-coded>",
    },
    {
      name: "adding another",
      html: "nothing",
    },
    {
      name: "adding another",
      html: "nothing",
    },
    {
      name: "Nothing",
      html: "nothing",
    },
  ],
  DV_COUNT: (leaf) => [
    {
      name: "Count",
      html: "<count></count>",
    },
  ],
  DV_TEXT: (n) => [{ name: "dvtext", html: "<dv-text />" }],
};

module.exports.default = (leaf) => {
  const fn = transformations[leaf.rmType];
  if (fn) {
    return fn(leaf);
  }
  return [];
};
```

Hit the reload button to reload the configuration file.
