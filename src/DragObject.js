'use strict';
import React, { Component, PropTypes } from 'react';
import { View, StyleSheet } from 'react-native';

class DragObject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      object: null,
      x: null,
      y: null,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      object: props.object,
      x: props.x,
      y: props.y,
    });
  }

  updatePosition(x, y) {
    // Might need this to update the position of the object natively
    // Directly setting the coordinates, skipping the
    // react render flow
    this.state.x = x;
    this.state.y = y;

    this.refs.drag.setNativeProps({
      style: {
        left: x,
        top: y,
      },
    });
  }

  render() {
    const { object, x, y } = this.state;

    // If there isn't any object to drag just leave
    if (object === null) {
      return null;
    }

    return (
      <View ref="drag" style={{
        position: 'absolute',
        left: x,
        top: y,
      }}>
        <object.Component {...object.props} />
      </View>
    );
  }
}

export default DragObject;
