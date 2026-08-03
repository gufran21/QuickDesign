import React, { useState, useEffect, useRef } from 'react';
import {
  HTMLContainer,
  Polygon2d,
  Vec,
  TLBaseShape,
  RecordProps,
  T,
  useIsEditing,
} from '@tldraw/tldraw';
import { BaseBoxShapeUtil, resizeBox } from '@tldraw/editor';

export type TLDiamondShapeProps = {
  w: number;
  h: number;
  color: string;
  text: string;
};

export type TLDiamondShape = TLBaseShape<'diamond', TLDiamondShapeProps>;

const ControlledDiamondTextarea: React.FC<{
  shape: TLDiamondShape;
  editor: any;
  innerW: number;
  innerH: number;
  fontSize: number;
}> = ({ shape, editor, innerW, innerH, fontSize }) => {
  const [text, setText] = useState(shape.props.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    editor.updateShape({
      id: shape.id,
      type: 'diamond',
      props: { ...shape.props, text: val },
    });
  };

  const lineCount = Math.max(1, text.split('\n').length);
  const textH = Math.ceil(fontSize * 1.25 * lineCount);

  return (
    <div
      style={{
        width: `${innerW}px`,
        height: `${innerH}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            editor.setEditingShape(null);
          }
        }}
        onBlur={() => {
          editor.setEditingShape(null);
        }}
        rows={lineCount}
        style={{
          width: '100%',
          height: `${textH}px`,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          color: '#0f172a',
          fontWeight: 500,
          fontSize: `${fontSize}px`,
          fontFamily: "var(--tl-font-draw), 'Shantell Sans', cursive, system-ui, -apple-system, sans-serif",
          textAlign: 'center',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.25,
          overflow: 'visible',
          padding: 0,
          margin: 0,
        }}
      />
    </div>
  );
};

export class DiamondShapeUtil extends BaseBoxShapeUtil<TLDiamondShape> {
  static override type = 'diamond' as const;

  static override props: RecordProps<TLDiamondShape> = {
    w: T.nonZeroNumber,
    h: T.nonZeroNumber,
    color: T.string,
    text: T.string,
  };

  getDefaultProps(): TLDiamondShapeProps {
    return {
      w: 1,
      h: 1,
      color: 'black',
      text: '',
    };
  }

  override canResize = () => true;

  override isAspectRatioLocked = () => false;

  override canEdit = () => true;

  override onResize = (shape: TLDiamondShape, info: any) => {
    return resizeBox(shape, info, { minWidth: 1, minHeight: 1 });
  };

  override getGeometry(shape: TLDiamondShape) {
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    return new Polygon2d({
      points: [
        new Vec(w / 2, 0),
        new Vec(w, h / 2),
        new Vec(w / 2, h),
        new Vec(0, h / 2),
      ],
      isFilled: true,
    });
  }

  component(shape: TLDiamondShape) {
    const isEditing = useIsEditing(shape.id);
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    const text = shape.props.text || '';
    const strokeWidth = 2.5;

    // Smooth rounded corner radius calculation
    const r = Math.min(10, Math.max(3, Math.min(w, h) * 0.08));
    const rx = (r * (w / (w + h))) || 4;
    const ry = (r * (h / (w + h))) || 4;

    const pathD = `
      M ${w / 2 - rx} ${strokeWidth / 2 + ry}
      Q ${w / 2} ${strokeWidth / 2} ${w / 2 + rx} ${strokeWidth / 2 + ry}
      L ${w - strokeWidth / 2 - rx} ${h / 2 - ry}
      Q ${w - strokeWidth / 2} ${h / 2} ${w - strokeWidth / 2 - rx} ${h / 2 + ry}
      L ${w / 2 + rx} ${h - strokeWidth / 2 - ry}
      Q ${w / 2} ${h - strokeWidth / 2} ${w / 2 - rx} ${h - strokeWidth / 2 - ry}
      L ${strokeWidth / 2 + rx} ${h / 2 + ry}
      Q ${strokeWidth / 2} ${h / 2} ${strokeWidth / 2 + rx} ${h / 2 - ry}
      Z
    `;

    // Font scaling in exact proportion to shape size
    const minDim = Math.min(w, h);
    const fontSize = Math.max(12, Math.min(48, Math.floor(minDim * 0.16)));
    const innerW = Math.max(1, w * 0.58);
    const innerH = Math.max(1, h * 0.58);

    const lineCount = Math.max(1, text.split('\n').length);
    const textH = Math.ceil(fontSize * 1.25 * lineCount);

    return (
      <HTMLContainer
        style={{
          pointerEvents: 'all',
          width: w,
          height: h,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <path
            d={pathD}
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Text Container centered strictly in the center of the diamond */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: isEditing ? 'all' : 'none',
            zIndex: 2,
            padding: '8px',
          }}
        >
          {isEditing ? (
            <ControlledDiamondTextarea
              shape={shape}
              editor={this.editor}
              innerW={innerW}
              innerH={innerH}
              fontSize={fontSize}
            />
          ) : text ? (
            <span
              style={{
                color: '#0f172a',
                fontWeight: 500,
                fontSize: `${fontSize}px`,
                fontFamily: "var(--tl-font-draw), 'Shantell Sans', cursive, system-ui, -apple-system, sans-serif",
                textAlign: 'center',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.25,
                height: `${textH}px`,
                maxWidth: `${innerW}px`,
                display: 'block',
              }}
            >
              {text}
            </span>
          ) : null}
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: TLDiamondShape) {
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    return (
      <polygon
        points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`}
      />
    );
  }
}
