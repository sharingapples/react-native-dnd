'use strict';

import React, { Component, PropTypes } from 'react';
import { View, PanResponder } from 'react-native';

class DragSource extends Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onDragStart.bind(this),
      onPanResponderMove: this.onDragMove.bind(this),
      onPanResponderRelease: this.onDragEnd.bind(this),
      onPanResponderTerminate: this.onDragEnd.bind(this),
    });

    this._dragStarted = null;
    this._dragHandle = null;
  }

  measure(callback) {
    this.refs.view.measure(callback);
  }

  componentWillUnmount() {
    // stop any dragging
    this.stopDrag();
  }

  // The drag has started on the element
  onDragStart(e, gesture) {
    // Keep the coordinates where the drag started.
    const [px, py] = [
      gesture.x0 * this.context.dragDropContext.scale,
      gesture.y0 * this.context.dragDropContext.scale,
    ];

    this._lastX = px;
    this._lastY = py;

    // If another drag is in process, ignore the start
    if (this._dragStarted) {
      return;
    }

    this._dragStarted = Promise.resolve(this.props.getDragHandle(px, py)).then(handle => {
      if (handle) {
        this._dragHandle = {
          handle,
          element: this.props.getDragElement(handle),
          startX: px,
          startY: py,
        };

        if (this.props.onDragStart) {
          this.props.onDragStart(handle, px, py);
        }

        this.context.dragDropContext.startDrag(this._dragHandle, px, py);

        return this._dragHandle;
      } else {
        this._dragHandle = null;
        return null;
      }
    });
  }

  // The drag has taken place
  onDragMove(e, gesture) {
    if (this._dragHandle) {
      // Get the drag coordinates
      const [x, y] = [
        gesture.moveX * this.context.dragDropContext.scale,
        gesture.moveY * this.context.dragDropContext.scale,
      ];

      this._lastX = x;
      this._lastY = y;

      // Update the dragging object
      this.context.dragDropContext.updateDrag(this._dragHandle, x, y);
    }
  }

  // The drag has ended now
  onDragEnd(e, gesture) {
    // Get the drag coordinates
    const [x, y] = [
      gesture.moveX * this.context.dragDropContext.scale,
      gesture.moveY * this.context.dragDropContext.scale,
    ];

    this._lastX = x;
    this._lastY = y;

    // Do the stopping
    this.stopDrag();
  }

  /**
   * Helper method to end the dragging abruptly, without the PanResponder
   * @return
   */
  stopDrag() {
    const x = this._lastX;
    const y = this._lastY;

    if (this._dragStarted) {
      const start = this._dragStarted;
      this._dragStarted = null;
      this._dragHandle = null;
      start.then(drag => {
        if (drag) {
          return this.context.dragDropContext.endDrag(drag, x, y).then(cancelled => {
            this.props.onDragEnd(drag.handle, cancelled);
          });
        }
      });
    }
  }

  render() {
    return (
      <View ref="view" {...this.props}
          {...this.panResponder.panHandlers} pointerEvents="box-only">
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
  getDragElement: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default DragSource;
