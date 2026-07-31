import { describe, it, expect } from 'vitest';
import {
  DiagramSpecSchema,
  createEmptyDiagram,
  NodeSpecSchema,
  EdgeSpecSchema,
} from '../../src/core/schema.js';

describe('Diagram Schema & Parsing', () => {
  it('creates a valid empty diagram spec', () => {
    const diagram = createEmptyDiagram('human');
    expect(diagram.version).toBe(1);
    expect(diagram.meta.lastModifiedBy).toBe('human');
    expect(diagram.nodes).toEqual([]);
    expect(diagram.edges).toEqual([]);
    expect(diagram.changelog.length).toBe(1);
  });

  it('validates a complete diagram specification', () => {
    const raw = {
      version: 1,
      meta: {
        created: '2026-07-31T20:00:00Z',
        lastModified: '2026-07-31T20:00:00Z',
        lastModifiedBy: 'agent:claude-code',
      },
      nodes: [
        {
          id: 'n1',
          type: 'service',
          label: 'API Gateway',
          x: 100,
          y: 200,
          w: 140,
          h: 60,
        },
      ],
      edges: [
        {
          id: 'e1',
          from: 'n1',
          to: 'n2',
          label: 'requests',
          style: 'solid',
          arrowHead: 'end',
        },
      ],
      changelog: [],
    };

    const parsed = DiagramSpecSchema.parse(raw);
    expect(parsed.nodes[0].label).toBe('API Gateway');
    expect(parsed.edges[0].arrowHead).toBe('end');
  });

  it('rejects invalid node types', () => {
    const invalidNode = {
      id: 'n1',
      type: 'invalid-type',
      label: 'Bad Node',
      x: 0,
      y: 0,
    };
    expect(() => NodeSpecSchema.parse(invalidNode)).toThrow();
  });
});
