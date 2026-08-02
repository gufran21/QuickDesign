import React from 'react';
import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  TLBaseShape,
  RecordProps,
  T,
} from '@tldraw/tldraw';

export type TLSquareShapeProps = {
  w: number;
  h: number;
  color: string;
  text: string;
};

export type TLSquareShape = TLBaseShape<'square', TLSquareShapeProps>;

export class SquareShapeUtil extends ShapeUtil<TLSquareShape> {
  static override type = 'square' as const;

  static override props: RecordProps<TLSquareShape> = {
    w: T.nonZeroNumber,
    h: T.nonZeroNumber,
    color: T.string,
    text: T.string,
  };

  getDefaultProps(): TLSquareShapeProps {
    return {
      w: 90,
      h: 90,
      color: 'light-blue',
      text: 'Component',
    };
  }

  override isAspectRatioLocked = () => true;

  getGeometry(shape: TLSquareShape) {
    const size = Math.max(shape.props.w, shape.props.h);
    return new Rectangle2d({
      x: 0,
      y: 0,
      width: size,
      height: size,
      isFilled: true,
    });
  }

  component(shape: TLSquareShape) {
    const size = Math.max(shape.props.w, shape.props.h);
    const { text } = shape.props;

    return (
      <HTMLContainer
        style={{
          pointerEvents: 'all',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          border: '2px solid #60a5fa',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          position: 'relative',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            fontFamily: 'monospace',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            textAlign: 'center',
            padding: '4px',
          }}
        >
          {text || 'Square'}
        </span>
      </HTMLContainer>
    );
  }

  indicator(shape: TLSquareShape) {
    const size = Math.max(shape.props.w, shape.props.h);
    return <rect width={size} height={size} rx={8} />;
  }
}
