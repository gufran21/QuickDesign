import React from 'react';
import {
  Undo,
  Redo,
  Layout,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onApplyLayout: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  lastActor?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onApplyLayout,
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomFit,
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
        className="toolbar-button"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn size={14} />
      </button>

      <button
        className="toolbar-button"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut size={14} />
      </button>

      <button
        className="toolbar-button"
        onClick={onZoomFit}
        title="Zoom To Fit"
      >
        <Maximize2 size={14} />
        <span>Fit</span>
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
