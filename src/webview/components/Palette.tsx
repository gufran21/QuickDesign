import React from 'react';
import {
  MousePointer,
  Square,
  Box,
  Database,
  Diamond,
  Circle,
  Cloud,
  Layers,
  ArrowRight,
  Minus,
  Spline,
} from 'lucide-react';
import { NodeType } from '../../core/schema.js';

interface PaletteProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
  onAddNode: (type: NodeType, label: string) => void;
}

export const Palette: React.FC<PaletteProps> = ({
  activeTool,
  onSelectTool,
}) => {
  const tools = [
    {
      id: 'select',
      label: 'Select',
      shortcut: 'V',
      icon: <MousePointer size={16} />,
      onClick: () => onSelectTool('select'),
    },
    {
      id: 'rectangle',
      label: 'Rectangle',
      shortcut: 'R',
      icon: <Box size={16} />,
      onClick: () => onSelectTool('rectangle'),
    },
    {
      id: 'square',
      label: 'Square',
      shortcut: 'SQ',
      icon: <Square size={16} />,
      onClick: () => onSelectTool('square'),
    },
    {
      id: 'database',
      label: 'Database',
      shortcut: 'D',
      icon: <Database size={16} />,
      onClick: () => onSelectTool('database'),
    },
    {
      id: 'diamond',
      label: 'Diamond',
      shortcut: 'DM',
      icon: <Diamond size={16} />,
      onClick: () => onSelectTool('diamond'),
    },
    {
      id: 'ellipse',
      label: 'Ellipse',
      shortcut: 'C',
      icon: <Circle size={16} />,
      onClick: () => onSelectTool('ellipse'),
    },
    {
      id: 'cloud',
      label: 'Cloud',
      shortcut: 'CL',
      icon: <Cloud size={16} />,
      onClick: () => onSelectTool('cloud'),
    },
    {
      id: 'boundary',
      label: 'Boundary',
      shortcut: 'G',
      icon: <Layers size={16} />,
      onClick: () => onSelectTool('boundary'),
    },
    {
      id: 'arrow',
      label: 'Arrow',
      shortcut: 'A',
      icon: <ArrowRight size={16} />,
      onClick: () => onSelectTool('arrow'),
    },
    {
      id: 'line',
      label: 'Line',
      shortcut: 'L',
      icon: <Minus size={16} />,
      onClick: () => onSelectTool('line'),
    },
    {
      id: 'segment',
      label: 'Curved Line',
      shortcut: 'P',
      icon: <Spline size={16} />,
      onClick: () => onSelectTool('segment'),
    },
  ];

  return (
    <div className="palette-floating">
      <div className="palette-header">
        <span className="palette-title">Shapes & Tools</span>
      </div>
      <div className="palette-grid">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`palette-item ${activeTool === t.id ? 'active' : ''}`}
            onClick={t.onClick}
            title={`${t.label} (${t.shortcut})`}
          >
            <div className="palette-icon">{t.icon}</div>
            <span className="palette-label">{t.label}</span>
            <span className="palette-shortcut">{t.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
