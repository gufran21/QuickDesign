import dagre from 'dagre';
import { DiagramSpec } from './schema.js';
import { addChangelogEntry } from './changelog.js';

export function applyLayout(
  diagram: DiagramSpec,
  strategy: 'left-to-right' | 'top-to-bottom' = 'left-to-right',
  actor: string = 'human'
): DiagramSpec {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: strategy === 'top-to-bottom' ? 'TB' : 'LR',
    nodesep: 60,
    ranksep: 100,
    marginx: 80,
    marginy: 80,
  });
  g.setDefaultEdgeLabel(() => ({}));

  diagram.nodes.forEach((node) => {
    g.setNode(node.id, { width: node.w || 140, height: node.h || 60 });
  });

  diagram.edges.forEach((edge) => {
    if (g.hasNode(edge.from) && g.hasNode(edge.to)) {
      g.setEdge(edge.from, edge.to);
    }
  });

  dagre.layout(g);

  const updatedNodes = diagram.nodes.map((node) => {
    const layoutNode = g.node(node.id);
    if (layoutNode) {
      return {
        ...node,
        x: Math.round(layoutNode.x - (node.w || 140) / 2),
        y: Math.round(layoutNode.y - (node.h || 60) / 2),
      };
    }
    return node;
  });

  const updatedDiagram: DiagramSpec = {
    ...diagram,
    nodes: updatedNodes,
  };

  return addChangelogEntry(updatedDiagram, actor, 'apply_layout');
}
