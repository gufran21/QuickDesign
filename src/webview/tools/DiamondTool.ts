import { BaseBoxShapeTool } from '@tldraw/editor';

export class DiamondTool extends BaseBoxShapeTool {
  static override id = 'diamond';
  override shapeType = 'diamond';
}
