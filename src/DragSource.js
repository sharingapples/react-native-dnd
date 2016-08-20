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
    });

    this.dragHandle = null;
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

    Promise.resolve(this.props.getDragHandle(px, py)).then(handle => {
      if (handle !== null) {
        this._dragging = {
          handle: handle,
          element: this.props.getDragElement(handle),
          startX: px,
          startY: py,
          x: px,
          y: py,
        };

        this.props.onDragStart && this.props.onDragStart(handle, px, py);
        this.context.dragDropContext.startDrag(this._dragging, px, py);
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

      this._dragging.x = x;
      this._dragging.y = y;

      // Update the dragging object
      this.context.dragDropContext.updateDrag(this._dragging);
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

      this._dragging.x = x;
      this._dragging.y = y;

      // Do the stopping
      this.stopDrag(this._dragging);
    }
  }

  /**
   * Helper method to end the dragging abruptly, without the PanResponder
   * @return
   */
  stopDrag() {
    if (this._dragging) {
      const handle = this._dragging.handle;
      this.context.dragDropContext.endDrag(this._dragging).then(cancelled => {
        this.props.onDragEnd(handle, cancelled);
      });
      this._dragging = null;
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
