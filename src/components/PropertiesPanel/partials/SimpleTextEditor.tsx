
'use client';

import React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, Code, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from './simple-text-editor.module.css';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';

type SimpleTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: string[];
};

const Toolbar = ({ editor, variables }: { editor: Editor | null; variables?: string[] }) => {
  if (!editor) return null;

  const handleVariableInsert = (variable: string) => {
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(styles.toolbarButton, { [styles.active]: editor.isActive('bold') })}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(styles.toolbarButton, { [styles.active]: editor.isActive('italic') })}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(styles.toolbarButton, { [styles.active]: editor.isActive('strike') })}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button type="button" className={styles.toolbarButton} title="Insert Variable">
          <Code size={16} />
        </button>
        <button type="button" className={styles.toolbarButton} title="Insert Emoji">
          <Smile size={16} />
        </button>
      </div>
      <div className={styles.toolbarRight}>
        {variables && <VariableChipAutocomplete variables={variables} onInsert={handleVariableInsert} label="Variables" />}
      </div>
    </div>
  );
};

export default function SimpleTextEditor({
  value,
  onChange,
  placeholder = 'default body',
  variables = [],
}: SimpleTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  React.useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} />
      <Toolbar editor={editor} variables={variables} />
    </div>
  );
}
