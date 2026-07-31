import fs from 'fs';
import path from 'path';
import {
  DiagramSpecSchema,
  DiagramSpec,
  createEmptyDiagram,
  NodeTypeEnum,
} from '../core/schema.js';
import { createDiagramFromTemplate } from '../core/templates.js';
import {
  createNode,
  updateNode,
  deleteNode,
  connectNodes,
  updateEdge,
  deleteEdge,
  setGroup,
} from '../core/mutator.js';
import { applyLayout } from '../core/layout.js';

export function readDiagramFile(filePath: string): DiagramSpec {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Diagram file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  return DiagramSpecSchema.parse(json);
}

export function writeDiagramFile(filePath: string, diagram: DiagramSpec): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(diagram, null, 2), 'utf8');
}

export const SYSTEM_DESIGN_TOOLS = {
  get_diagram_state: {
    description: 'Returns the current nodes, edges, meta, and recent changelog entries from a .sysd diagram file.',
    execute: (args: { filePath: string; changelogLimit?: number }) => {
      const diagram = readDiagramFile(args.filePath);
      const limit = args.changelogLimit ?? 20;
      return {
        ...diagram,
        changelog: diagram.changelog.slice(-limit),
      };
    },
  },
  create_node: {
    description: 'Appends a new architectural component node (service, database, cache, queue, client, boundary) to the diagram.',
    execute: (args: {
      filePath: string;
      type: 'service' | 'database' | 'cache' | 'queue' | 'client' | 'boundary';
      label: string;
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      icon?: string;
      parentId?: string;
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const { diagram: updatedDiagram, node } = createNode(
        diagram,
        {
          type: args.type,
          label: args.label,
          x: args.x,
          y: args.y,
          w: args.w,
          h: args.h,
          icon: args.icon,
          parentId: args.parentId,
        },
        actor
      );
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, createdNode: node };
    },
  },
  update_node: {
    description: 'Updates attributes (label, coordinates, dimensions, icon, parent) of an existing diagram node.',
    execute: (args: {
      filePath: string;
      nodeId: string;
      patch: {
        label?: string;
        x?: number;
        y?: number;
        w?: number;
        h?: number;
        icon?: string;
        parentId?: string;
      };
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const updatedDiagram = updateNode(diagram, args.nodeId, args.patch, actor);
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, nodeId: args.nodeId };
    },
  },
  delete_node: {
    description: 'Deletes a node and automatically removes all connected arrows/edges.',
    execute: (args: { filePath: string; nodeId: string; actor?: string }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const updatedDiagram = deleteNode(diagram, args.nodeId, actor);
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, deletedNodeId: args.nodeId };
    },
  },
  connect_nodes: {
    description: 'Creates a directed arrow/edge connection between two nodes with optional label and style.',
    execute: (args: {
      filePath: string;
      from: string;
      to: string;
      label?: string;
      style?: 'solid' | 'dashed';
      arrowHead?: 'end' | 'both' | 'none';
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const { diagram: updatedDiagram, edge } = connectNodes(
        diagram,
        {
          from: args.from,
          to: args.to,
          label: args.label,
          style: args.style,
          arrowHead: args.arrowHead,
        },
        actor
      );
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, createdEdge: edge };
    },
  },
  update_edge: {
    description: 'Updates label, line style, or arrowhead of an existing edge.',
    execute: (args: {
      filePath: string;
      edgeId: string;
      patch: {
        label?: string;
        style?: 'solid' | 'dashed';
        arrowHead?: 'end' | 'both' | 'none';
      };
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const updatedDiagram = updateEdge(diagram, args.edgeId, args.patch, actor);
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, edgeId: args.edgeId };
    },
  },
  set_group: {
    description: 'Nests target nodes into a boundary group container (e.g. VPC, Subnet, Microservice Cluster).',
    execute: (args: {
      filePath: string;
      boundaryId: string;
      nodeIds: string[];
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const updatedDiagram = setGroup(diagram, args.boundaryId, args.nodeIds, actor);
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, boundaryId: args.boundaryId, children: args.nodeIds };
    },
  },
  apply_layout: {
    description: 'Applies Dagre automatic graph layout algorithm (left-to-right or top-to-bottom) to arrange nodes cleanly.',
    execute: (args: {
      filePath: string;
      strategy?: 'left-to-right' | 'top-to-bottom';
      actor?: string;
    }) => {
      const diagram = readDiagramFile(args.filePath);
      const actor = args.actor || 'agent:mcp';
      const updatedDiagram = applyLayout(diagram, args.strategy || 'left-to-right', actor);
      writeDiagramFile(args.filePath, updatedDiagram);
      return { success: true, strategy: args.strategy || 'left-to-right' };
    },
  },
  create_diagram_file: {
    description: 'Initializes a new blank or custom .sysd diagram file on disk.',
    execute: (args: { filePath: string; title?: string; actor?: string }) => {
      const actor = args.actor || 'agent:mcp';
      const diagram = createEmptyDiagram(actor);
      writeDiagramFile(args.filePath, diagram);
      return { success: true, filePath: args.filePath };
    },
  },
  create_from_template: {
    description: 'Generates a full industry-standard architecture diagram (rate-limiter, event-driven-microservices, rag-pipeline) from a preset template.',
    execute: (args: {
      filePath: string;
      templateType: 'rate-limiter' | 'event-driven-microservices' | 'rag-pipeline';
      actor?: string;
    }) => {
      const actor = args.actor || 'agent:mcp';
      const diagram = createDiagramFromTemplate(args.templateType, actor);
      writeDiagramFile(args.filePath, diagram);
      return { success: true, filePath: args.filePath, templateType: args.templateType };
    },
  },
};
