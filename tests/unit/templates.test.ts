import { describe, it, expect } from 'vitest';
import { createDiagramFromTemplate } from '../../src/core/templates.js';

describe('Architecture Templates Generator', () => {
  it('generates a valid Rate Limiter architecture diagram', () => {
    const diagram = createDiagramFromTemplate('rate-limiter', 'human');
    expect(diagram.nodes.length).toBe(6);
    expect(diagram.edges.length).toBe(4);
    expect(diagram.nodes.some((n) => n.label === 'API Gateway')).toBe(true);
    expect(diagram.nodes.some((n) => n.label === 'Redis Rate Limiter Cache')).toBe(true);
  });

  it('generates a valid Event-Driven Microservices diagram', () => {
    const diagram = createDiagramFromTemplate('event-driven-microservices', 'human');
    expect(diagram.nodes.length).toBe(8);
    expect(diagram.edges.length).toBe(6);
    expect(diagram.nodes.some((n) => n.label.includes('Kafka'))).toBe(true);
  });

  it('generates a valid RAG Pipeline diagram', () => {
    const diagram = createDiagramFromTemplate('rag-pipeline', 'human');
    expect(diagram.nodes.length).toBe(6);
    expect(diagram.edges.length).toBe(6);
    expect(diagram.nodes.some((n) => n.label.includes('Vector DB'))).toBe(true);
  });
});
