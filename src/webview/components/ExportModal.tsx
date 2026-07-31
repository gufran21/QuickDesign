import React, { useState } from 'react';
import { Copy, Check, X, FileText, Download } from 'lucide-react';
import { DiagramSpec } from '../../core/schema.js';
import { exportToMermaid } from '../../core/mermaid.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramSpec | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  diagram,
}) => {
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  if (!isOpen || !diagram) return null;

  const mermaidText = exportToMermaid(diagram);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidText);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(diagram, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.sysd';
    a.click();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '520px',
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          color: 'var(--fg-primary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Export Diagram</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--fg-primary)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <label style={{ fontSize: '12px', fontWeight: 500 }}>
              Mermaid Syntax
            </label>
            <button
              onClick={handleCopyMermaid}
              className="toolbar-button primary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              {copiedMermaid ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedMermaid ? 'Copied!' : 'Copy Mermaid'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={mermaidText}
            rows={6}
            style={{
              width: '100%',
              backgroundColor: '#181818',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#3b82f6',
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '10px',
              resize: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="toolbar-button" onClick={handleDownloadJson}>
            <Download size={14} />
            <span>Download .sysd JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
