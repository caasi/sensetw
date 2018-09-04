import * as React from 'react';
import { Group, Rect } from 'react-konva';
import { MapObjectForProps } from '../../Map/props';
import Selectable from '../../Layout/Selectable';
import { rectFromBox } from '../../../graphics/drawing';
import { CardData, CardType } from '../../../types';
import { transformObject } from '../../../types/viewport';
import { noop } from '../../../types/utils';
import { Event as KonvaEvent } from '../../../types/konva';

type Props = MapObjectForProps<CardData>;

const colors = {
  [CardType.ANSWER]: '#c0e2d8',
  [CardType.NORMAL]: '#d8d8d8',
  [CardType.NOTE]: '#ffe384',
  [CardType.QUESTION]: '#e5ced1',
};

const colorFromType = (cardType: CardType): string =>
  colors[cardType] || '#ffffff';

class Card extends React.PureComponent<Props> {
  static style = {
    borderRadius: 9,
    width: 126,
    height: 84,
    padding: {
      top: 12,
      right: 9,
      bottom: 12,
      left: 9,
    },
    selected: {
      borderRadius: 27,
      color: '#3ad8fa',
      offset: {
        x: -18,
        y: -18,
      },
      strokeWidth: 9,
    }
  };

  state = {
    newlySelected: false,
  };

  render() {
    const {
      transform,
      object,
      data,
      selected = false,
      onSelect = noop,
      onDeselect = noop,
      onMouseOver = noop,
      onMouseOut = noop,
      onDragStart = noop,
      onDragMove = noop,
      onDragEnd = noop,
      onOpen = noop,
    } = this.props;
    // TODO: should I use the object dimension or the style dimension?
    const transformed = transform(object);
    const { width, height } = transformed;
    const { left: x, top: y } = rectFromBox(transformed);
    const style = transformObject(transform, Card.style) as typeof Card.style;

    const selectedWidth = width - style.selected.offset.x * 2;
    const selectedHeight = height - style.selected.offset.y * 2;
    const selectedRect = selected && (
      <Rect
        x={style.selected.offset.x}
        y={style.selected.offset.y}
        width={selectedWidth}
        height={selectedHeight}
        cornerRadius={style.selected.borderRadius}
        stroke={style.selected.color}
        strokeWidth={style.selected.strokeWidth}
      />
    );

    return (
      <Selectable
        selected={selected}
        onSelect={(e: KonvaEvent.Mouse) => {
          e.cancelBubble = true;
          onSelect(e, object);
        }}
        onDeselect={(e: KonvaEvent.Mouse) => {
          e.cancelBubble = true;
          onDeselect(e, object);
        }}
      >
        <Group
          draggable
          x={x}
          y={y}
          onDblClick={(e: KonvaEvent.Mouse) => {
            onSelect(e, object);
            onOpen(e, object.data);
          }}
          onMouseOver={(e: KonvaEvent.Mouse) => onMouseOver(e, object)}
          onMouseOut={(e: KonvaEvent.Mouse) => onMouseOut(e, object)}
          onDragStart={(e: KonvaEvent.Mouse) => onDragStart(e, object)}
          onDragMove={(e: KonvaEvent.Mouse) => onDragMove(e, object)}
          onDragEnd={(e: KonvaEvent.Mouse) => onDragEnd(e, object)}
        >
          {selectedRect}
          <Rect
            width={width}
            height={height}
            cornerRadius={style.borderRadius}
            fill={colorFromType(data.cardType)}
          />
        </Group>
      </Selectable>
    );
  }
}

export default Card;