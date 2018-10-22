import React from 'react';
import ReactDOM from "react-dom";
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex'
import Grid from '../Grid/Grid.js';
import Node from '../Node/Node.js';
import styles from './Canvas.module.css';
import EventManager from '../Util/EventManager.js';

class Canvas extends React.Component {
  state = {
    nodes: [
      {id: '1', icon: 'eye', position: {x: 0, y:0}},
      {id: '2', icon: 'user', position: {x: 200, y:0}},
      {id: '3', icon: 'home', position: {x: -200, y:0}},
      {id: '4', icon: 'jedi', position: {x: 0, y:200}},
     {id: '5', icon: 'network-wired', position: {x: 0, y:-200}},
    ],
    view: {
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      scale: 1
    },
    mouseMoveStart: null
  };

  MIN_SCALE = 0.25;
  MAX_SCALE = 3;
  velocity = { x: 0, y: 0 };
  friction = 1;

  componentDidMount() {
    this.setCanvasSize();
    window.addEventListener('resize', this.setCanvasSize);
    this.domNode = ReactDOM.findDOMNode(this);

    this.em = new EventManager(this.domNode, false);
    this.em.onTap(this._onTap)
    this.em.onMove(this._onMove)
    this.em.onMoveEnd(this._onMoveEnd)
    this.em.onPinch(this._onPinch)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize = debounce(() => {
    const view = { ...this.state.view };
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    this.setState({ view });
  }, 50);

  setScale = (scale, location) => {
    const view = { ...this.state.view };

    if (scale < this.MIN_SCALE ) {
      scale = this.MIN_SCALE;
    } else if (scale > this.MAX_SCALE) {
      scale = this.MAX_SCALE;
    }
    
    const xFactor = scale / view.scale - 1; //trial & error
    const posDelta = {
      x: location.x - view.x,
      y: location.y - view.y
    };

    view.scale = scale;
    view.x += -1 * posDelta.x * xFactor;
    view.y += -1 * posDelta.y * xFactor;

    this.setState({ view });
  };

  getTransform = () => {
    const view = this.state.view;
    return `matrix(${view.scale},0,0,${view.scale},${view.x},${view.y})`;
  };

  _onWheel = event => {
    let size = event.deltaY ? event.deltaY : 0 - event.wheelDeltaY;
    const scale = this.state.view.scale + size/200
    let center = {
      x: event.clientX,
      y: event.clientY
    };

    this.setScale(scale, center)
  };

  _onTap = e => {
    this.selectNode(null)
  }

  _onPinch = (e) => {
    const center = {x: e.detail.x, y: e.detail.y}
    this.setScale(e.detail.scale, center)
  }

  _onMove = e => {
    const view = { ...this.state.view };
    view.x += e.detail.delta.x
    view.y += e.detail.delta.y
    this.setState({ view });
  }

  _onMoveEnd = e => {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.velocity = e.detail.delta;

    this.friction = .85;
    this.animationFrame = requestAnimationFrame(this.glideCanvas.bind(this));

    this.domNode.removeEventListener('click', this.onClick)
    setTimeout(()=>this.domNode.addEventListener('click', this.onClick) ,10)
  }
  
  glideCanvas = () => {
    this.friction -= 0.01;
    if (this.friction < 0.01) this.friction = 0.01;
    this.velocity = {
      x: this.velocity.x * this.friction,
      y: this.velocity.y * this.friction
    };
    if (
      this.velocity.x < 0.02 &&
      this.velocity.x > -0.02 &&
      this.velocity.y < 0.02 &&
      this.velocity.y > -0.02
    ) {
      this.friction = 1.0;
      return;
    }

    const view = { ...this.state.view };
    view.x += this.velocity.x;
    view.y += this.velocity.y;

    this.setState({ view });
    this.animationFrame = requestAnimationFrame(this.glideCanvas.bind(this));
  };

  updateNode = (node) => {
    const nodes = [...this.state.nodes]
    const index = findIndex(nodes, {id: node.id})
    if( index !== -1) {
      nodes.splice(index, 1, node);
    } else {
      nodes.push(node);
    }

    this.setState({nodes})
  }

  selectNode = (node) => {
    if (node === null || !node){
      const node = this.state.nodes.find(n => n.selected)
      if (!node) return;
      delete node.selected
      this.updateNode(node)
      return;
    }

    const currentlySelected = this.state.nodes.find(n => n.selected)
    if (currentlySelected){
      currentlySelected.selected = false
      this.updateNode(currentlySelected)
      if (currentlySelected.id === node.id) return;
    }

    node.selected = true
    this.updateNode(node)
  }

  render() {
      const somethingSelected = this.state.nodes.find(n => n.selected)
      const nodes = this.state.nodes
      .map(node => <Node 
          key={node.id} 
          node={node}
          updateNode={this.updateNode}
          selectNode={this.selectNode}
          unselected={somethingSelected}
          canvasView={this.state.view}
        />)
    return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={this.state.view.width}
          height={this.state.view.height}
          onWheel={this._onWheel}
          className={styles.Canvas}
          id='svgCanvas'
        >
          <g id="Canvas" transform={this.getTransform()}>
            <Grid id="Grid" view={this.state.view} type="dot" />
            {nodes}
          </g>
        </svg>
      
    );
  }
}

export default Canvas;
