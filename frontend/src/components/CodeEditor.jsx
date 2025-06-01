// CodeEditor.js
import React, { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; // Light theme

export default function CodeEditor({value, onChange}) {
  // const [code, setCode] = useState('you can write your code here');

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow h-full overflow-auto">
      <div className="text-lg font-semibold mb-2 text-gray-800">Code Editor</div>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, languages.javascript)}
        padding={12}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          backgroundColor: "#f3f4f6",
          minHeight: "400px",
          whiteSpace: "pre-wrap",
          outline: "none",
        }}
      />
    </div>
  );
}
