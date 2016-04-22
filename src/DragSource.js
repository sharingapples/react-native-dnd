'use strict';

import React, { Component, View, PanResponder, PropTypes } from 'react-native';

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
    const[x, y] = [gesture.x0, gesture.y0];
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
    const [x, y] = [gesture.moveX, gesture.moveY];
    this.context.dragDropContext.updateDrag(this.dragHandle, x, y);
  }

  // The drag has end now
  onDragEnd(e, gesture) {
    if (this.dragged) {
      const [x, y] = [gesture.moveX, gesture.moveY];
      if (!this.context.dragDropContext.endDrag(this.dragHandle, x, y)) {
        this.props.onDragCancel(this.dragHandle);
      }
    }
  }

  render() {
    return (
      <View style={this.props.style} {...this.panResponder.panHandlers}>
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
  getDragHandle: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

export default DragSource;
