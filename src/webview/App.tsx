import React, { useState, useEffect, useCallback } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { usePostMessage } from './hooks/usePostMessage.js';
import { Toolbar } from './components/Toolbar.js';
import { Palette } from './components/Palette.js';
import { ExportModal } from './components/ExportModal.js';
import { createNode, connectNodes } from '../core/mutator.js';
import { NodeType, DiagramSpec } from '../core/schema.js';

export const App: React.FC = () => {
  const { diagram, lastActor, dispatchChanges, triggerAutoLayout } = usePostMessage();
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));

  const handleAddNode = useCallback(
    (type: NodeType, label: string) => {
      if (!diagram) return;
      const x = 150 + Math.random() * 200;
      const y = 150 + Math.random() * 200;
      const { diagram: updated } = createNode(
        diagram,
        { type, label, x, y },
        'human'
      );
      dispatchChanges(updated);
    },
    [diagram, dispatchChanges]
  );

  const handleUndo = useCallback(() => {
    // Undo handling
  }, []);

  const handleRedo = useCallback(() => {
    // Redo handling
  }, []);

  const handleExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      switch (e.key.toUpperCase()) {
        case 'V':
          setActiveTool('select');
          break;
        case 'S':
          handleAddNode('service', 'Service');
          break;
        case 'D':
          handleAddNode('database', 'Database');
          break;
        case 'C':
          handleAddNode('cache', 'Cache');
          break;
        case 'Q':
          handleAddNode('queue', 'Queue');
          break;
        case 'G':
          handleAddNode('boundary', 'VPC Boundary');
          break;
        case 'A':
          setActiveTool('connector');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddNode]);

  return (
    <div className="canvas-container">
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onApplyLayout={() => triggerAutoLayout('left-to-right')}
        onExport={handleExport}
        lastActor={lastActor}
      />

      <Palette
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onAddNode={handleAddNode}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        diagram={diagram}
      />

      <div style={{ width: '100%', height: '100%' }}>
        <Tldraw store={store} />
      </div>
    </div>
  );
};
