import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FaBold, FaItalic, FaUndo, FaRedo, FaHeading, FaListUl, FaQuoteRight,
  FaImage, FaLink, FaSave
} from 'react-icons/fa';
import 'tailwindcss/tailwind.css';
import 'github-markdown-css';

// Render individual headings with adjusted sizes
const renderHeading1 = ({ children }) => <h1 className="font-bold text-4xl">{children}</h1>;
const renderHeading2 = ({ children }) => <h2 className="font-bold text-3xl">{children}</h2>;
const renderHeading3 = ({ children }) => <h3 className="font-bold text-2xl">{children}</h3>;
const renderHeading4 = ({ children }) => <h4 className="font-bold text-xl">{children}</h4>;
const renderHeading5 = ({ children }) => <h5 className="font-bold text-lg">{children}</h5>;
const renderHeading6 = ({ children }) => <h6 className="font-bold text-base">{children}</h6>;

// Editor component
const Editor = () => {
  const [markdown, setMarkdown] = useState(`# Your Project

Welcome to your project
![Alt Text](https://via.placeholder.com/400x200)

---

## Features
### Secure Authentication
Project uses token-based authentication to ensure secure access for administrators. Login sessions are maintained using JSON Web Tokens (JWT) stored in local storage.

### User-Friendly Interface
Project features an intuitive interface with a dedicated admin dashboard, real-time status.

---

## Technologies
### Frontend
- React.js

## Getting Started
### Prerequisites
Before getting started with Project, ensure you have:
- Node.js installed on your system.

### Frontend Setup
1. Navigate to the \`frontend\` directory:
    \`\`\`
    cd frontend
    \`\`\`
2. Install frontend dependencies with:
    \`\`\`
    npm install
    \`\`\`
3. Start the frontend server using:
    \`\`\`
    npm run dev
    \`\`\`
`);

  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const [history, setHistory] = useState([markdown]);
  const [historyStep, setHistoryStep] = useState(0);

  // Apply styling to selected text
  const applyStyle = (prefix, suffix = '', isToggle = false) => {
    const editor = editorRef.current;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    let newText = '';

    if (isToggle) {
      const isStyled = selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
      newText = isStyled
        ? selectedText.slice(prefix.length, selectedText.length - suffix.length)
        : `${prefix}${selectedText}${suffix}`;
    } else {
      newText = `${prefix}${selectedText}${suffix}`;
    }

    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  // Toggle styles
  const toggleBold = () => applyStyle('**', '**', true);
  const toggleItalic = () => applyStyle('_', '_', true);
  const toggleHeading = (level) => {
    const editor = editorRef.current;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const headingPrefix = '#'.repeat(level) + ' ';
    const currentHeadingLevel = selectedText.match(/^#+ /);
    const isHeading = currentHeadingLevel && currentHeadingLevel[0].length === headingPrefix.length;
    const newText = isHeading
      ? selectedText.slice(headingPrefix.length)
      : `${headingPrefix}${selectedText.replace(/^#+ /, '')}`;
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  const toggleUnorderedList = () => applyStyle('- ', '', true);
  const toggleQuote = () => applyStyle('> ', '', true);

  // Insert Image
  const insertImage = () => {
    const url = prompt('Enter image URL (e.g., https://via.placeholder.com/200x200)');
    if (url) {
      const editor = editorRef.current;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const newText = `![Alt Text](${url})`;
      const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
      setMarkdown(newMarkdown);
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + 2, start + 10); // Position cursor between [Alt Text]
      }, 0);
    }
  };

  // Insert Link
  const insertLink = () => {
    const url = prompt('Enter URL');
    if (url) {
      const editor = editorRef.current;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selectedText = editor.value.substring(start, end);
      const newText = `[${selectedText}](${url})`;
      const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
      setMarkdown(newMarkdown);
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + 1, start + 1 + selectedText.length); // Position cursor inside link text
      }, 0);
    }
  };

  // Save Markdown file
  const saveMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Undo/Redo History
  const undo = () => {
    if (historyStep > 0) {
      setMarkdown(history[historyStep - 1]);
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setMarkdown(history[historyStep + 1]);
      setHistoryStep(historyStep + 1);
    }
  };

  useEffect(() => {
    if (history[historyStep] !== markdown) {
      setHistory([...history.slice(0, historyStep + 1), markdown]);
      setHistoryStep(historyStep + 1);
    }
  }, [markdown]);

  // Synchronize scrolling between editor and preview
  useEffect(() => {
    const handleScroll = () => {
      const editor = editorRef.current;
      const preview = previewRef.current;
      if (editor && preview) {
        const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
      }
    };

    const editor = editorRef.current;
    editor.addEventListener('scroll', handleScroll);

    return () => {
      editor.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      <div className="flex flex-col justify-center items-center p-2 bg-gray-800 border-b border-gray-600">
        <div className="text-4xl font-light mb-4 mt-2 text-cyan-400">GitHub Readme Builder</div>
        <div className="flex flex-wrap justify-center items-center space-x-3 mb-2">
          <button onClick={() => toggleHeading(1)} title="Heading 1" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-3xl" />
              <sub className="text-sm mt-2">1</sub>
            </div>
          </button>
          <button onClick={() => toggleHeading(2)} title="Heading 2" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-2xl" />
              <sub className="text-sm mt-2">2</sub>
            </div>
          </button>
          <button onClick={() => toggleHeading(3)} title="Heading 3" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-xl" />
              <sub className="text-sm mt-2">3</sub>
            </div>
          </button>
          <button onClick={() => toggleHeading(4)} title="Heading 4" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-lg" />
              <sub className="text-sm mt-2">4</sub>
            </div>
          </button>
          <button onClick={() => toggleHeading(5)} title="Heading 5" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-base" />
              <sub className="text-sm mt-2">5</sub>
            </div>
          </button>
          <button onClick={() => toggleHeading(6)} title="Heading 6" className="text-xl hover:transition">
            <div className="flex items-center">
              <FaHeading className="text-sm" />
              <sub className="text-sm mt-2">6</sub>
            </div>
          </button>
          <button onClick={toggleBold} title="Bold" className="text-xl hover:transition"><FaBold /></button>
          <button onClick={toggleItalic} title="Italic" className="text-xl hover:transition"><FaItalic /></button>
          <button onClick={toggleUnorderedList} title="Unordered List" className="text-xl hover:transition"><FaListUl /></button>
          <button onClick={toggleQuote} title="Quote" className="text-xl hover:transition"><FaQuoteRight /></button>
          <button onClick={insertImage} title="Image" className="text-xl hover:transition"><FaImage /></button>
          <button onClick={insertLink} title="Link" className="text-xl hover:transition"><FaLink /></button>
          <button onClick={undo} title="Undo" className="text-xl hover:transition"><FaUndo /></button>
          <button onClick={redo} title="Redo" className="text-xl hover:transition"><FaRedo /></button>
          <button
            onClick={saveMarkdown}
            className="bg-cyan-700 hover:bg-cyan-800 text-white text-md py-2 px-4 rounded-full flex items-center"
          >
            <FaSave className="mr-2 text-xl" />
            Download
          </button>

        </div>
      </div>
      <div className="flex flex-grow h-full">
        <textarea
          ref={editorRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-1/2 h-full p-4 bg-gray-800 text-gray-100 border-r border-gray-600 outline-none resize-none"
        />
        <div
          ref={previewRef}
          className="w-1/2 h-full p-4 bg-gray-900 text-gray-100 overflow-y-auto markdown-body"
        >
          <ReactMarkdown
            children={markdown}
            components={{
              h1: renderHeading1,
              h2: renderHeading2,
              h3: renderHeading3,
              h4: renderHeading4,
              h5: renderHeading5,
              h6: renderHeading6,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
