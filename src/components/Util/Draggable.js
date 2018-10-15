import React from 'react';
import Hammer from '../Util/Hammer.js';

export default class Draggable extends React.Component {
  constructor(props){
    super(props)
  }

  onTap = (event) => {
    console.log('Tapped', event)
  }

  render(){
    return <Hammer onTap={this.onTap}>{this.props.children}</Hammer>
  }
}