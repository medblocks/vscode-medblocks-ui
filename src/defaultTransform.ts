

export type TransformFunction = (leaf: { path: string, rmType: string, [other: string]: any }) => { html: string, name: string }[]


const transform: TransformFunction = (leaf) => {
	switch (leaf.rmType) {
		case 'DV_QUANTITY':
			return [{
				name: 'mb-quantity',
				html: `<mb-quantity path="${leaf.path}" default="kg" label="${leaf.name}">
				${leaf.inputs[1].list.map(unit => `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`).join('\n')}
			</mb-quantity>`
			}
			]
		default:
			return []
	}

}


export default transform