import React from 'react';
import ReactDOM from "react-dom";
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js'
import throttle from 'lodash/throttle';

export default class Node extends React.Component {
  static displayName = 'Node'
  static defaultProps = {
    position: {x: 0, y:0},
    icon: 'cog'
  };
  
  dragging = false
  dragged=false
  
  componentDidMount(){
    
    this.domNode = ReactDOM.findDOMNode(this);

    this.domNode.addEventListener('touchstart', this.onDragStart)
    this.domNode.addEventListener('mousedown', this.onDragStart)
    
    this.domNode.addEventListener('touchmove', this.onDrag)
    this.domNode.addEventListener('mousemove', this.onDrag)
    
    this.domNode.addEventListener('touchcancel', this.onCaonDragEndncel)
    this.domNode.addEventListener('touchend', this.onDragEnd)
    this.domNode.addEventListener('mouseup', this.onDragEnd)
    
    this.domNode.addEventListener('click', this.onClick)
  }

  onClick = (e) => {
    // console.log(`Node ${this.props.node.id}`, e.type)
    e.stopPropagation();
    // e.preventDefault();
    const node = {...this.props.node}
    

    this.props.selectNode(node)
  }

  onDragStart = (e) => {
    // console.log(`DragStart`, e.type);
    // e.preventDefault();
    e.stopPropagation();
    this.mouseDown = true;
  }

  onDrag = throttle((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.mouseDown) return;
    const obj = e.targetTouches ? e.targetTouches[0] : e
    if (!this.dragPrev) this.dragPrev = {x: obj.pageX, y: obj.pageY}
    const delta = {
      x: obj.pageX - this.dragPrev.x,
      y: obj.pageY - this.dragPrev.y
    }
    if (delta.x === 0 && delta.y === 0) return;
    this.dragging = true;
    // console.log('Drag', delta, e.type)
    this.dragPrev = {x: obj.pageX, y: obj.pageY}
    
    const node = {...this.props.node}
    node.position = {x: node.position.x + delta.x, y: node.position.y + delta.y}

    this.props.updateNode(node)
  },1000/60)

  snapToGrid = () => {
    const grid = 25;
    
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

  onDragEnd = (e) => {
    // console.log(`touchEnd?`);
    this.mouseDown = false;
    e.stopPropagation();
    e.preventDefault(); 
    e.stopImmediatePropagation();
    
    if (this.dragging){
      // console.log('DragEnd', e.type)
      this.dragging = false;
      this.dragPrev = null;

      this.snapToGrid()

      this.domNode.removeEventListener('click', this.onClick)
      setTimeout(()=>this.domNode.addEventListener('click', this.onClick) ,10)
    }
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
    let nodeClass = styles.Node;
    if (this.props.node.selected) nodeClass = styles.NodeSelected

    return (
        <g id="Node" transform={this.getTransform()}>
          <polygon className={nodeClass} points="50 0 100 28.5 100 85.5 50 114 3.55271368e-14 85.5 3.55271368e-15 28.5"></polygon>
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
