
'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import {TextStyle} from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
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
  AlignJustify,
  Image as ImageIcon,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Table as TableIcon,
  Palette,
  Parentheses,
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
import ImageAttachmentModal from './ImageAttachmentModal';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: string[];
};

const Toolbar = ({ editor, variables }: { editor: Editor | null, variables?: string[] }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  const handleImageSave = (media: any) => {
    if (media && media.url) {
      editor.chain().focus().setImage({ src: media.url, style: 'width: 20%' }).run();
    }
    setIsImageModalOpen(false);
  };
  
  const handleVariableInsert = (variable: string) => {
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
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
        <Separator orientation="vertical" className="h-6 mx-1" />
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => (document.querySelector('input[type=color][data-id=color-picker]') as HTMLInputElement)?.click()}
          title="Text Color"
        >
          <Palette className="h-4 w-4" />
          <input
            type="color"
            data-id="color-picker"
            className="sr-only"
            onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
          />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn('h-8 w-8', editor.isActive({ textAlign: 'left' }) ? 'is-active bg-accent text-accent-foreground' : '')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn('h-8 w-8', editor.isActive({ textAlign: 'center' }) ? 'is-active bg-accent text-accent-foreground' : '')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn('h-8 w-8', editor.isActive({ textAlign: 'right' }) ? 'is-active bg-accent text-accent-foreground' : '')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn('h-8 w-8', editor.isActive({ textAlign: 'justify' }) ? 'is-active bg-accent text-accent-foreground' : '')}
          title="Align Justify"
        >
          <AlignJustify className="h-4 w-4" />
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Unlink"
        >
          <Unlink className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsImageModalOpen(true)}
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Table options">
              <TableIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              Insert Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => (document.querySelector('input[type=color][data-id=table-cell-color-picker]') as HTMLInputElement)?.click()}
              disabled={!editor.can().setCellAttribute('backgroundColor', '#ffffff')}
            >
              Cell Background Color
              <input
                type="color"
                data-id="table-cell-color-picker"
                className="sr-only"
                onInput={(e) => editor.chain().focus().setCellAttribute('backgroundColor', e.currentTarget.value).run()}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              Delete Column
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().mergeOrSplit().run()}
              disabled={!editor.can().mergeOrSplit()}
            >
              Merge/Split Cell
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
              disabled={!editor.can().toggleHeaderColumn()}
            >
              Toggle Header Column
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              disabled={!editor.can().toggleHeaderRow()}
            >
              Toggle Header Row
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderCell().run()}
              disabled={!editor.can().toggleHeaderCell()}
            >
              Toggle Header Cell
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
            >
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {variables && variables.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <VariableChipAutocomplete variables={variables} onInsert={handleVariableInsert} />
          </>
        )}
      </div>
      <ImageAttachmentModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSave={handleImageSave}
        onDelete={() => { /* Not needed for new images */ }}
      />
    </>
  );
};

export default function RichTextEditor({ value, onChange, placeholder, variables }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The History extension is part of StarterKit
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'inline-block',
        },
      }).extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                style: {
                    default: null,
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
          'prose dark:prose-invert prose-sm sm:prose-base w-full max-w-full rounded-b-md border-0 bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring flex flex-col">
      <Toolbar editor={editor} variables={variables} />
      <div className="flex-grow overflow-y-auto min-h-[120px]">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
