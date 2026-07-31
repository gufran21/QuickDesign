import {
  DiagramSpec,
  NodeSpec,
  NodeSpecSchema,
  EdgeSpec,
  EdgeSpecSchema,
  NodeType,
} from './schema.js';
import { addChangelogEntry } from './changelog.js';

export function createNode(
  diagram: DiagramSpec,
  params: {
    id?: string;
    type: NodeType;
    label: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    icon?: string;
    parentId?: string;
  },
  actor: string = 'human'
): { diagram: DiagramSpec; node: NodeSpec } {
  const id = params.id || `n_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Default dimensions based on shape type
  let defaultW = 140;
  let defaultH = 60;
  if (params.type === 'database') {
    defaultW = 120;
    defaultH = 80;
  } else if (params.type === 'boundary') {
    defaultW = 400;
    defaultH = 300;
  }

  const rawNode = {
    id,
    type: params.type,
    label: params.label,
    x: params.x ?? 100,
    y: params.y ?? 100,
    w: params.w ?? defaultW,
    h: params.h ?? defaultH,
    icon: params.icon,
    parentId: params.parentId,
    children: params.type === 'boundary' ? [] : undefined,
  };

  const node = NodeSpecSchema.parse(rawNode);

  let updatedNodes = [...diagram.nodes, node];

  // If parentId specified, register as child in boundary
  if (params.parentId) {
    updatedNodes = updatedNodes.map((n) => {
      if (n.id === params.parentId && n.type === 'boundary') {
        const currentChildren = n.children || [];
        if (!currentChildren.includes(id)) {
          return { ...n, children: [...currentChildren, id] };
        }
      }
      return n;
    });
  }

  let updatedDiagram: DiagramSpec = {
    ...diagram,
    nodes: updatedNodes,
  };

  updatedDiagram = addChangelogEntry(
    updatedDiagram,
    actor,
    'create_node',
    id
  );

  return { diagram: updatedDiagram, node };
}

export function updateNode(
  diagram: DiagramSpec,
  nodeId: string,
  patch: Partial<NodeSpec>,
  actor: string = 'human'
): DiagramSpec {
  const existingNode = diagram.nodes.find((n) => n.id === nodeId);
  if (!existingNode) {
    throw new Error(`Node with id '${nodeId}' not found.`);
  }

  const updatedNode = NodeSpecSchema.parse({
    ...existingNode,
    ...patch,
    id: nodeId, // Protect ID immutability
  });

  const updatedNodes = diagram.nodes.map((n) =>
    n.id === nodeId ? updatedNode : n
  );

  const updatedDiagram: DiagramSpec = {
    ...diagram,
    nodes: updatedNodes,
  };

  return addChangelogEntry(updatedDiagram, actor, 'update_node', nodeId);
}

export function deleteNode(
  diagram: DiagramSpec,
  nodeId: string,
  actor: string = 'human'
): DiagramSpec {
  const nodeExists = diagram.nodes.some((n) => n.id === nodeId);
  if (!nodeExists) {
    return diagram;
  }

  // Remove node and update any boundary container children list
  const updatedNodes = diagram.nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => {
      if (n.children && n.children.includes(nodeId)) {
        return {
          ...n,
          children: n.children.filter((childId) => childId !== nodeId),
        };
      }
      return n;
    });

  // Automatically remove connected edges
  const updatedEdges = diagram.edges.filter(
    (e) => e.from !== nodeId && e.to !== nodeId
  );

  const updatedDiagram: DiagramSpec = {
    ...diagram,
    nodes: updatedNodes,
    edges: updatedEdges,
  };

  return addChangelogEntry(updatedDiagram, actor, 'delete_node', nodeId);
}

export function connectNodes(
  diagram: DiagramSpec,
  params: {
    id?: string;
    from: string;
    to: string;
    label?: string;
    style?: 'solid' | 'dashed';
    arrowHead?: 'end' | 'both' | 'none';
  },
  actor: string = 'human'
): { diagram: DiagramSpec; edge: EdgeSpec } {
  const fromExists = diagram.nodes.some((n) => n.id === params.from);
  const toExists = diagram.nodes.some((n) => n.id === params.to);
  if (!fromExists || !toExists) {
    throw new Error(
      `Cannot connect nodes: target node '${!fromExists ? params.from : params.to}' does not exist.`
    );
  }

  const id = params.id || `e_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const rawEdge = {
    id,
    from: params.from,
    to: params.to,
    label: params.label,
    style: params.style || 'solid',
    arrowHead: params.arrowHead || 'end',
  };

  const edge = EdgeSpecSchema.parse(rawEdge);

  let updatedDiagram: DiagramSpec = {
    ...diagram,
    edges: [...diagram.edges, edge],
  };

  updatedDiagram = addChangelogEntry(
    updatedDiagram,
    actor,
    'connect_nodes',
    id
  );

  return { diagram: updatedDiagram, edge };
}

export function updateEdge(
  diagram: DiagramSpec,
  edgeId: string,
  patch: Partial<EdgeSpec>,
  actor: string = 'human'
): DiagramSpec {
  const existingEdge = diagram.edges.find((e) => e.id === edgeId);
  if (!existingEdge) {
    throw new Error(`Edge with id '${edgeId}' not found.`);
  }

  const updatedEdge = EdgeSpecSchema.parse({
    ...existingEdge,
    ...patch,
    id: edgeId,
  });

  const updatedEdges = diagram.edges.map((e) =>
    e.id === edgeId ? updatedEdge : e
  );

  const updatedDiagram: DiagramSpec = {
    ...diagram,
    edges: updatedEdges,
  };

  return addChangelogEntry(updatedDiagram, actor, 'update_edge', edgeId);
}

export function deleteEdge(
  diagram: DiagramSpec,
  edgeId: string,
  actor: string = 'human'
): DiagramSpec {
  const updatedEdges = diagram.edges.filter((e) => e.id !== edgeId);
  const updatedDiagram: DiagramSpec = {
    ...diagram,
    edges: updatedEdges,
  };
  return addChangelogEntry(updatedDiagram, actor, 'delete_edge', edgeId);
}

export function setGroup(
  diagram: DiagramSpec,
  boundaryId: string,
  nodeIds: string[],
  actor: string = 'human'
): DiagramSpec {
  const boundary = diagram.nodes.find(
    (n) => n.id === boundaryId && n.type === 'boundary'
  );
  if (!boundary) {
    throw new Error(`Boundary node '${boundaryId}' not found.`);
  }

  const updatedNodes = diagram.nodes.map((n) => {
    if (n.id === boundaryId) {
      return { ...n, children: nodeIds };
    }
    if (nodeIds.includes(n.id)) {
      return { ...n, parentId: boundaryId };
    }
    return n;
  });

  const updatedDiagram: DiagramSpec = {
    ...diagram,
    nodes: updatedNodes,
  };

  return addChangelogEntry(updatedDiagram, actor, 'set_group', boundaryId);
}
