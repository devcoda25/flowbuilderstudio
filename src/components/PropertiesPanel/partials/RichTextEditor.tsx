
'use client';

import React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Table as TableIcon,
  Palette,
  Paperclip,
  Video,
  AudioLines,
  FileText,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';
import type { MediaPart } from '@/types/MediaPart';
import ImageComponent from 'next/image';
import styles from '../properties-panel.module.css';

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: string[];
  onAddMedia?: (type: 'image' | 'video' | 'audio' | 'document') => void;
  modalRef?: React.RefObject<HTMLDivElement | null>;
};


const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="w-8 h-8" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'mp3':
        case 'wav': return <AudioLines className="w-8 h-8 text-orange-500" />;
        case 'mp4':
        case 'mov': return <Video className="w-8 h-8 text-purple-500" />;
        default: return <FileText className="w-8 h-8 text-blue-500" />;
    }
};

const Toolbar = ({
  editor,
  variables,
  onAddMedia,
}: {
  editor: Editor | null;
  variables?: string[];
  onAddMedia?: (type: 'image' | 'video' | 'audio' | 'document') => void;
}) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleVariableInsert = (variable: string) => {
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  const handleMediaSelect = (type: 'image' | 'video' | 'audio' | 'document') => {
    onAddMedia?.(type);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" className="h-8 w-auto px-2 text-sm">
            {editor.isActive('heading', { level: 1 }) ? (
              <div className="flex items-center gap-2">
                <Heading1 className="h-4 w-4" /> Heading 1
              </div>
            ) : editor.isActive('heading', { level: 2 }) ? (
              <div className="flex items-center gap-2">
                <Heading2 className="h-4 w-4" /> Heading 2
              </div>
            ) : editor.isActive('heading', { level: 3 }) ? (
              <div className="flex items-center gap-2">
                <Heading3 className="h-4 w-4" /> Heading 3
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Pilcrow className="h-4 w-4" /> Normal
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            Normal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn('h-8 w-8', editor.isActive('bold') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn('h-8 w-8', editor.isActive('italic') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn('h-8 w-8', editor.isActive('underline') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn('h-8 w-8', editor.isActive('strike') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('h-8 w-8', editor.isActive('bulletList') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('h-8 w-8', editor.isActive('orderedList') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
       {variables && variables.length > 0 && (
        <VariableChipAutocomplete variables={variables} onInsert={handleVariableInsert} label="{{}}" />
      )}
       <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={setLink}
        className={cn('h-8 w-8', editor.isActive('link') ? 'is-active bg-accent text-accent-foreground' : '')}
        title="Set Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
       {onAddMedia && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Attach File" onClick={() => handleMediaSelect('image')}>
            <Paperclip className="h-4 w-4" />
          </Button>
      )}
       <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, placeholder, variables, onAddMedia, modalRef }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Underline,
      TextStyle,
      Color,
      CharacterCount.configure({
        limit: 1000,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false, 
        allowBase64: true,
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute('style'),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return { style: `max-width: 100%; height: auto; ${attributes.style}` };
              },
            },
          };
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) => element.getAttribute('data-background-color'),
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) {
                  return {};
                }
                return {
                  'data-background-color': attributes.backgroundColor,
                  style: `background-color: ${attributes.backgroundColor}`,
                };
              },
            },
          };
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base w-full max-w-full rounded-b-md border-0 bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]',
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring flex flex-col bg-background" contentEditable={false}>
      <Toolbar
        editor={editor}
        variables={variables}
        onAddMedia={onAddMedia}
      />
      <div className="flex-grow overflow-y-auto">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      <div className="text-right text-xs text-muted-foreground pr-2 pb-1">
        {editor?.storage.characterCount.characters() || 0} / 1000
      </div>
    </div>
  );
}
