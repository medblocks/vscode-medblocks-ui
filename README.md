# Medblocks UI VSCode Extension

This extension is to help develop fast development of openEHR templates.

## Setup
1. Have a directory with all your webtemplates
2. Open the medblocks-ui panel and explore the web template and copy paste snippets

## Configuration
If you are using different web-component or want to include extra components, add a `medblocksui.config.js` file and add all the transformations like so

```js
module.exports.default = function transform(leaf) {
    switch (leaf.rmType) {
        case 'DV_QUANTITY':
            return [{
                name: 'mb-quantity',
                html: `<mb-quantity path="${leaf.path}" default="kg" label="${leaf.name}">
				${leaf.inputs[1].list.map(unit => `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`).join('\n')}
			</mb-quantity>`
            },
            {
                name: 'extra-quantity',
                html: 'another'
            }
            ]
        case 'DV_CODED_TEXT':
            return [
                {
                    name: 'My coded text component',
                    html: '<mb-coded></mb-coded>'
                }
            ]
        default:
            return []
    }
}
```