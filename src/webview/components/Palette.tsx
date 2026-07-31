import React from 'react';
import {
  MousePointer,
  Server,
  Database,
  Zap,
  Layers,
  Square,
  ArrowRight,
  Box,
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
  onAddNode,
}) => {
  return (
    <div className="palette-floating">
      <button
        className={`palette-item ${activeTool === 'select' ? 'active' : ''}`}
        onClick={() => onSelectTool('select')}
      >
        <MousePointer size={14} />
        <span>Select</span>
        <span className="shortcut-badge">V</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'service' ? 'active' : ''}`}
        onClick={() => onAddNode('service', 'New Service')}
      >
        <Server size={14} />
        <span>Service</span>
        <span className="shortcut-badge">S</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'database' ? 'active' : ''}`}
        onClick={() => onAddNode('database', 'Database')}
      >
        <Database size={14} />
        <span>Database</span>
        <span className="shortcut-badge">D</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'cache' ? 'active' : ''}`}
        onClick={() => onAddNode('cache', 'Cache')}
      >
        <Zap size={14} />
        <span>Cache</span>
        <span className="shortcut-badge">C</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'queue' ? 'active' : ''}`}
        onClick={() => onAddNode('queue', 'Message Queue')}
      >
        <Layers size={14} />
        <span>Queue</span>
        <span className="shortcut-badge">Q</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'boundary' ? 'active' : ''}`}
        onClick={() => onAddNode('boundary', 'VPC Container')}
      >
        <Box size={14} />
        <span>Boundary</span>
        <span className="shortcut-badge">G</span>
      </button>

      <button
        className={`palette-item ${activeTool === 'connector' ? 'active' : ''}`}
        onClick={() => onSelectTool('connector')}
      >
        <ArrowRight size={14} />
        <span>Connector</span>
        <span className="shortcut-badge">A</span>
      </button>
    </div>
  );
};
