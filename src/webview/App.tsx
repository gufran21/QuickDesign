import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Tldraw, Editor, createShapeId } from '@tldraw/tldraw';
import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite';
import '@tldraw/tldraw/tldraw.css';
import { usePostMessage } from './hooks/usePostMessage.js';
import { Toolbar } from './components/Toolbar.js';
import { Palette } from './components/Palette.js';
import { ExportModal } from './components/ExportModal.js';
import { createNode, connectNodes } from '../core/mutator.js';
import { NodeType, DiagramSpec, createEmptyDiagram } from '../core/schema.js';

export const App: React.FC = () => {
  const { diagram: initialDiagram, lastActor, dispatchChanges, triggerAutoLayout } = usePostMessage();
  const [diagram, setDiagram] = useState<DiagramSpec>(() => createEmptyDiagram('human'));
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const editorRef = useRef<Editor | null>(null);

  const assetUrls = useMemo(() => getAssetUrlsByImport(), []);

  // Sync diagram from postMessage
  useEffect(() => {
    if (initialDiagram) {
      setDiagram(initialDiagram);
    }
  }, [initialDiagram]);

  // Sync diagram nodes/edges into tldraw canvas
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !diagram) return;

    const currentShapes = editor.getCurrentPageShapes();
    const currentShapeIds = new Set(currentShapes.map((s) => s.id));

    const shapesToCreate: any[] = [];
    const shapesToUpdate: any[] = [];

    diagram.nodes.forEach((node) => {
      const shapeId = createShapeId(node.id);
      let geoType = 'rectangle';
      let colorType = 'blue';

      if (node.type === 'database') {
        geoType = 'cylinder';
        colorType = 'green';
      } else if (node.type === 'cache') {
        geoType = 'ellipse';
        colorType = 'violet';
      } else if (node.type === 'queue') {
        geoType = 'rhombus';
        colorType = 'orange';
      } else if (node.type === 'boundary') {
        geoType = 'cloud';
        colorType = 'grey';
      }

      const shapeProps = {
        id: shapeId,
        type: 'geo',
        x: node.x,
        y: node.y,
        props: {
          w: Math.max(node.w || 140, 120),
          h: Math.max(node.h || 60, 60),
          geo: geoType,
          color: colorType,
          text: node.label,
          font: 'mono',
          size: 'm',
        },
      };

      if (currentShapeIds.has(shapeId)) {
        shapesToUpdate.push(shapeProps);
      } else {
        shapesToCreate.push(shapeProps);
      }
    });

    if (shapesToCreate.length > 0) {
      editor.createShapes(shapesToCreate);
    }
    if (shapesToUpdate.length > 0) {
      editor.updateShapes(shapesToUpdate);
    }
  }, [diagram]);

  const handleAddNode = useCallback(
    (type: NodeType, label: string) => {
      const currentDiagram = diagram || createEmptyDiagram('human');
      const x = 200 + Math.random() * 250;
      const y = 150 + Math.random() * 250;
      const { diagram: updated } = createNode(
        currentDiagram,
        { type, label, x, y },
        'human'
      );
      setDiagram(updated);
      dispatchChanges(updated);
    },
    [diagram, dispatchChanges]
  );

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.redo();
    }
  }, []);

  const handleExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  // Keyboard shortcuts
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

      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Tldraw
          assetUrls={assetUrls as any}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};
