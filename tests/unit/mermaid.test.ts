import { describe, it, expect } from 'vitest';
import { createEmptyDiagram } from '../../src/core/schema.js';
import { createNode, connectNodes } from '../../src/core/mutator.js';
import { exportToMermaid } from '../../src/core/mermaid.js';

describe('Mermaid Exporter', () => {
  it('converts a diagram into clean Mermaid syntax', () => {
    let diagram = createEmptyDiagram('human');
    const { diagram: d1, node: n1 } = createNode(diagram, {
      type: 'service',
      label: 'API Gateway',
    });
    const { diagram: d2, node: n2 } = createNode(d1, {
      type: 'database',
      label: 'Postgres DB',
    });
    const { diagram: d3 } = connectNodes(d2, {
      from: n1.id,
      to: n2.id,
      label: 'queries',
    });

    const mermaidText = exportToMermaid(d3, 'LR');
    expect(mermaidText).toContain('graph LR');
    expect(mermaidText).toContain('API Gateway');
    expect(mermaidText).toContain('[("Postgres DB")]');
    expect(mermaidText).toContain('-->|"queries"|');
  });
});
