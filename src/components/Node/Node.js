import React from 'react';
import ReactDOM from "react-dom";
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js'
import EventManager from '../Util/EventManager.js';
import { physics, decay, tween, easing } from 'popmotion';

export default class Node extends React.Component {
  static displayName = 'Node'
  static defaultProps = {
    position: {x: 0, y:0},
    icon: 'cog',
    gridSize: 25,
    snapToGrid: false
  };
  
  dragging = false
  dragged=false
  
  componentDidMount(){
    this.domNode = ReactDOM.findDOMNode(this);
    this.em = new EventManager(this.domNode, false);
    this.em.onTap(this._onTap)
    this.em.onMove(this._onMove)
    if (this.props.snapToGrid) this.em.onMoveEnd(this._onMoveEnd)
  }

  _onTap = (e) => {
    e.stopPropagation()
    const node = {...this.props.node}
    this.props.selectNode(node)
  }
  
  _onMove = (e) => {
    e.stopPropagation()
    const node = {...this.props.node}
    node.position = {x: node.position.x + e.detail.delta.x, y: node.position.y + e.detail.delta.y}
    this.props.updateNode(node)
  }
  
  _onMoveEnd = e => {
    this.snapToGrid()
  }
 
  snapToGrid = () => {
    const grid = this.props.gridSize;
    
    const node = {...this.props.node}

    const target =  {
      x: Math.round(node.position.x / grid) * grid,
      y: Math.round(node.position.y / grid) * grid
    }
    
    const delta = {
      x: target.x - node.position.x,
      y: target.y - node.position.y,
    }

    if (delta.x === 0 && delta.y === 0) return;
    
    node.position = {
      x: node.position.x + delta.x * 0.5,
      y: node.position.y + delta.y * 0.5
    }
    
    if (Math.abs(delta.x) < 0.05) node.position.x = target.x
    if (Math.abs(delta.y) < 0.05) node.position.y = target.y

    this.props.updateNode(node)
    requestAnimationFrame(this.snapToGrid)
  }

  getTransform = ()=>{
    const loc = {
      x: this.props.node.position.x - 50,
      y: this.props.node.position.y - 57
    }

    return `translate(${loc.x},${loc.y})`
  }

  render() {
    let nodeClassName = styles.Node;
    if (this.props.unselected) nodeClassName=styles.NodeUnselected;
    if (this.props.node.selected) nodeClassName = styles.NodeSelected

    return (
        <g id="Node" transform={this.getTransform()}>
          <defs>

          </defs>
            {this.props.node.selected ? 
              null
            : null }
          <polygon id={this.props.node.id} className={nodeClassName} points="50 0 100 28.5 100 85.5 50 114 3.55271368e-14 85.5 3.55271368e-15 28.5"></polygon>
          <g transform={`translate(${50},${57})`}>
            <Icon icon={this.props.node.icon} className={styles.NodeIcon} />
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
