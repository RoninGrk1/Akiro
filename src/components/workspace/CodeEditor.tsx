"use client";

import { useCallback, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  monacoLanguage,
  type SampleLanguage,
} from "@/lib/workspace/sample-project";

const AKIRO_THEME = "akiro-dark";

export type CodeEditorProps = {
  path: string | null;
  value: string;
  language: SampleLanguage;
  onChange: (value: string) => void;
};

function registerSolidity(monaco: typeof import("monaco-editor")) {
  if (monaco.languages.getLanguages().some((l) => l.id === "sol")) return;

  monaco.languages.register({ id: "sol" });
  monaco.languages.setMonarchTokensProvider("sol", {
    keywords: [
      "pragma",
      "solidity",
      "contract",
      "interface",
      "library",
      "function",
      "modifier",
      "event",
      "struct",
      "enum",
      "mapping",
      "public",
      "private",
      "internal",
      "external",
      "view",
      "pure",
      "payable",
      "returns",
      "return",
      "if",
      "else",
      "for",
      "while",
      "emit",
      "require",
      "assert",
      "revert",
      "import",
      "is",
      "memory",
      "storage",
      "calldata",
      "indexed",
      "anonymous",
      "override",
      "virtual",
      "constant",
      "immutable",
      "unchecked",
      "new",
      "delete",
      "true",
      "false",
    ],
    typeKeywords: [
      "address",
      "bool",
      "string",
      "bytes",
      "uint",
      "uint256",
      "uint8",
      "int",
      "int256",
      "bytes32",
    ],
    operators: ["=", ">", "<", "!", "+", "-", "*", "/", "%", "&", "|", "^", "?", ":"],
    symbols: /[=><!~?:&|+\-*/^%]+/,
    tokenizer: {
      root: [
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@typeKeywords": "type",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
        [/[{}()[\]]/, "@brackets"],
        [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
        [/\d+_?\d*\.\d*/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
    },
  });
}

function defineTheme(monaco: typeof import("monaco-editor")) {
  monaco.editor.defineTheme(AKIRO_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6B737A" },
      { token: "keyword", foreground: "3478F6" },
      { token: "type", foreground: "22E676" },
      { token: "string", foreground: "D9A441" },
      { token: "number", foreground: "22E676" },
      { token: "identifier", foreground: "E8ECEF" },
    ],
    colors: {
      "editor.background": "#080B0D",
      "editor.foreground": "#E8ECEF",
      "editorLineNumber.foreground": "#6B737A",
      "editorLineNumber.activeForeground": "#9AA3AB",
      "editor.selectionBackground": "#3478F640",
      "editor.lineHighlightBackground": "#0E1317",
      "editorCursor.foreground": "#22E676",
      "editorIndentGuide.background": "#1A242C",
      "editorIndentGuide.activeBackground": "#24303A",
      "editorWidget.background": "#141B21",
      "editorWidget.border": "#24303A",
      "input.background": "#0E1317",
      "dropdown.background": "#141B21",
    },
  });
}

export function CodeEditor({ path, value, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback((ed, monaco) => {
    editorRef.current = ed;
    registerSolidity(monaco);
    defineTheme(monaco);
    monaco.editor.setTheme(AKIRO_THEME);
  }, []);

  if (!path) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-muted">
        Select a file to edit
      </div>
    );
  }

  const lang = monacoLanguage(language);

  return (
    <div className="h-full min-h-0 w-full">
      <Editor
        height="100%"
        path={path}
        language={lang}
        value={value}
        theme={AKIRO_THEME}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Loading editor…
          </div>
        }
        options={{
          fontSize: 13,
          fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12 },
          renderLineHighlight: "line",
          smoothScrolling: true,
          ariaLabel: `Editor for ${path}`,
        }}
      />
    </div>
  );
}
