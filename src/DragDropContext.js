/**
 * DragDropContext provides the working layer for the Drag Drop
 * to work within the view. It works in the following way
 *   1. Keeps track of the drop target within the context
 *      The DropTargets register themselves after mounting
 *      and unregisters during unmounting
 *   2. The DragSource passes over the dragging mechanism to the
 *      context for a proper handling. It provides the visual
 *      interface for the drag being made. The DragDropContext
 *      implementing view must override 'getDropObject(handle)'
 *      to provide a relevant element to be displayed during the
 *      drag.
 *   3. It searches for DropTargets and calls in the drag life cycle
 *      methods on the target
 *      * onDragOver
 *      * onDragOut
 *      * onDragRelease
 */
'use strict';

import React, { View, StyleSheet } from 'react-native';

// The number of milliseconds after which the drag over event is called
const DRAG_IMPL_TIMER = 10;

class DragDropContext extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.dropTargets = [];
    this.state = {
      drag: null,
      dragX: 0,
      dragY: 0,
    };
    this.timer = null;
    this.updateTarget = this.updateTarget.bind(this);
  }

  /**
   * Retrieve the scale factor of the underlying view that renders all the
   * drag sources and drop targets
   * @return {number} A scale which is by default 1
   */
  get scale() {
    return this.props.scale;
  }

  /* React method for providing the context for DragSource and DragTarget */
  getChildContext() {
    return {
      dragDropContext: this,
    };
  }

  /* Method invoked by DragTarget for registration */
  register(target) {
    this.dropTargets.push(target);
  }

  /* Method invoked by DragTarget for removal */
  unregister(target) {
    const idx = this.dropTargets.indexOf(target);
    if (idx !== -1) {
      this.dropTargets.slice(idx, 1);
    } else if (__DEV__) {
      console.error('Unregistering target from a DragDropContext that has\'t been registered');
    }
  }

  _findTarget(handle, x, y) {
    return this.dropTargets.find(target => target.contains(handle, x, y));
  }
  /**
   * Drag start event. Called from DragSource. The method is respon
   * @param  {object} handle The object that is being dragged
   * @param  {number} x      [description]
   * @param  {number} y      [description]
   */
  startDrag(handle, x, y) {
    // Get the drag object from the application
    const dragObject = this.props.getDragObject(handle, x, y);

    // if the application doesn't want the default drag over
    // visualisation it would return null here
    if (dragObject != null) {
      this.setState({
        drag: dragObject,
        dragX: x,
        dragY: y,
      });
    } else {
      // Don't want the render to be invoked
      this.state.drag = null;
      this.state.handle = handle;
      this.state.dragX = x;
      this.state.dragY = y;
    }

    // Keep track of the target
    this.target = this._findTarget(handle, x, y);
    if (this.target != null) {
      this.target.onDragOver(handle, x, y);
    }
  }

  updateDrag(handle, x, y) {
    // Clear out any pending timeout because of a previous drag
    if (this.timer != null) {
      clearTimeout(this.timer);
    }

    // Keep track of the state
    this.state.handle = handle;
    this.state.dragX = x;
    this.state.dragY = y;

    // Start the drag timer. Using this timer to make the drag
    // as smooth as possible, by defering the processing to a
    // later point when the user keeps the drag still
    this.timer = setTimeout(this.updateTarget, DRAG_IMPL_TIMER);

    // if the drag isn't affecting the visualation no need to do anyting
    if (!this.state.drag) {
      return;
    }

    // Directly setting the coordinates, skipping the
    // react render flow
    this.refs.drag.setNativeProps({
      style: {
        left: x,
        top: y,
      },
    });
  }

  componentWillUnmount() {
    // Free the timer if there was any set
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  updateTarget() {
    // The timer has expired update the target with the drag state
    const { handle, dragX, dragY } = this.state;
    this.timer = null;

    // Check for available dropTargets and return one that is available
    const target = this._findTarget(handle, dragX, dragY);
    if (target != this.target) {
      if (this.target != null) {
        this.target.onDragOut(handle, dragX, dragY);
      }

      this.target = target;
    }

    if (target != null) {
      target.onDragOver(handle, dragX, dragY);
    }
  }

  endDrag(handle, x, y) {
    // Clear any timer that might have been initialized during drag
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    let res = false;
    if (this.target != null) {
      this.target.onDragRelease(handle, x, y);
      res = true;
    }

    this.state.dragX = this.state.dragY = null;
    this.state.handle = null;
    this.target = null;

    if (this.state.drag != null) {
      this.setState({
        drag: null,
      });
    };

    return res;
  }

  render() {
    const { drag, dragX, dragY } = this.state;
    return (
      <View style={this.props.style}>
        { this.props.children }
        { drag &&
          <View ref="drag"
                style={[styles.holder, { left: dragX, top: dragY }]}>
            {drag}
          </View> }
      </View>
    );
  }
}

DragDropContext.propTypes = {
  style: View.propTypes.style,
  getDragObject: React.PropTypes.func.isRequired,
  scale: React.PropTypes.number,
};

DragDropContext.defaultProps = {
  scale: 1,
};

DragDropContext.childContextTypes = {
  dragDropContext: React.PropTypes.object,
};

const styles = StyleSheet.create({
  holder: {
    position: 'absolute',
  },
});

export default DragDropContext;
