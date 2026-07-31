import React from 'react';
import {
  Undo,
  Redo,
  Layout,
  Download,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onApplyLayout: () => void;
  onExport: () => void;
  lastActor?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onApplyLayout,
  onExport,
  lastActor,
}) => {
  return (
    <div className="toolbar-floating">
      <button
        className="toolbar-button"
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
        <span>Undo</span>
      </button>

      <button
        className="toolbar-button"
        onClick={onRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo size={14} />
        <span>Redo</span>
      </button>

      <div className="toolbar-divider" />

      <button
        className="toolbar-button primary"
        onClick={onApplyLayout}
        title="Auto-arrange graph layout with Dagre (Ctrl+Shift+L)"
      >
        <Layout size={14} />
        <span>Auto Layout</span>
      </button>

      <div className="toolbar-divider" />

      <button className="toolbar-button" onClick={onExport} title="Export diagram">
        <Download size={14} />
        <span>Export</span>
      </button>

      {lastActor && lastActor.startsWith('agent') && (
        <>
          <div className="toolbar-divider" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: '#3b82f6',
              fontWeight: 500,
            }}
          >
            <Sparkles size={13} className="ai-pulse" />
            <span>Updated by {lastActor}</span>
          </div>
        </>
      )}
    </div>
  );
};
