import React from 'react';
import {
  HTMLContainer,
  Rectangle2d,
  TLBaseShape,
  RecordProps,
  T,
} from '@tldraw/tldraw';
import { BaseBoxShapeUtil, resizeBox } from '@tldraw/editor';

export type TLDatabaseShapeProps = {
  w: number;
  h: number;
  color: string;
  text: string;
};

export type TLDatabaseShape = TLBaseShape<'database', TLDatabaseShapeProps>;

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
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    const text = shape.props.text || '';

    const strokeWidth = 2.5;
    const ry = Math.min(32, Math.max(4, h * 0.22));

    // Dynamic text size fitting nicely inside the cylinder when provided
    const maxChars = Math.max(text.length, 6);
    const fontSize = Math.max(10, Math.min(18, Math.floor((w - 16) / (maxChars * 0.65))));

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

        {/* Render label only if provided by user */}
        {text ? (
          <span
            style={{
              position: 'relative',
              zIndex: 2,
              color: '#0f172a',
              fontWeight: 700,
              fontSize: `${fontSize}px`,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              textAlign: 'center',
              padding: '0 8px',
              marginTop: `${ry * 0.3}px`,
              maxWidth: `${Math.max(1, w - 12)}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {text}
          </span>
        ) : null}
      </HTMLContainer>
    );
  }

  override indicator(shape: TLDatabaseShape) {
    const w = Math.max(1, shape.props.w);
    const h = Math.max(1, shape.props.h);
    return <rect width={w} height={h} rx={4} />;
  }
}
