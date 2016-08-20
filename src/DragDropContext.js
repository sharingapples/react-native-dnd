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

import React, { Component, PropTypes } from 'react';
import { View, StyleSheet } from 'react-native';
import DragObject from './DragObject';

// The number of milliseconds after which the drag over event is called
const DRAG_IMPL_TIMER = 5;

class DragDropContext extends Component {
  constructor(props, context) {
    super(props, context);
    this._dropTargets = [];
    this._timer = null;
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

  /* Method invoked by DropTarget for registration */
  register(target) {
    // Order the target based on the zIndex, Keep the target with the higher
    // zIndex at the beginning, if the target has the same zIndex as the existing
    // target, it must be inserted at the end of the targets with the same
    // zIndex
    this._dropTargets.push(target);

    // order by zIndex in descending order,
    this._dropTargets.sort((a, b) => ((b.props.zIndex || 0) - (a.props.zIndex || 0)));
  }

  /* Method invoked by DragTarget for removal */
  unregister(target) {
    const idx = this._dropTargets.indexOf(target);
    if (idx !== -1) {
      this._dropTargets.splice(idx, 1);
    } else if (__DEV__) {
      console.error('Unregistering target from a DragDropContext that has\'t been registered');
    }
  }

  /**
   * Helper method based on promise to find the target for the given
   * dragging input
   */
  _findTarget(dragging) {
    const { handle, x, y }  = dragging;
    return Promise.all(
      this._dropTargets.map(target => target.contains(handle, x, y))
    ).then(res => {
      const idx = res.indexOf(true);
      return idx === -1 ? null : this._dropTargets[idx];
    });
  }

  /**
   * Drag start event. Called from DragSource. The method is respon
   * @param  {object} handle The object that is being dragged
   * @param  {number} x      [description]
   * @param  {number} y      [description]
   */
  startDrag(dragging) {
    // Update the drag UI
    const { x, y, element } = dragging;
    this.refs.drag.update(x, y, element);

    // get the target
    this._updateTarget(dragging);
  }

  updateDrag(dragging) {
    // Clear out any pending timeout because of a previous drag
    if (this._timer != null) {
      clearTimeout(this._timer);
    }

    // Start the drag timer. Using this timer to make the drag
    // as smooth as possible, by defering the processing to a
    // later point when the user keeps the drag still
    this._timer = setTimeout(this._updateTarget.bind(this, dragging), DRAG_IMPL_TIMER);

    // Update the drag UI
    const { x, y, element } = dragging;
    this.refs.drag.update(x, y, element);
  }

  /**
   * Ends the current drag
   * @return true if the drag ended on some target
   */
  endDrag(dragging) {
    // Clear the drag UI
    this.refs.drag.update(null, null, null);

    // Clear any timer that might have been initialized during drag
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    // Update the target
    return this._updateTarget(dragging).then(() => {
      // Release the drag
      const { handle, target, x, y } = dragging;
      if (target) {
        target.onDragRelease(handle, x, y);
        // The drag was not cancelled
        return false;
      } else {
        // the drag was cancelled
        return true;
      }
    });
  }

  componentWillUnmount() {
    // Free the timer if there was any set
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _updateTarget(dragging) {
    // The timer has expired update the target with the drag state
    const { handle, target, x, y } = dragging;
    this._timer = null;

    // Check if there is any change in the drop target
    return this._findTarget(dragging).then(newTarget => {
      if (target !== newTarget) {
        // Do the DragOut event on the older target
        if (target)
          target.onDragOut(handle, x, y);
        dragging.target = newTarget;
      }

      if (newTarget !== null) {
        newTarget.onDragOver(handle, x, y);
      }
    });
  }

  render() {
    return (
      <View style={this.props.style}>
        { this.props.children }
        <DragObject ref="drag" />
      </View>
    );
  }
}

DragDropContext.propTypes = {
  style: View.propTypes.style,
  getDragObject: PropTypes.func.isRequired,
  scale: PropTypes.number,
};

DragDropContext.defaultProps = {
  scale: 1,
};

DragDropContext.childContextTypes = {
  dragDropContext: PropTypes.object,
};

export default DragDropContext;
