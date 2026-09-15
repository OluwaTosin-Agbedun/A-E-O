import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
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
  Code,
  Table as TableIcon,
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
  const [isSourceMode, setIsSourceMode] = useState(false);

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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-slate-300 w-full my-3 text-xs',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 bg-slate-100 p-2 font-bold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2',
        },
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
    if (editor && value !== undefined && !isSourceMode) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && !(value === '' && currentHtml === '<p></p>')) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor, isSourceMode]);

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
            disabled={!editor.can().undo() || isSourceMode}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || isSourceMode}
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
            disabled={isSourceMode}
            title="Normal Paragraph"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('paragraph') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={isSourceMode}
            title="Heading 2 (H2)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('heading', { level: 2 }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={isSourceMode}
            title="Heading 3 (H3)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('heading', { level: 3 }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            disabled={isSourceMode}
            title="Heading 4 (H4)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('heading', { level: 4 }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
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
            disabled={isSourceMode}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('bold') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={isSourceMode}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('italic') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={isSourceMode}
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('underline') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={isSourceMode}
            title="Strikethrough"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('strike') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
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
            disabled={isSourceMode}
            title="Align Left"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive({ textAlign: 'left' }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            disabled={isSourceMode}
            title="Align Center"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive({ textAlign: 'center' }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            disabled={isSourceMode}
            title="Align Right"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive({ textAlign: 'right' }) && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
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
            disabled={isSourceMode}
            title="Bulleted List"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('bulletList') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={isSourceMode}
            title="Numbered List"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('orderedList') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={isSourceMode}
            title="Blockquote"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('blockquote') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
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
            disabled={isSourceMode}
            title="Insert / Edit Hyperlink"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('link') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive('link') && !isSourceMode && (
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
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={isSourceMode}
            title="Insert Table (3x3)"
            className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 ${
              editor.isActive('table') && !isSourceMode ? 'bg-brand-blue text-white' : 'hover:bg-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            disabled={isSourceMode}
            title="Remove Formatting"
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer text-slate-500"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* HTML Source Toggle Button */}
        <div className="ml-auto flex items-center pl-1.5 border-l border-line">
          <button
            type="button"
            onClick={() => {
              if (isSourceMode && editor) {
                editor.commands.setContent(value || '');
              }
              setIsSourceMode(!isSourceMode);
            }}
            title={isSourceMode ? "Switch to Visual WYSIWYG Editor" : "Switch to HTML Source Code Editor"}
            className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold ${
              isSourceMode 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isSourceMode ? 'Visual Mode' : 'HTML Mode'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[120px] bg-white">
        {isSourceMode ? (
          <div className="relative bg-slate-950 text-slate-100 font-mono text-xs">
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste or write raw HTML code here (e.g. <p>Paragraph with <b>bold</b>, <table>, <img>, etc.)..."
              style={{ minHeight }}
              className="w-full p-3 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y border-0 tracking-wide"
            />
            <div className="px-3 py-1 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between select-none">
              <span>HTML Source Code Mode Active (Full HTML markup supported)</span>
              <span>{value ? `${value.length} chars` : '0 chars'}</span>
            </div>
          </div>
        ) : (
          <>
            <EditorContent editor={editor} />
            {editor.isEmpty && (
              <div className="absolute top-3 left-3 text-slate-400 text-xs pointer-events-none italic font-sans">
                {placeholder}
              </div>
            )}
          </>
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

