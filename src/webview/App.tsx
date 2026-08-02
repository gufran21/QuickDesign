import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Tldraw,
  Editor,
  createShapeId,
  GeoShapeGeoStyle,
  DefaultColorStyle,
  LineShapeSplineStyle,
} from '@tldraw/tldraw';
import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite';
import '@tldraw/tldraw/tldraw.css';
import { usePostMessage } from './hooks/usePostMessage.js';
import { Toolbar } from './components/Toolbar.js';
import { Palette } from './components/Palette.js';
import { ExportModal } from './components/ExportModal.js';
import { DatabaseShapeUtil } from './shapes/DatabaseShapeUtil.js';
import { SquareShapeUtil } from './shapes/SquareShapeUtil.js';
import { DatabaseTool } from './tools/DatabaseTool.js';
import { createNode } from '../core/mutator.js';
import { NodeType, DiagramSpec, createEmptyDiagram } from '../core/schema.js';

const CUSTOM_SHAPE_UTILS = [DatabaseShapeUtil, SquareShapeUtil];
const CUSTOM_TOOLS = [DatabaseTool];

export const App: React.FC = () => {
  const { diagram: initialDiagram, lastActor, dispatchChanges, triggerAutoLayout } = usePostMessage();
  const [diagram, setDiagram] = useState<DiagramSpec>(() => createEmptyDiagram('human'));
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [arrowSplineStyle, setArrowSplineStyle] = useState<'line' | 'elbow' | 'cubic'>('line');
  const editorRef = useRef<Editor | null>(null);
  const isSquareToolActiveRef = useRef<boolean>(false);

  const assetUrls = useMemo(() => {
    try {
      return getAssetUrlsByImport();
    } catch {
      return undefined;
    }
  }, []);

  // Sync diagram from postMessage
  useEffect(() => {
    if (initialDiagram) {
      setDiagram(initialDiagram);
    }
  }, [initialDiagram]);

  // Sync diagram nodes into tldraw editor shapes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !diagram || !diagram.nodes) return;

    try {
      const currentShapes = editor.getCurrentPageShapes();
      const currentShapeIds = new Set(currentShapes.map((s) => s.id));

      const shapesToCreate: any[] = [];
      const shapesToUpdate: any[] = [];

      diagram.nodes.forEach((node) => {
        if (!node.id) return;
        const shapeId = createShapeId(node.id);

        if (node.type === 'database') {
          const shapeProps = {
            id: shapeId,
            type: 'database',
            x: Number.isFinite(node.x) ? node.x : 100,
            y: Number.isFinite(node.y) ? node.y : 100,
            props: {
              w: Math.max(node.w || 140, 80),
              h: Math.max(node.h || 100, 60),
              color: 'black',
              text: node.label || '',
            },
          };
          if (currentShapeIds.has(shapeId)) shapesToUpdate.push(shapeProps);
          else shapesToCreate.push(shapeProps);
          return;
        }

        let geoType = 'rectangle';
        let colorType = 'blue';
        const isSquare = node.type === 'square';

        switch (node.type) {
          case 'service':
          case 'rectangle':
            geoType = 'rectangle';
            colorType = 'blue';
            break;
          case 'square':
            geoType = 'rectangle';
            colorType = 'light-blue';
            break;
          case 'diamond':
            geoType = 'rhombus';
            colorType = 'yellow';
            break;
          case 'ellipse':
          case 'circle':
          case 'cache':
            geoType = 'ellipse';
            colorType = 'violet';
            break;
          case 'queue':
            geoType = 'rhombus';
            colorType = 'orange';
            break;
          case 'cloud':
            geoType = 'cloud';
            colorType = 'light-blue';
            break;
          case 'boundary':
            geoType = 'rectangle';
            colorType = 'grey';
            break;
        }

        const width = isSquare ? Math.max(node.w || 90, 80) : Math.max(node.w || 140, 80);
        const height = isSquare ? width : Math.max(node.h || 60, 50);

        const shapeProps = {
          id: shapeId,
          type: 'geo',
          x: Number.isFinite(node.x) ? node.x : 100,
          y: Number.isFinite(node.y) ? node.y : 100,
          meta: { isSquare },
          props: {
            w: width,
            h: height,
            geo: geoType,
            color: colorType,
            text: node.label || '',
            font: 'mono',
            size: 'm',
          },
        };

        if (currentShapeIds.has(shapeId)) {
          shapesToUpdate.push(shapeProps);
        } else {
          shapesToCreate.push(shapeProps);
        }
      });

      if (shapesToCreate.length > 0) {
        editor.createShapes(shapesToCreate);
      }
      if (shapesToUpdate.length > 0) {
        editor.updateShapes(shapesToUpdate);
      }
    } catch (err) {
      console.warn('[tldraw sync warn]', err);
    }
  }, [diagram]);

  // Activate interactive drag-to-draw tools with crosshair cursor for all shapes
  const handleSelectTool = useCallback((tool: string) => {
    setActiveTool(tool);
    isSquareToolActiveRef.current = tool === 'square';
    const editor = editorRef.current;
    if (!editor) return;

    try {
      if (tool === 'select') {
        editor.setCurrentTool('select');
      } else if (tool === 'arrow' || tool === 'line' || tool === 'segment') {
        editor.setCurrentTool('arrow');
      } else if (tool === 'database') {
        editor.setCurrentTool('database');
      } else {
        editor.setCurrentTool('geo');
        let geoShape = 'rectangle';
        let colorName = 'blue';

        switch (tool) {
          case 'rectangle':
            geoShape = 'rectangle';
            colorName = 'blue';
            break;
          case 'square':
            geoShape = 'rectangle';
            colorName = 'light-blue';
            break;
          case 'diamond':
            geoShape = 'rhombus';
            colorName = 'yellow';
            break;
          case 'ellipse':
            geoShape = 'ellipse';
            colorName = 'violet';
            break;
          case 'cloud':
            geoShape = 'cloud';
            colorName = 'light-blue';
            break;
          case 'boundary':
            geoShape = 'rectangle';
            colorName = 'grey';
            break;
        }

        editor.setStyleForNextShapes(GeoShapeGeoStyle, geoShape as any);
        editor.setStyleForNextShapes(DefaultColorStyle, colorName as any);
      }
    } catch (err) {
      console.warn('[tldraw tool set warn]', err);
    }
  }, []);

  const handleChangeArrowSpline = useCallback((splineStyle: 'line' | 'elbow' | 'cubic') => {
    setArrowSplineStyle(splineStyle);
    const editor = editorRef.current;
    if (!editor) return;
    try {
      if (splineStyle === 'line' || splineStyle === 'cubic') {
        editor.setStyleForNextShapes(LineShapeSplineStyle, splineStyle as any);
      }
    } catch (err) {
      console.warn('[arrow spline set warn]', err);
    }
  }, []);

  const handleAddNode = useCallback(
    (type: NodeType, label: string) => {
      const currentDiagram = diagram || createEmptyDiagram('human');
      const x = 220 + Math.random() * 150;
      const y = 160 + Math.random() * 150;
      const size = type === 'square' ? 90 : undefined;
      const { diagram: updated } = createNode(
        currentDiagram,
        { type, label, x, y, w: size, h: size },
        'human'
      );
      setDiagram(updated);
      dispatchChanges(updated);
    },
    [diagram, dispatchChanges]
  );

  const handleUndo = useCallback(() => {
    try {
      editorRef.current?.undo();
    } catch {}
  }, []);

  const handleRedo = useCallback(() => {
    try {
      editorRef.current?.redo();
    } catch {}
  }, []);

  const handleZoomIn = useCallback(() => {
    try {
      editorRef.current?.zoomIn();
    } catch {}
  }, []);

  const handleZoomOut = useCallback(() => {
    try {
      editorRef.current?.zoomOut();
    } catch {}
  }, []);

  const handleZoomFit = useCallback(() => {
    try {
      editorRef.current?.zoomToFit();
    } catch {}
  }, []);

  const handleExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      switch (e.key.toUpperCase()) {
        case 'V':
          handleSelectTool('select');
          break;
        case 'R':
          handleSelectTool('rectangle');
          break;
        case 'D':
          handleSelectTool('database');
          break;
        case 'C':
          handleSelectTool('ellipse');
          break;
        case 'Q':
          handleSelectTool('diamond');
          break;
        case 'G':
          handleSelectTool('boundary');
          break;
        case 'A':
          handleSelectTool('arrow');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectTool]);

  // Disable default tldraw UI overlays to keep canvas ultra clean & lightweight
  const tldrawComponents = useMemo(
    () => ({
      PageMenu: null,
      StylePanel: null,
      Toolbar: null,
      NavigationPanel: null,
      MainMenu: null,
      QuickActions: null,
      HelpMenu: null,
      DebugMenu: null,
      MenuPanel: null,
      TopPanel: null,
    }),
    []
  );

  return (
    <div className="canvas-container">
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onApplyLayout={() => triggerAutoLayout('left-to-right')}
        onExport={handleExport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        arrowSplineStyle={arrowSplineStyle}
        onChangeArrowSpline={handleChangeArrowSpline}
        lastActor={lastActor}
      />

      <Palette
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        onAddNode={handleAddNode}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        diagram={diagram}
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Tldraw
          assetUrls={assetUrls as any}
          components={tldrawComponents as any}
          shapeUtils={CUSTOM_SHAPE_UTILS}
          tools={CUSTOM_TOOLS}
          onMount={(editor) => {
            editorRef.current = editor;

            try {
              // 1. Force strict 1:1 aspect ratio on Square shape creation and resize
              editor.sideEffects.registerBeforeCreateHandler('shape', (shape: any) => {
                if (shape.type === 'geo' && (isSquareToolActiveRef.current || shape.meta?.isSquare)) {
                  const size = Math.max(shape.props.w || 90, shape.props.h || 90);
                  return {
                    ...shape,
                    meta: { ...shape.meta, isSquare: true },
                    props: {
                      ...shape.props,
                      w: size,
                      h: size,
                    },
                  };
                }
                return shape;
              });

              editor.sideEffects.registerBeforeChangeHandler('shape', (prevShape: any, nextShape: any) => {
                if (nextShape.type === 'geo' && nextShape.meta?.isSquare) {
                  const size = Math.max(nextShape.props.w, nextShape.props.h);
                  if (nextShape.props.w !== size || nextShape.props.h !== size) {
                    return {
                      ...nextShape,
                      props: {
                        ...nextShape.props,
                        w: size,
                        h: size,
                      },
                    };
                  }
                }
                return nextShape;
              });

              // 2. Force every arrow binding to lock 100% directly on outer shape edge with ZERO gap
              editor.sideEffects.registerBeforeCreateHandler('binding', (binding: any) => {
                if (binding.type === 'arrow') {
                  return {
                    ...binding,
                    props: {
                      ...binding.props,
                      isExact: true,
                      isPrecise: true,
                    },
                  };
                }
                return binding;
              });
            } catch (err) {
              console.warn('[tldraw sideEffects setup warn]', err);
            }
          }}
        />
      </div>
    </div>
  );
};
