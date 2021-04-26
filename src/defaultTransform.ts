const transformations = {
  DV_QUANTITY: (n) => [
    {
      name: "Quantity",
      html: `<mb-quantity path="${n.path}" label="${n.name}">
                ${
                  n.inputs && n.inputs[1] && n.inputs[1].list
                    ? n.inputs[1].list
                        .map(
                          (unit) =>
                            `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`
                        )
                        .join("\n")
                    : ""
                }
            </mb-quantity>`,
    },
  ],
  DV_CODED_TEXT: (n) => [
    {
      name: "Select",
      html: `<mb-select path="${n.path}" label="${n.name || ""}">
            ${
              n.inputs && n.inputs[0] && n.inputs[0].list
                ? n.inputs[0].list
                    .map(
                      (option) =>
                        `<mb-option code="${option.value}" display="${option.label}"></mb-option>`
                    )
                    .join("\n")
                : ""
            }
          </mb-select>`,
    },
    {
      name: "Buttons",
      html: `<mb-buttons path="${n.path}">
      ${
        n.inputs && n.inputs[0] && n.inputs[0].list
          ? n.inputs[0].list
              .map(
                (option) =>
                  `<mb-option code="${option.value}" display="${option.label}"></mb-option>`
              )
              .join("\n")
          : ""
      }
      </mb-buttons>`,
    },
    {
      name: "Search",
      html: `<mb-search path="${n.path} label="${n.name || ""}">
        <mb-filter label="Conditions" filter="<404684003"></mb-filter>
      </mb-search>`,
    },
  ],
  DV_COUNT: (n) => [],
  DV_TEXT: (n) => [
    {
      name: "Input",
      html: `<mb-input path="${n.path}" label="${n.name || ""}"></mb-input>`,
    },
    {
      name: "Textarea",
      html: `<mb-input textarea path="${n.path}" label="${
        n.name || ""
      }"></mb-input>`,
    },
  ],
  DV_DATE_TIME: (n) => [
    {
      name: "Date & Time",
      html: `<mb-date time path="${n.path}" label="${n.name || ""}"></mb-date>`,
    },
    {
      name: "Date",
      html: `<mb-date path="${n.path}" label="${n.name || ""}"></mb-date>`,
    },
  ],
  DV_DATE: (n) => [
    {
      name: "Date",
      html: `<mb-date path="${n.path}" label="${n.name || ""}"></mb-date>`,
    },
  ],
  context: (n) => [
    { name: "Context", html: `<mb-context path=${n.path}></mb-context>` },
  ],
  // 'wrapper': (html) => `<div class="field">${html}</div>`
};

export default (leaf) => {
  if (leaf["inContext"]) {
    return transformations["context"](leaf);
  }
  const fn = transformations[leaf.rmType];
  if (fn) {
    const nodes = fn(leaf);
    const wrapper = transformations["wrapper"];
    if (wrapper) {
      return nodes.map((node) => ({ ...node, html: wrapper(node.html) }));
    }
    return nodes;
  }
  return [];
};
