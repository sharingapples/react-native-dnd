'use strict';

import React, { Component, PropTypes, Children } from 'react';

class DropTarget extends React.Component {

  componentDidMount() {
    // Register the component within the context
    this.context.dragDropContext.register(this);
  }

  componentWillUnmount() {
    this.context.dragDropContext.unregister(this);
  }

  contains(handle, x, y) {
    return this.props.contains(handle, x, y);
  }

  onDragOver(handle, x, y) {
    this.props.onDragOver && this.props.onDragOver(handle, x, y);
  }

  onDragOut(handle, x, y) {
    this.props.onDragOut && this.props.onDragOut(handle, x, y);
  }

  onDragRelease(handle, x, y) {
    this.props.onDragRelease(handle, x, y);
  }

  render() {
    return Children.only(this.props.children);
  }

};

DropTarget.contextTypes = {
  dragDropContext: React.PropTypes.object.isRequired,
};

DropTarget.propTypes = {

  // The ordering of the targets that provide the order in which the target
  // are checked for contains
  zIndex: PropTypes.number,

  // The DropTarget can have a single child
  children: PropTypes.element.isRequired,

  // Check if the given handle and coordiantes are valid drops for this target
  contains: PropTypes.func.isRequired,

  // Event called when the handle is dragged over this target
  onDragOver: PropTypes.func,

  // Event called when the handle drags out of this target
  onDragOut: PropTypes.func,

  // Event called when the handle is dropped on this target
  onDragRelease: PropTypes.func.isRequired,
};

DropTarget.defaultProps = {
  zIndex: 0,
};

export default DropTarget;
