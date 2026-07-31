import { DiagramSpec, createEmptyDiagram } from './schema.js';
import { createNode, connectNodes, setGroup } from './mutator.js';
import { applyLayout } from './layout.js';

export type TemplateType = 'rate-limiter' | 'event-driven-microservices' | 'rag-pipeline';

export function createDiagramFromTemplate(
  templateType: TemplateType,
  actor: string = 'human'
): DiagramSpec {
  let diagram = createEmptyDiagram(actor);

  switch (templateType) {
    case 'rate-limiter': {
      // Create Boundary
      const { diagram: d1, node: vpc } = createNode(
        diagram,
        { type: 'boundary', label: 'VPC - Rate Limiting Subnet' },
        actor
      );

      // Create Nodes
      const { diagram: d2, node: client } = createNode(
        d1,
        { type: 'client', label: 'Client / Mobile App' },
        actor
      );

      const { diagram: d3, node: gateway } = createNode(
        d2,
        { type: 'service', label: 'API Gateway', parentId: vpc.id, icon: 'network' },
        actor
      );

      const { diagram: d4, node: redis } = createNode(
        d3,
        { type: 'cache', label: 'Redis Rate Limiter Cache', parentId: vpc.id, icon: 'zap' },
        actor
      );

      const { diagram: d5, node: backend } = createNode(
        d4,
        { type: 'service', label: 'Backend Core Service', parentId: vpc.id, icon: 'server' },
        actor
      );

      const { diagram: d6, node: db } = createNode(
        d5,
        { type: 'database', label: 'Primary PostgreSQL DB', parentId: vpc.id, icon: 'database' },
        actor
      );

      // Connect Nodes
      const { diagram: d7 } = connectNodes(d6, { from: client.id, to: gateway.id, label: 'HTTP Request' }, actor);
      const { diagram: d8 } = connectNodes(d7, { from: gateway.id, to: redis.id, label: 'Check Rate Limit (Token Bucket)' }, actor);
      const { diagram: d9 } = connectNodes(d8, { from: gateway.id, to: backend.id, label: 'Forward (If Allowed)' }, actor);
      const { diagram: d10 } = connectNodes(d9, { from: backend.id, to: db.id, label: 'Read/Write Data' }, actor);

      diagram = applyLayout(d10, 'left-to-right', actor);
      break;
    }

    case 'event-driven-microservices': {
      const { diagram: d1, node: vpc } = createNode(
        diagram,
        { type: 'boundary', label: 'Microservice Cluster' },
        actor
      );

      const { diagram: d2, node: client } = createNode(d1, { type: 'client', label: 'Web Client' }, actor);
      const { diagram: d3, node: lb } = createNode(d2, { type: 'service', label: 'Load Balancer', parentId: vpc.id }, actor);
      const { diagram: d4, node: orderService } = createNode(d3, { type: 'service', label: 'Order Service', parentId: vpc.id }, actor);
      const { diagram: d5, node: paymentService } = createNode(d4, { type: 'service', label: 'Payment Service', parentId: vpc.id }, actor);
      const { diagram: d6, node: kafka } = createNode(d5, { type: 'queue', label: 'Apache Kafka Event Stream', parentId: vpc.id }, actor);
      const { diagram: d7, node: orderDb } = createNode(d6, { type: 'database', label: 'Order Database', parentId: vpc.id }, actor);
      const { diagram: d8, node: paymentDb } = createNode(d7, { type: 'database', label: 'Payment Database', parentId: vpc.id }, actor);

      const { diagram: d9 } = connectNodes(d8, { from: client.id, to: lb.id, label: 'HTTPS' }, actor);
      const { diagram: d10 } = connectNodes(d9, { from: lb.id, to: orderService.id, label: 'Route Orders' }, actor);
      const { diagram: d11 } = connectNodes(d10, { from: orderService.id, to: orderDb.id, label: 'Save Order' }, actor);
      const { diagram: d12 } = connectNodes(d11, { from: orderService.id, to: kafka.id, label: 'Publish "OrderCreated"' }, actor);
      const { diagram: d13 } = connectNodes(d12, { from: kafka.id, to: paymentService.id, label: 'Consume Event' }, actor);
      const { diagram: d14 } = connectNodes(d13, { from: paymentService.id, to: paymentDb.id, label: 'Process Payment' }, actor);

      diagram = applyLayout(d14, 'left-to-right', actor);
      break;
    }

    case 'rag-pipeline': {
      const { diagram: d1, node: user } = createNode(diagram, { type: 'client', label: 'User / App Chat UI' }, actor);
      const { diagram: d2, node: api } = createNode(d1, { type: 'service', label: 'RAG Gateway Service' }, actor);
      const { diagram: d3, node: embedder } = createNode(d2, { type: 'service', label: 'Embedding Worker (Ada-002)' }, actor);
      const { diagram: d4, node: vectorDb } = createNode(d3, { type: 'database', label: 'Vector DB (Pinecone / Qdrant)' }, actor);
      const { diagram: d5, node: llm } = createNode(d4, { type: 'service', label: 'LLM Gateway (Claude / GPT-4)' }, actor);
      const { diagram: d6, node: docsDb } = createNode(d5, { type: 'database', label: 'Document Store (S3 / Postgres)' }, actor);

      const { diagram: d7 } = connectNodes(d6, { from: user.id, to: api.id, label: 'User Prompt' }, actor);
      const { diagram: d8 } = connectNodes(d7, { from: api.id, to: embedder.id, label: 'Generate Query Vector' }, actor);
      const { diagram: d9 } = connectNodes(d8, { from: embedder.id, to: vectorDb.id, label: 'Similarity Search (kNN)' }, actor);
      const { diagram: d10 } = connectNodes(d9, { from: vectorDb.id, to: api.id, label: 'Relevant Context' }, actor);
      const { diagram: d11 } = connectNodes(d10, { from: api.id, to: llm.id, label: 'Prompt + Context' }, actor);
      const { diagram: d12 } = connectNodes(d11, { from: llm.id, to: user.id, label: 'Stream Answer' }, actor);

      diagram = applyLayout(d12, 'left-to-right', actor);
      break;
    }
  }

  return diagram;
}
