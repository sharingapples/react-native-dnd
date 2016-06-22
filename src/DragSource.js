'use strict';

import React, { Component, View, PropTypes } from 'react';
import { PanResponder } from 'react-native';

class DragSource extends React.Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onDragStart.bind(this),
      onPanResponderMove: this.onDragMove.bind(this),
      onPanResponderRelease: this.onDragEnd.bind(this),
    });

    this.dragHandle = null;
  }

  // The drag has started on the element
  onDragStart(e, gesture) {
    // Keep the coordinates where the drag started.
    const[x, y] = [
      gesture.x0 * this.context.dragDropContext.scale,
      gesture.y0 * this.context.dragDropContext.scale,
    ];
    this.dragHandle = this.props.getDragHandle(x, y);
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragged = false;  // The drag is not considered yet
  }

  // The drag has taken place
  onDragMove(e, gesture) {
    if (this.dragHandle === null) {
      return;
    }

    // Consider the drag has started
    if (!this.dragged) {
      this.dragged = true;
      this.props.onDragStart(this.dragHandle, this.dragStartX, this.dragStartY);
      this.context.dragDropContext.startDrag(
          this.dragHandle, this.dragStartX, this.dragStartY);
    }

    // Do the first move
    const [x, y] = [
      gesture.moveX * this.context.dragDropContext.scale,
      gesture.moveY * this.context.dragDropContext.scale,
    ];
    this.context.dragDropContext.updateDrag(this.dragHandle, x, y);
  }

  // The drag has end now
  onDragEnd(e, gesture) {
    if (this.dragged) {
      const [x, y] = [
        gesture.moveX * this.context.dragDropContext.scale,
        gesture.moveY * this.context.dragDropContext.scale,
      ];
      this.props.onDragEnd(this.dragHandle,
          !this.context.dragDropContext.endDrag(this.dragHandle, x, y));
    }
  }

  render() {
    const { style, onLayout } = this.props;
    return (
      <View style={style} onLayout={onLayout} {...this.panResponder.panHandlers}>
        { this.props.children }
      </View>
    );
  }
}

DragSource.contextTypes = {
  dragDropContext: React.PropTypes.object.isRequired,
};

DragSource.propTypes = {
  style: View.propTypes.style,
  onLayout: PropTypes.func,
  getDragHandle: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default DragSource;
