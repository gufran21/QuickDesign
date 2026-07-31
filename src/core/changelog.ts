import { ChangelogEntry, DiagramSpec } from './schema.js';

export const MAX_CHANGELOG_ENTRIES = 50;

export function addChangelogEntry(
  diagram: DiagramSpec,
  actor: string,
  action: string,
  target?: string
): DiagramSpec {
  const now = new Date().toISOString();
  const entry: ChangelogEntry = {
    ts: now,
    actor,
    action,
    ...(target ? { target } : {}),
  };

  const newChangelog = [...diagram.changelog, entry].slice(
    -MAX_CHANGELOG_ENTRIES
  );

  return {
    ...diagram,
    meta: {
      ...diagram.meta,
      lastModified: now,
      lastModifiedBy: actor,
    },
    changelog: newChangelog,
  };
}
