import * as React from 'react';
import { connect } from 'react-redux';
import * as CO from '../../components/Map';
import * as T from '../../types';
import * as F from '../../types/sense/focus';
import * as OE from '../../types/object-editor';

interface OwnProps extends CO.OwnProps {
  id: T.MapID;
}

interface StateFromProps extends CO.StateFromProps {
  scope: { type: T.MapScopeType, box?: T.BoxID };
}

interface DispatchFromProps extends CO.DispatchFromProps {
  actions: {
    addObjectToSelection(id: T.ObjectID): T.ActionChain,
    toggleObjectSelection(id: T.ObjectID): T.ActionChain,
    clearSelection(): T.ActionChain,
    loadObjects(id: T.MapID): T.ActionChain,
    loadCards(id: T.MapID): T.ActionChain,
    loadBoxes(id: T.MapID): T.ActionChain,
    moveObject(id: T.ObjectID, x: number, y: number): T.ActionChain,
    addCardToBox(card: T.ObjectID, box: T.BoxID): T.ActionChain,
    removeCardFromBox(card: T.ObjectID, box: T.BoxID): T.ActionChain,
    openBox(box: T.BoxID): T.ActionChain,
    stageMouseUp(): T.ActionChain,
    stageMouseDown(): T.ActionChain,
    stageMouseMove({ dx, dy }: { dx: number, dy: number }): T.ActionChain,
    focusObject(focus: F.Focus): T.ActionChain,
    changeStatus(status: OE.StatusType): T.ActionChain,
  };
}

type Props = StateFromProps & DispatchFromProps & OwnProps;

class Map extends React.Component<Props> {
  componentDidMount() {
    this.props.actions.loadObjects(this.props.id);
    this.props.actions.loadCards(this.props.id);
    this.props.actions.loadBoxes(this.props.id);
  }

  render() {
    let componentProps = this.props;
    if (this.props.scope.type === T.MapScopeType.BOX && !!this.props.scope.box) {
      const box = this.props.boxes[this.props.scope.box];
      if (!!box) {
        const objects = Object.keys(box.contains).reduce(
          (acc, id) => {
            if (!!this.props.objects[id]) {
              acc[id] = this.props.objects[id];
            }
            return acc;
          },
          {});
        componentProps = { ...this.props, objects };
      }
    } else {
      const objects = Object.values(this.props.objects)
        .filter(o => !o.belongsTo)
        .reduce(
          (acc, o) => {
            acc[o.id] = o;
            return acc;
          },
          {});
      componentProps = { ...this.props, objects };
    }
    return <CO.Map {...componentProps} />;
  }
}

export default connect<StateFromProps, DispatchFromProps, OwnProps>(
  (state: T.State) => ({
    selection: state.selection,
    scope: state.senseMap.scope,
    objects: state.senseObject.objects,
    cards: state.senseObject.cards,
    boxes: state.senseObject.boxes,
    input: state.input,
    stage: state.stage,
  }),
  (dispatch: T.Dispatch) => ({
    actions: {
      addObjectToSelection: (id: T.ObjectID) =>
        dispatch(T.actions.selection.addObjectToSelection(id)),
      toggleObjectSelection: (id: T.ObjectID) =>
        dispatch(T.actions.selection.toggleObjectSelection(id)),
      clearSelection: () =>
        dispatch(T.actions.selection.clearSelection()),
      loadObjects: (id: T.MapID) =>
        dispatch(T.actions.senseObject.loadObjects(id)),
      loadCards: (id: T.MapID) =>
        dispatch(T.actions.senseObject.loadCards(id)),
      loadBoxes: (id: T.MapID) =>
        dispatch(T.actions.senseObject.loadBoxes(id)),
      moveObject: (id: T.ObjectID, x: number, y: number) =>
        dispatch(T.actions.senseObject.moveObject(id, x, y)),
      addCardToBox: (card: T.ObjectID, box: T.BoxID) =>
        dispatch(T.actions.senseObject.addCardToBox(card, box)),
      removeCardFromBox: (card: T.ObjectID, box: T.BoxID) =>
        dispatch(T.actions.senseObject.removeCardFromBox(card, box)),
      openBox: (box: T.BoxID) =>
        dispatch(T.actions.senseMap.openBox(box)),
      stageMouseDown: () =>
        dispatch(T.actions.stage.stageMouseDown()),
      stageMouseUp: () =>
        dispatch(T.actions.stage.stageMouseUp()),
      stageMouseMove: ({ dx, dy }: { dx: number, dy: number }) =>
        dispatch(T.actions.stage.stageMouseMove({ dx, dy })),
      focusObject: (focus: F.Focus) =>
        dispatch(T.actions.editor.focusObject(focus)),
      changeStatus: (status: OE.StatusType) =>
        dispatch(T.actions.editor.changeStatus(status)),
    }
  })
)(Map);
