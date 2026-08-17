import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write publication content here...',
  minHeight = '140px',
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-brand-blue underline hover:text-brand-blue-dark transition-colors cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor is empty (e.g. <p></p>), pass empty string or html
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none p-3 text-xs focus:outline-none focus:ring-0 ${minHeight} overflow-y-auto`,
      },
    },
  });

  // Keep editor content in sync when value changes from outside (e.g. selecting another item)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && !(value === '' && currentHtml === '<p></p>')) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full border border-line rounded-lg bg-slate-50 p-3 text-xs text-slate-400 animate-pulse">
        Loading rich text editor...
      </div>
    );
  }

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setIsLinkModalOpen(true);
  };

  const saveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^\//.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="w-full border border-line rounded-lg bg-white overflow-hidden focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue transition-all">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 border-b border-line text-slate-700 select-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-line">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings & Paragraph */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Normal Paragraph"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('paragraph') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (H2)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3 (H3)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            title="Heading 4 (H4)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 4 }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Heading4 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Basic Inline Styles */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('bold') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('italic') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('underline') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('strike') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Blockquote */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bulleted List"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('bulletList') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('orderedList') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('blockquote') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Links & Clear Formatting */}
        <div className="flex items-center gap-0.5 pl-1.5">
          <button
            type="button"
            onClick={handleSetLink}
            title="Insert / Edit Hyperlink"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('link') ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={removeLink}
              title="Remove Hyperlink"
              className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Remove Formatting"
            className="p-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer text-slate-500"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[120px] bg-white">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div className="absolute top-3 left-3 text-slate-400 text-xs pointer-events-none italic font-sans">
            {placeholder}
          </div>
        )}
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={saveLink} className="bg-white border border-line rounded-xl shadow-xl p-4 w-full max-w-sm space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-brand-blue" /> Insert Hyperlink
            </h4>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="E.g., https://example.com/document.pdf"
              autoFocus
              className="w-full text-xs p-2.5 border border-line rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-mono font-bold bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark cursor-pointer shadow-xs"
              >
                Apply Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
