import React, { useState, useEffect, useRef } from 'react';
import {
  HTMLContainer,
  Rectangle2d,
  TLBaseShape,
  RecordProps,
  T,
  useIsEditing,
} from '@tldraw/tldraw';
import { BaseBoxShapeUtil, resizeBox } from '@tldraw/editor';

export type TLDatabaseShapeProps = {
  w: number;
  h: number;
  color: string;
  text: string;
};

export type TLDatabaseShape = TLBaseShape<'database', TLDatabaseShapeProps>;

const ControlledDatabaseTextarea: React.FC<{
  shape: TLDatabaseShape;
  editor: any;
  innerMaxW: number;
  innerMaxH: number;
  fontSize: number;
}> = ({ shape, editor, innerMaxW, innerMaxH, fontSize }) => {
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
      type: 'database',
      props: { ...shape.props, text: val },
    });
  };

  const lineCount = Math.max(1, text.split('\n').length);
  const textH = Math.ceil(fontSize * 1.25 * lineCount);

  return (
    <div
      style={{
        width: `${innerMaxW}px`,
        height: `${innerMaxH}px`,
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

export class DatabaseShapeUtil extends BaseBoxShapeUtil<TLDatabaseShape> {
  static override type = 'database' as const;

  static override props: RecordProps<TLDatabaseShape> = {
    w: T.nonZeroNumber,
    h: T.nonZeroNumber,
    color: T.string,
    text: T.string,
  };

  getDefaultProps(): TLDatabaseShapeProps {
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

  override onResize = (shape: TLDatabaseShape, info: any) => {
    return resizeBox(shape, info, { minWidth: 1, minHeight: 1 });
  };

  override getGeometry(shape: TLDatabaseShape) {
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    return new Rectangle2d({
      x: 0,
      y: 0,
      width: w,
      height: h,
      isFilled: true,
    });
  }

  component(shape: TLDatabaseShape) {
    const isEditing = useIsEditing(shape.id);
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    const text = shape.props.text || '';

    const strokeWidth = 2.5;
    const ry = Math.min(32, Math.max(4, h * 0.22));
    const bottomH = Math.max(1, h - ry);

    // Font scaling in exact proportion to shape size
    const minDim = Math.min(w, h);
    const fontSize = Math.max(12, Math.min(48, Math.floor(minDim * 0.16)));

    const innerMaxW = Math.max(1, w - 24);
    const innerMaxH = Math.max(1, bottomH - 16);

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
          {/* Main 3D Cylinder Body */}
          <path
            d={`
              M ${strokeWidth / 2} ${ry}
              V ${Math.max(ry, h - ry)}
              A ${Math.max(1, w / 2 - strokeWidth / 2)} ${ry} 0 0 0 ${Math.max(1, w - strokeWidth / 2)} ${Math.max(ry, h - ry)}
              V ${ry}
              Z
            `}
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />

          {/* Top Ellipse Cap */}
          <ellipse
            cx={w / 2}
            cy={ry}
            rx={Math.max(1, w / 2 - strokeWidth / 2)}
            ry={Math.max(1, ry - strokeWidth / 2)}
            fill="#f8fafc"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Text Container centered strictly in the BOTTOM part (ignoring top cap y = 0..ry) */}
        <div
          style={{
            position: 'absolute',
            top: `${ry}px`,
            left: 0,
            width: `${w}px`,
            height: `${bottomH}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: isEditing ? 'all' : 'none',
            zIndex: 2,
            padding: '4px 12px',
          }}
        >
          {isEditing ? (
            <ControlledDatabaseTextarea
              shape={shape}
              editor={this.editor}
              innerMaxW={innerMaxW}
              innerMaxH={innerMaxH}
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
                maxWidth: `${innerMaxW}px`,
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

  override indicator(shape: TLDatabaseShape) {
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    return <rect width={w} height={h} rx={4} />;
  }
}
