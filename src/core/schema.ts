import { z } from 'zod';

export const NodeTypeEnum = z.enum([
  'service',
  'database',
  'cache',
  'queue',
  'client',
  'boundary',
]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

export const NodeSpecSchema = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  label: z.string(),
  x: z.number().default(0),
  y: z.number().default(0),
  w: z.number().default(140),
  h: z.number().default(60),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  children: z.array(z.string()).optional(),
});
export type NodeSpec = z.infer<typeof NodeSpecSchema>;

export const EdgeStyleEnum = z.enum(['solid', 'dashed']);
export type EdgeStyle = z.infer<typeof EdgeStyleEnum>;

export const ArrowHeadEnum = z.enum(['end', 'both', 'none']);
export type ArrowHead = z.infer<typeof ArrowHeadEnum>;

export const EdgeSpecSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  style: EdgeStyleEnum.default('solid'),
  arrowHead: ArrowHeadEnum.default('end'),
});
export type EdgeSpec = z.infer<typeof EdgeSpecSchema>;

export const ChangelogEntrySchema = z.object({
  ts: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string().optional(),
});
export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;

export const DiagramMetaSchema = z.object({
  created: z.string(),
  lastModified: z.string(),
  lastModifiedBy: z.string(),
});
export type DiagramMeta = z.infer<typeof DiagramMetaSchema>;

export const DiagramSpecSchema = z.object({
  version: z.number().default(1),
  meta: DiagramMetaSchema,
  nodes: z.array(NodeSpecSchema).default([]),
  edges: z.array(EdgeSpecSchema).default([]),
  changelog: z.array(ChangelogEntrySchema).default([]),
});
export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;

export function createEmptyDiagram(actor: string = 'human'): DiagramSpec {
  const now = new Date().toISOString();
  return {
    version: 1,
    meta: {
      created: now,
      lastModified: now,
      lastModifiedBy: actor,
    },
    nodes: [],
    edges: [],
    changelog: [
      {
        ts: now,
        actor,
        action: 'create_diagram',
      },
    ],
  };
}
