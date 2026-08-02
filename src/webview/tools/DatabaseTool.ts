import { BaseBoxShapeTool } from '@tldraw/editor';

export class DatabaseTool extends BaseBoxShapeTool {
  static override id = 'database';
  override shapeType = 'database';
}
