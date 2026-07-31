import { DiagramSpec } from './schema.js';

export function exportToMermaid(
  diagram: DiagramSpec,
  direction: 'LR' | 'TD' = 'LR'
): string {
  const lines: string[] = [`graph ${direction}`];

  // Group boundaries first
  const boundaries = diagram.nodes.filter((n) => n.type === 'boundary');
  const standaloneNodes = diagram.nodes.filter((n) => !n.parentId && n.type !== 'boundary');

  // Render boundaries as subgraphs
  boundaries.forEach((b) => {
    const children = diagram.nodes.filter((n) => n.parentId === b.id);
    lines.push(`    subgraph ${b.id} ["${escapeMermaidLabel(b.label)}"]`);
    children.forEach((c) => {
      lines.push(`        ${c.id}${getNodeMermaidShape(c)}`);
    });
    lines.push(`    end`);
  });

  // Render standalone nodes
  standaloneNodes.forEach((n) => {
    lines.push(`    ${n.id}${getNodeMermaidShape(n)}`);
  });

  // Render edges
  diagram.edges.forEach((e) => {
    const arrow = e.style === 'dashed' ? '-.->' : '-->';
    const label = e.label ? `|"${escapeMermaidLabel(e.label)}"|` : '';
    lines.push(`    ${e.from} ${arrow}${label} ${e.to}`);
  });

  return lines.join('\n');
}

function getNodeMermaidShape(node: { type: string; label: string }): string {
  const label = escapeMermaidLabel(node.label);
  switch (node.type) {
    case 'database':
      return `[("${label}")]`;
    case 'cache':
      return `["⚡ ${label}"]`;
    case 'queue':
      return `["║ ${label}"]`;
    case 'client':
      return `["👤 ${label}"]`;
    case 'service':
    default:
      return `["${label}"]`;
  }
}

function escapeMermaidLabel(text: string): string {
  return text.replace(/"/g, '\\"');
}
