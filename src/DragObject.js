'use strict';
import React, { Component, PropTypes } from 'react';
import { View, StyleSheet } from 'react-native';

class DragObject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      element: null,
      x: null,
      y: null,
    };
  }

  update(x, y, element) {
    if (this.state.element !== element) {
      this.setState({
        element, x, y,
      });
    } else if (this.state.element !== null) {
      this.state.x = x;
      this.state.y = y;
      this.refs.view.setNativeProps({
        style: {
          left: x,
          top: y,
        },
      });
    }
  }

  render() {
    const { element, x, y } = this.state;
    if (element === null) {
      return null;
    }

    return (
      <View ref="view" style={{
        position: 'absolute',
        left: x,
        top: y,
      }}>
        {element}
      </View>
    );
  }
}

export default DragObject;
