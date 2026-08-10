import { useRef } from 'react';
import JoditEditor from 'jodit-react';

interface EditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  config?: object;
}

export default function Editor({ id, value, onChange, error, helperText, config }: EditorProps) {
  const editor = useRef(null);

  return (
    <div>
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        onChange={(newContent: string) => {
          onChange(newContent); // JoditEditor expects only the content as the argument
        }}
      />
      {helperText && <p style={{ color: error ? 'red' : 'inherit' }}>{helperText}</p>}
    </div>
  );
}
