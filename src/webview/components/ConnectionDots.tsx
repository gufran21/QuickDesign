import React from 'react';
import { useEditor, useValue, Vec } from '@tldraw/tldraw';

/**
 * DynamicEdgeSnapOverlay:
 * Renders a single glowing snap dot indicator at the EXACT perimeter position
 * where the user hovers near a shape edge or drags an arrow terminal.
 * Shapes remain 100% clean by default (no static dots shown).
 */
export const DynamicEdgeSnapOverlay: React.FC = () => {
  const editor = useEditor();

  const snapData = useValue('dynamicSnapDot', () => {
    try {
      const pagePoint = editor.inputs.currentPagePoint;
      const currentTool = editor.getCurrentToolId();

      const hoveredShapeId = editor.getHoveredShapeId();
      const shapesOnPage = editor.getCurrentPageShapes();

      let targetShape = hoveredShapeId ? editor.getShape(hoveredShapeId) : null;

      if (!targetShape) {
        for (const shape of shapesOnPage) {
          if (shape.type === 'arrow' || shape.type === 'line') continue;
          const bounds = editor.getShapePageBounds(shape);
          if (!bounds) continue;
          const expandedBounds = bounds.clone().expandBy(25);
          if (expandedBounds.containsPoint(pagePoint)) {
            targetShape = shape;
            break;
          }
        }
      }

      if (!targetShape || targetShape.type === 'arrow' || targetShape.type === 'line') {
        return null;
      }

      const shapeBounds = editor.getShapePageBounds(targetShape);
      if (!shapeBounds || shapeBounds.width <= 0 || shapeBounds.height <= 0) return null;

      const geometry = editor.getShapeGeometry(targetShape);
      if (!geometry) return null;

      const transform = editor.getShapePageTransform(targetShape);
      const localPoint = transform.invert().applyToPoint(pagePoint);

      const nearestLocalPoint = geometry.nearestPoint(localPoint);
      const distance = Vec.Dist(localPoint, nearestLocalPoint);

      // Show glowing dot only when mouse is hovering near edge boundary (within 30px)
      if (distance <= 30) {
        const pageNearestPoint = transform.applyToPoint(nearestLocalPoint);
        const screenPoint = editor.pageToScreen(pageNearestPoint);

        const normX = Math.max(0, Math.min(1, nearestLocalPoint.x / shapeBounds.width));
        const normY = Math.max(0, Math.min(1, nearestLocalPoint.y / shapeBounds.height));

        return {
          shapeId: targetShape.id,
          screenX: screenPoint.x,
          screenY: screenPoint.y,
          pageX: pageNearestPoint.x,
          pageY: pageNearestPoint.y,
          normX,
          normY,
          isArrowTool: currentTool === 'arrow',
        };
      }
    } catch {
      return null;
    }
    return null;
  }, [editor]);

  if (!snapData) return null;

  return (
    <div
      className="dynamic-edge-snap-dot"
      style={{
        position: 'fixed',
        left: snapData.screenX - 7,
        top: snapData.screenY - 7,
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        border: '2.5px solid #ffffff',
        boxShadow: '0 0 12px 4px rgba(37, 99, 235, 0.9), 0 0 4px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'left 0.05s ease-out, top 0.05s ease-out, transform 0.15s ease-out',
        transform: 'scale(1.15)',
      }}
    />
  );
};
