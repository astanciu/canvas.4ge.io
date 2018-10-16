import React from 'react';
import ReactDOM from "react-dom";
import Draggable from 'react-draggable';
import Hammer from '../Util/Hammer.js';
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js'

export default class Node extends React.Component {
  static displayName = 'Node'
  static defaultProps = {
    position: {x: 0, y:0},
    icon: 'cog'
  };
  state = {
    draggin: false
  }
  componentDidMount(){
    const node = ReactDOM.findDOMNode(this);
    node.addEventListener('touchstart', this.onDragStart)
    node.addEventListener('mousedown', this.onDragStart)
    
    node.addEventListener('touchmove', this.onDrag)
    node.addEventListener('mousemove', this.onDrag)
    
    node.addEventListener('touchcancel', this.onCaonDragEndncel)
    node.addEventListener('touchend', this.onDragEnd)
    node.addEventListener('mouseup', this.onDragEnd)
  }

  onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`onDragStart`, e.type);
    this.dragging = true;
    this.dragPrev = {x: e.pageX, y: e.pageY}
  }

  onDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.dragging) return;
    const delta = {
      x: e.pageX - this.dragPrev.x,
      y: e.pageY - this.dragPrev.y
    }
    this.dragPrev = {x: e.pageX, y: e.pageY}
    
    const node = {...this.props.node}
    node.position = {x: node.position.x + delta.x, y: node.position.y + delta.y}
    console.log(`Node:${node.id} `, node.position, delta)
    this.props.updateNode(node)
  }

  onDragEnd = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    console.log('onDragEnd', e.type)
    this.dragging = false;
  }

  eventTrap = (e) => {
    e.stopPropagation();
  }

  getTransform = ()=>{
    const loc = {
      x: this.props.node.position.x - 50,
      y: this.props.node.position.y - 57
    }

    return `translate(${loc.x},${loc.y})`
  }

  render() {
    
    return (
        <g id="ssNode" transform={this.getTransform()}>
          <polygon className={styles.Node} points="50 0 100 28.5 100 85.5 50 114 3.55271368e-14 85.5 3.55271368e-15 28.5"></polygon>
          <g transform={`translate(${50},${57})`}>
            <Icon icon={this.props.node.icon}  />
            {this.props.debug ? 
              <React.Fragment>
              <line x1="0" y1="-600" x2="0" y2="600" strokeWidth="1" stroke="red"/> 
              <line x1="-600" y1="00" x2="600" y2="0" strokeWidth="1" stroke="red"/> 
              <circle cx="0" cy="0" r="2" stroke="green" strokeWidth="0" fill="green" />
              </React.Fragment>
            : null}
          </g>
        </g>
    );
  }
}
