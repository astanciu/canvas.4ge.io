import React from 'react';
import ReactDOM from "react-dom";
import Draggable from 'react-draggable';
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js'

export default class Node extends React.Component {
  static displayName = 'Node'
  static defaultProps = {
    position: {x: 0, y:0},
    icon: 'cog'
  };
  componentDidMount(){
    const node = ReactDOM.findDOMNode(this);

    node.addEventListener('pointermove', this.eventTrap)
    node.addEventListener('pointerup', this.eventTrap)
    node.addEventListener('pointerdown', this.eventTrap)
    node.addEventListener('touchmove', this.eventTrap)
    node.addEventListener('mouseup', this.eventTrap)
    
    
    // need this node.addEventListener('mousedown', this.eventTrap)

    node.addEventListener('click', this.eventTrap)
    node.addEventListener('mousemove', this.eventTrap)
  }

  onDrag = (e) => {
   e.stopPropagation();
  }
  onStart = (e) => {
    console.log('onstart') 
    this.startPosition = {x: e.nativeEvent.pageX, y: e.nativeEvent.pageY}
  }
  
  onStop = (e) => {
    console.log('onstop') 
    const delta = {x: e.pageX - this.startPosition.x, y: e.pageY - this.startPosition.y}
    const node = {...this.props.node}
    
    node.position = {x: node.position.x + delta.x, y: node.position.y + delta.y}
    this.props.updateNode(node)
    // e.stopPropagation();
  }

  eventTrap = (e) => {
    // console.log(`TRAPPED - ${e.type}`  )
    e.stopPropagation();
    // e.preventDefault();
  }


  getPosition = ()=>{
    return {
      x: this.props.node.position.x - 50,
      y: this.props.node.position.y - 57
    }
  }

  render() {
   
    return (
      <Draggable cancel="#Canvas" position={this.getPosition()} onDrag={this.onDrag} onStart={this.onStart} onStop={this.onStop}>
        <g ref={(node)=>this.node = node} id="Node" >
          <polygon className={styles.Node} points="50 0 100 28.5 100 85.5 50 114 3.55271368e-14 85.5 3.55271368e-15 28.5"></polygon>
          <g transform={`translate(${50},${57})`}>
            <Icon icon={this.props.icon}  />
            {this.props.debug ? 
              <React.Fragment>
              <line x1="0" y1="-600" x2="0" y2="600" strokeWidth="1" stroke="red"/> 
              <line x1="-600" y1="00" x2="600" y2="0" strokeWidth="1" stroke="red"/> 
              <circle cx="0" cy="0" r="2" stroke="green" strokeWidth="0" fill="green" />
              </React.Fragment>
            : null}
          </g>
        </g>
     </Draggable>
    );
  }
}
