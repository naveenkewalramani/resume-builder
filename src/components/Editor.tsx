'use client';

import { EditorPanel } from './editor/EditorPanel';
import { PreviewPanel } from './preview/PreviewPanel';
import { Toolbar } from './Toolbar';

export default function Editor() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <div className="w-[420px] shrink-0 min-h-0">
          <EditorPanel />
        </div>
        <div className="flex-1 min-h-0">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
