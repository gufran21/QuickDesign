import { describe, it, expect } from 'vitest';
import { createEmptyDiagram } from '../../src/core/schema.js';
import {
  createNode,
  updateNode,
  deleteNode,
  connectNodes,
  updateEdge,
  deleteEdge,
  setGroup,
} from '../../src/core/mutator.js';
import { applyLayout } from '../../src/core/layout.js';

describe('Core Mutator Operations', () => {
  it('creates and connects nodes correctly', () => {
    let diagram = createEmptyDiagram('human');

    const res1 = createNode(
      diagram,
      { type: 'service', label: 'Web Server', x: 100, y: 100 },
      'human'
    );
    diagram = res1.diagram;
    const n1 = res1.node;

    const res2 = createNode(
      diagram,
      { type: 'database', label: 'Postgres DB', x: 400, y: 100 },
      'human'
    );
    diagram = res2.diagram;
    const n2 = res2.node;

    const connRes = connectNodes(
      diagram,
      { from: n1.id, to: n2.id, label: 'queries' },
      'human'
    );
    diagram = connRes.diagram;

    expect(diagram.nodes.length).toBe(2);
    expect(diagram.edges.length).toBe(1);
    expect(diagram.edges[0].from).toBe(n1.id);
    expect(diagram.edges[0].to).toBe(n2.id);
  });

  it('updates and deletes nodes cleanly with connected edges', () => {
    let diagram = createEmptyDiagram('human');
    const { diagram: d1, node: n1 } = createNode(diagram, {
      type: 'service',
      label: 'API',
    });
    const { diagram: d2, node: n2 } = createNode(d1, {
      type: 'cache',
      label: 'Redis',
    });
    const { diagram: d3, edge: e1 } = connectNodes(d2, {
      from: n1.id,
      to: n2.id,
    });

    diagram = d3;
    diagram = updateNode(diagram, n1.id, { label: 'API Gateway v2' });
    expect(diagram.nodes.find((n) => n.id === n1.id)?.label).toBe(
      'API Gateway v2'
    );

    // Deleting n1 should also remove e1
    diagram = deleteNode(diagram, n1.id);
    expect(diagram.nodes.length).toBe(1);
    expect(diagram.edges.length).toBe(0);
  });

  it('applies dagre auto-layout to graph', () => {
    let diagram = createEmptyDiagram('human');
    const { diagram: d1, node: n1 } = createNode(diagram, {
      type: 'service',
      label: 'Frontend',
      x: 0,
      y: 0,
    });
    const { diagram: d2, node: n2 } = createNode(d1, {
      type: 'service',
      label: 'Backend',
      x: 0,
      y: 0,
    });
    const { diagram: d3 } = connectNodes(d2, { from: n1.id, to: n2.id });

    const layoutDiagram = applyLayout(d3, 'left-to-right');
    const n1Post = layoutDiagram.nodes.find((n) => n.id === n1.id);
    const n2Post = layoutDiagram.nodes.find((n) => n.id === n2.id);

    expect(n1Post).toBeDefined();
    expect(n2Post).toBeDefined();
    expect(n2Post!.x).toBeGreaterThan(n1Post!.x); // Left-to-right layout
  });
});
