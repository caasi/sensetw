import * as React from 'react';
import { Group, Rect, Circle } from 'react-konva';
import Layout, { TransformerForProps } from '../../Layout';
import Text from '../../Layout/Text';
import Selectable from '../../Layout/Selectable';
import TagList from '../TagList';
import * as D from '../../../graphics/drawing';
import * as T from '../../../types';
import { transformObject } from '../../../types/viewport';
import { noop, toTags } from '../../../types/utils';
import { Event as KonvaEvent } from '../../../types/konva';

interface OwnProps {
  isDirty?: boolean;
  mapObject: T.ObjectData;
  card: T.CardData;
  selected?: boolean;
  handleSelect?(object: T.ObjectData): void;
  handleDeselect?(object: T.ObjectData): void;
  handleDragStart?(e: KonvaEvent.Mouse): void;
  handleDragMove?(e: KonvaEvent.Mouse): void;
  handleDragEnd?(e: KonvaEvent.Mouse): void;
  handleTouchStart?(e: KonvaEvent.Touch): void;
  handleTouchMove?(e: KonvaEvent.Touch): void;
  handleTouchEnd?(e: KonvaEvent.Touch): void;
  openCard?(id: T.CardID): void;
}

type Props = OwnProps & TransformerForProps;

interface State {
  containerWidth: number;
  containerHeight: number;
}

const color = {
  [T.CardType.NORMAL]: 'rgba(255, 255, 255, 1)',
  [T.CardType.NOTE]: 'rgba(255, 227, 132, 1)',
  [T.CardType.QUESTION]: 'rgba(255, 236, 239, 1)',
  [T.CardType.ANSWER]: 'rgba(222, 255, 245, 1)'
};

const colorFromType = (cardType: T.CardType): string =>
  color[cardType] || 'rgba(255, 255, 255, 1)';

const summaryLimit = Infinity;
const descriptionLimit = Infinity;

class Card extends React.PureComponent<Props, State> {
  static style = {
    borderRadius: 4,
    padding: {
      top: 8,
      right: 10,
      bottom: 8,
      left: 10,
    },
    textGap: 10,
    dirty: {
      radius: 5,
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      color: '#3ad8fa',
    },
    description: {
      fontFamily: 'sans-serif',
      fontSize: 13,
      lineHeight: 20 / 13,
      color: '#5a5a5a',
    },
    summary: {
      fontFamily: 'sans-serif',
      fontSize: 16,
      lineHeight: 24 / 16,
      color: '#000000',
    },
    shadow: {
      blur: 10,
      color: '#999',
      offset: { x: 2, y: 3 },
    },
    selected: {
      offset: { x: -6, y: -6 },
      borderRadius: 8,
      color: '#3ad8fa',
      strokeWidth: 3,
    },
  };

  state = {
    containerWidth: 0,
    containerHeight: 0,
  };

  handleContainerResize = (containerWidth: number, containerHeight: number): void => {
    this.setState({ containerWidth, containerHeight });
  }

  render() {
    const { transform, inverseTransform, isDirty = false } = this.props;
    const { containerWidth, containerHeight } = this.state;
    const style = transformObject(transform, Card.style) as typeof Card.style;
    const { data } = this.props.mapObject;
    let transformed = this.props.transform({
      x: this.props.mapObject.x,
      y: this.props.mapObject.y,
      // XXX: deprecated
      width: this.props.mapObject.width,
      // XXX deprecated
      height: this.props.mapObject.height,
    });
    const { width } = transformed;
    const textWidth = width - style.padding.left - style.padding.right;
    transformed.width = containerWidth;
    transformed.height = containerHeight;
    const { left: x, top: y } = D.rectFromBox(transformed);
    const {summary, description, cardType, tags} = this.props.card;
    const sanitizedSummary = summary.substr(0, summaryLimit);
    const sanitizedDescription   = description.substr(0, descriptionLimit);
    const height = style.padding.top + containerHeight + style.padding.bottom;
    const selectedWidth = width - style.selected.offset.x * 2;
    const selectedHeight = height - style.selected.offset.y * 2;

    const handleSelect     = this.props.handleSelect     || noop;
    const handleDeselect   = this.props.handleDeselect   || noop;
    const handleDragStart  = this.props.handleDragStart  || noop;
    const handleDragMove   = this.props.handleDragMove   || noop;
    const handleDragEnd    = this.props.handleDragEnd    || noop;
    const handleTouchStart = this.props.handleTouchStart || noop;
    const handleTouchMove  = this.props.handleTouchMove  || noop;
    const handleTouchEnd   = this.props.handleTouchEnd   || noop;
    const openCard         = this.props.openCard         || noop;
    const bgColor          = colorFromType(cardType);

    const selected = (
      <Rect
        x={style.selected.offset.x}
        y={style.selected.offset.y}
        width={selectedWidth}
        height={selectedHeight}
        cornerRadius={style.selected.borderRadius}
        stroke={style.selected.color}
        strokeWidth={style.selected.strokeWidth}
      />);

    return (
      <Selectable
        selected={this.props.selected}
        onSelect={(e) => {
          e.cancelBubble = true;
          handleSelect(this.props.mapObject);
        }}
        onDeselect={(e) => {
          e.cancelBubble = true;
          handleDeselect(this.props.mapObject);
        }}
      >
        <Group
          x={x}
          y={y}
          draggable={true}
          onDblClick={() => {
            handleSelect(this.props.mapObject);
            openCard(data);
          }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {this.props.selected ? selected : null}
          <Rect
            width={width}
            height={height}
            fill={bgColor}
            cornerRadius={style.borderRadius}
            shadowBlur={style.shadow.blur}
            shadowOffsetX={style.shadow.offset.x}
            shadowOffsetY={style.shadow.offset.y}
            shadowColor={style.shadow.color}
          />
          {
            isDirty &&
            <Circle
              x={width - style.dirty.padding.right}
              y={style.dirty.padding.top}
              radius={style.dirty.radius}
              fill={style.dirty.color}
            />
          }
          <Layout
            direction="column"
            x={style.padding.left}
            y={style.padding.top}
            margin={style.textGap}
            onResize={this.handleContainerResize}
          >
            {
              sanitizedSummary.length === 0
                ? null
                : (
                  <Text
                    width={textWidth}
                    fontSize={style.summary.fontSize}
                    fontFamily={style.summary.fontFamily}
                    lineHeight={style.summary.lineHeight}
                    fill={style.summary.color}
                    text={sanitizedSummary}
                  />
                )
            }
            {
              sanitizedDescription.length === 0
                ? null
                : (
                  <Text
                    width={textWidth}
                    fontSize={style.description.fontSize}
                    fontFamily={style.description.fontFamily}
                    lineHeight={style.description.lineHeight}
                    fill={style.description.color}
                    text={sanitizedDescription}
                  />
                )
            }
            {
              tags.length === 0
                ? null
                : (
                  <TagList
                    transform={transform}
                    inverseTransform={inverseTransform}
                    width={textWidth}
                    tags={toTags(tags)}
                  />
                )
            }
          </Layout>
        </Group>
      </Selectable>
    );
  }
}

export default Card;
