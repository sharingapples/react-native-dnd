import { Component, PropTypes, Children } from 'react';

class DropTarget extends Component {
  static contextTypes = {
    registerDropTarget: PropTypes.func.isRequired,
  }

  static propTypes = {

    // The ordering of the targets that provide the order in which the target
    // are checked for contains
    zIndex: PropTypes.number,

    // The DropTarget can have a single child
    children: PropTypes.element.isRequired,

    // Check if the given handle and coordiantes are valid drops for this target
    contains: PropTypes.func.isRequired,

    // Event called when the handle is dragged into this target
    onDragIn: PropTypes.func,

    // Event called when the handle is dragged over this target
    onDragOver: PropTypes.func,

    // Event called when the handle drags out of this target
    onDragOut: PropTypes.func,

    // Event called when the handle is dropped on this target
    onDrop: PropTypes.func.isRequired,
  };

  static defaultProps = {
    zIndex: 0,
    onDragIn: undefined,
    onDragOver: undefined,
    onDragOut: undefined,
  };

  componentDidMount() {
    const { zIndex } = this.props;
    // Register the component within the context
    this._unregister = this.context.registerDropTarget(this, zIndex);
  }

  componentWillUnmount() {
    this._unregister();
  }

  onDragIn(params) {
    if (this.props.onDragIn) {
      this.props.onDragIn(params);
    }
  }
  onDragOver(params) {
    if (this.props.onDragOver) {
      this.props.onDragOver(params);
    }
  }

  onDragOut(params) {
    if (this.props.onDragOut) {
      this.props.onDragOut(params);
    }
  }

  onDrop(params) {
    if (this.props.onDrop) {
      this.props.onDrop(params);
    }
  }

  contains(params) {
    return this.props.contains(params);
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default DropTarget;
