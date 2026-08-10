import { StyledEditorToolbar } from './styles';

// ----------------------------------------------------------------------

const HEADINGS = ['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'];

export const formats = [
  'align',
  'background',
  'blockquote',
  'bold',
  'bullet',
  'code',
  'code-block',
  'color',
  'direction',
  'font',
  'formula',
  'header',
  'image',
  'indent',
  'italic',
  'link',
  'list',
  'script',
  'size',
  'strike',
  'table',
  'better-table', // Added better-table format
  'underline',
  'video',
];

type EditorToolbarProps = {
  id: string;
  isSimple?: boolean;
};

export default function Toolbar({ id, isSimple, ...other }: EditorToolbarProps) {
  return (
    <StyledEditorToolbar {...other}>
      <div id={id}>
        <div className="ql-formats">
          <select className="ql-header" defaultValue="">
            {HEADINGS.map((heading, index) => (
              <option key={heading} value={index + 1}>
                {heading}
              </option>
            ))}
            <option value="">Normal</option>
          </select>
        </div>

        <div className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
          <button type="button" className="ql-underline" />
          <button type="button" className="ql-strike" />
        </div>

        Table Buttons
        <div className="ql-formats">
          <button type="button" className="ql-insert-table" data-value="3x3">
            Table
          </button>
          <button type="button" className="ql-insert-column" data-value="right">
            + Column
          </button>
          <button type="button" className="ql-insert-row" data-value="below">
            + Row
          </button>
          <button type="button" className="ql-delete-column">
            - Column
          </button>
          <button type="button" className="ql-delete-row">
            - Row
          </button>
          <button type="button" className="ql-delete-table">
            Delete Table
          </button>
        </div>

        {!isSimple && (
          <div className="ql-formats">
            <select className="ql-color" />
            <select className="ql-background" />
          </div>
        )}

        <div className="ql-formats">
          <button type="button" className="ql-list" data-value="ordered" />
          <button type="button" className="ql-list" data-value="bullet" />
          {!isSimple && <button type="button" className="ql-indent" data-value="-1" />}
          {!isSimple && <button type="button" className="ql-indent" data-value="+1" />}
        </div>

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-script" data-value="super" />
            <button type="button" className="ql-script" data-value="sub" />
          </div>
        )}

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-code-block" />
            <button type="button" className="ql-blockquote" />
          </div>
        )}

        <div className="ql-formats">
          <button type="button" className="ql-direction" data-value="rtl" />
          <select className="ql-align" />
        </div>

        <div className="ql-formats">
          <button type="button" className="ql-link" />
          <button type="button" className="ql-image" />
          <button type="button" className="ql-video" />
        </div>

        <div className="ql-formats">
          {!isSimple && <button type="button" className="ql-formula" />}
          <button type="button" className="ql-clean" />
        </div>
      </div>
    </StyledEditorToolbar>
  );
}
