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

    this._dragging = null;
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
    const[px, py] = [
      gesture.x0 * this.context.dragDropContext.scale,
      gesture.y0 * this.context.dragDropContext.scale,
    ];

    this._lastX = px;
    this._lastY = py;

    // If another drag is in process, ignore the start
    if (this._dragging !== null) {
      return;
    }

    this._dragging = false;

    Promise.resolve(this.props.getDragHandle(px, py)).then(handle => {
      if (handle !== null) {
        this._dragging = {
          handle: handle,
          element: this.props.getDragElement(handle),
          startX: px,
          startY: py,
        };

        this.props.onDragStart && this.props.onDragStart(handle, px, py);
        this.context.dragDropContext.startDrag(this._dragging, px, py);
      } else {
        this._dragging = null;
      }
    });
  }

  // The drag has taken place
  onDragMove(e, gesture) {
    if (this._dragging) {
      // Get the drag coordinates
      const [x, y] = [
        gesture.moveX * this.context.dragDropContext.scale,
        gesture.moveY * this.context.dragDropContext.scale,
      ];

      this._lastX = x;
      this._lastY = y;

      // Update the dragging object
      this.context.dragDropContext.updateDrag(this._dragging, x, y);
    }
  }

  // The drag has ended now
  onDragEnd(e, gesture) {
    if (this._dragging) {
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
  }

  /**
   * Helper method to end the dragging abruptly, without the PanResponder
   * @return
   */
  stopDrag() {
    let x = this._lastX;
    let y = this._lastY;

    const dragging = this._dragging;
    this._dragging = null;

    if (dragging) {
      const handle = dragging.handle;
      this.context.dragDropContext.endDrag(dragging, x, y).then(cancelled => {
        this.props.onDragEnd(handle, cancelled);
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
