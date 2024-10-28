import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { yCollab } from "y-codemirror.next";

const CollaborativeEditor = ({ roomName = "default-room" }) => {
  const [status, setStatus] = useState("connecting");
  const [editor, setEditor] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // Initialize Yjs document
    const yDoc = new Y.Doc();

    // Create WebSocket connection
    const wsProvider = new WebsocketProvider(
      "ws://localhost:3006",
      roomName,
      yDoc
    );

    // Get the shared text
    const yText = yDoc.getText("codemirror");

    // Create the editor
    const state = EditorState.create({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, wsProvider.awareness),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            // Handle document changes here if needed
          }
        }),
      ],
    });

    // Create and mount the editor
    const view = new EditorView({
      state,
      parent: document.querySelector("#editor-container"),
    });

    setEditor(view);
    setProvider(wsProvider);

    // Handle connection status
    wsProvider.on("status", ({ status }) => {
      setStatus(status);
    });

    // Cleanup
    return () => {
      view.destroy();
      wsProvider.destroy();
      yDoc.destroy();
    };
  }, [roomName]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Editor Container */}
      <div
        id="editor-container"
        className="border rounded-lg shadow-sm bg-white p-4"
        style={{ minHeight: "400px" }}
      />

      {/* Connected Users */}
      {provider && (
        <div className="mt-4 text-sm text-gray-600">
          Connected users: {provider.awareness.getStates().size}
        </div>
      )}
    </div>
  );
};

export default CollaborativeEditor;
