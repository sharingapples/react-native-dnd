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
import React, { Component, PropTypes } from 'react';
import { View, Animated } from 'react-native';

class DragDropContext extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
  };

  static childContextTypes = {
    pan: PropTypes.instanceOf(Animated.ValueXY).isRequired,
    registerDropTarget: PropTypes.func.isRequired,
    startDrag: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this._dropTargets = [];
    this._drag = null;
    this.state = {
      dragging: null,
      target: null,
      pan: new Animated.ValueXY(),
    };

    this.isDragging = false;
    this.dropTarget = null;

    this.state.pan.addListener((value) => {
      if (this.isDragging) {
        this._updateDropTarget(value.x, value.y);
      }
    });
  }

  /* React method for providing the context for DragSource and DragTarget */
  getChildContext() {
    return {
      pan: this.state.pan,

      registerDropTarget: (target) => {
        this._dropTargets.push(target);
        return () => {
          this._dropTargets = this._dropTargets.filter(t => t !== target);
        };
      },

      startDrag: (handle, x, y) => {
        this.isDragging = true;
        this.dropTarget = null;

        this._updateDropTarget(x, y);

        // this.state.pan.setValue(handle.value);
        this.state.pan.setOffset(handle.offset);

        this.setState({
          dragging: handle,
        });

        // Return a drag ender method
        return () => {
          this.isDragging = false;
          this.setState({
            dragging: null,
          }, () => this.state.pan.setValue({ x: 0, y: 0 }));

          const params = {
            handle: this.state.dragging,
            x: this.state.pan.x.__getValue(), // eslint-disable-line no-underscore-dangle
            y: this.state.pan.y.__getValue(), // eslint-disable-line no-underscore-dangle
          };

          if (this.dropTarget) {
            this.dropTarget.onDrop(params);
          }

          return {
            complete: !!this.dropTarget,
            params,
          };
        };
      },
    };
  }

  _updateDropTarget(x, y) {
    const params = { handle: this.state.dragging, x, y };
    const target = this._dropTargets.find(t => t.contains(params));

    if (target !== this.dropTarget) {
      if (this.dropTarget) {
        this.dropTarget.onDragOut(params);
      }
      this.dropTarget = target;
      if (this.dropTarget) {
        this.dropTarget.onDragIn(params);
      }
    } else if (this.dropTarget) {
      this.dropTarget.onDragOver(params);
    }
  }

  render() {
    const { dragging, pan } = this.state;
    const { children } = this.props;

    return (
      <View {...this.props}>
        { children }
        { dragging &&
          <Animated.View style={{ position: 'absolute', transform: pan.getTranslateTransform() }}>
            {dragging.element}
          </Animated.View> }
      </View>
    );
  }
}

export default DragDropContext;
