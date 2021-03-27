import { TextEditor, Position, window } from 'vscode';

const insertText = (text: string): void => {
	const activeTextEditor: TextEditor | undefined = window.activeTextEditor;

	if (!activeTextEditor) return;

	activeTextEditor.edit(
		edit => activeTextEditor.selections.map(
			selection => {
				edit.delete(selection);
				edit.insert(selection.start, `${text}`);
			}
		)
	);
};
export {
	insertText
};