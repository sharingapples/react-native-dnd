'use strict';

import React, { Component, PropTypes } from 'react';
import { View, PanResponder, NativeMethodsMixin } from 'react-native';

const DragSource = React.createClass({
  mixins: [NativeMethodsMixin],

  getInitialState() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onDragStart,
      onPanResponderMove: this.onDragMove,
      onPanResponderRelease: this.onDragEnd,
    });
    this.dragHandle = null;
    this.dragPos = null;
    return null;
  },

  onLayout() {
    if (this.props.onLayout) {
      this.refs.view.measure((x, y, width, height, pageX, pageY) => {
        this.props.onLayout({
          left: pageX,
          top: pageY,
          width: width,
          height: height,
        });
      });
    }
  },

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
    this.dragPos = [x, y];
    this.dragged = false;  // The drag is not considered yet
  },

  updateHandle() {
    this.dragHandle = this.props.getDragHandle(this.dragStartX, this.dragStartY);
    this.context.dragDropContext.updateHandle(this.dragHandle);
  },

  // The drag has taken place
  onDragMove(e, gesture) {
    console.log('DragSource::onDragMove');
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
    this.dragPos = [x, y];
    this.context.dragDropContext.updateDrag(this.dragHandle, x, y);
  },

  /**
   * Helper method to end the dragging abruptly, without the PanResponder
   * @return
   */
  stopDrag() {
    if (this.dragged) {
      this.dragged = false;
      this.props.onDragEnd(this.dragHandle,
          !this.context.dragDropContext.endDrag(this.dragHandle,
            this.dragPos[0], this.dragPos[1])
      );
    }
  },

  // The drag has end now
  onDragEnd(e, gesture) {
    if (this.dragged) {
      this.dragged = false;
      const [x, y] = [
        gesture.moveX * this.context.dragDropContext.scale,
        gesture.moveY * this.context.dragDropContext.scale,
      ];
      this.props.onDragEnd(this.dragHandle,
          !this.context.dragDropContext.endDrag(this.dragHandle, x, y));
    }
  },

  render() {
    return (
      <View ref="view" {...this.props} onLayout={this.onLayout}
          {...this.panResponder.panHandlers} pointerEvents="box-only">
        { this.props.children }
      </View>
    );
  },

  contextTypes: {
    dragDropContext: React.PropTypes.object.isRequired,
  },

  propTypes: {
    style: View.propTypes.style,
    onLayout: PropTypes.func,
    getDragHandle: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
  },
});

export default DragSource;
