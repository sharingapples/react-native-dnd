import React, { Component, PropTypes } from 'react';
import { View, PanResponder, Animated } from 'react-native';

class DragSource extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
    onLayout: PropTypes.func,
    getDragHandle: PropTypes.func.isRequired,
    onDragComplete: PropTypes.func,
    onDragCancel: PropTypes.func,
  };

  static defaultProps = {
    onLayout: undefined,
    onDragComplete: undefined,
    onDragCancel: undefined,
  };

  static contextTypes = {
    pan: PropTypes.instanceOf(Animated.ValueXY).isRequired,
    startDrag: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onDragStart,
      onPanResponderMove: Animated.event([null, {
        dx: context.pan.x,
        dy: context.pan.y,
      }]),
      onPanResponderRelease: this.onDragEnd,
      onPanResponderTerminate: this.onDragEnd,
    });

    this.dragEnder = null;
    this._node = null;
  }


  componentWillUnmount() {
    // stop any dragging
    this.onDragEnd();
  }

  // The drag has started on the element
  onDragStart = (e, gesture) => {
    // Keep the coordinates where the drag started
    const [x, y] = [
      gesture.x0,
      gesture.y0,
    ];

    Promise.resolve(this.props.getDragHandle({ x, y })).then((handle) => {
      this.dragEnder = this.context.startDrag(handle, x, y);
    });
  }

  // The drag has ended now
  onDragEnd = () => {
    const { onDragComplete, onDragCancel } = this.props;

    if (this.dragEnder) {
      const res = this.dragEnder();

      if (res.complete) {
        if (onDragComplete) {
          onDragComplete(res.params);
        }
      } else if (onDragCancel) {
        onDragCancel(res.params);
      }

      this.dragEnder = null;
    }
  }

  onLayout = () => {
    if (this.props.onLayout) {
      this._node.measure((x, y, width, height, pageX, pageY) => {
        this.props.onLayout({ x, y, width, height, pageX, pageY });
      });
    }
  }

  render() {
    return (
      <View
        ref={(node) => { this._node = node; }}
        {...this.props}
        onLayout={this.onLayout}
        {...this.panResponder.panHandlers} pointerEvents="box-only"
      >
        { this.props.children }
      </View>
    );
  }
}

export default DragSource;
