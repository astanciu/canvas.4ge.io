import React from 'react';
import ReactDOM from "react-dom";
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex'
import Grid from '../Grid/Grid.js';
import Node from '../Node/Node.js';
import Hammer from '../Util/Hammer.js';
import styles from './Canvas.module.css';

class Canvas extends React.Component {
  state = {
    nodes: [
      {id: '1', icon: 'eye', position: {x: 0, y:0}},
      {id: '2', icon: 'user', position: {x: 200, y:0}}
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

  setCanvasSize = debounce(() => {
    const view = { ...this.state.view };
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    this.setState({ view });
  }, 50);

  onPinch = event => {
    let size = event.distance;
    if (event.additionalEvent === 'pinchout') size *= -1.55;
    if (event.additionalEvent === 'pinchin') size *= 0.7;
    let location = {
      x: event.center.x,
      y: event.center.y
    };

    this.zoomCanvas(size, location);
  };

  onWheel = event => {
    let size = event.deltaY ? event.deltaY : 0 - event.wheelDeltaY;
    let location = {
      x: event.clientX,
      y: event.clientY
    };

    this.zoomCanvas(size, location);
  };

  zoomCanvas = (size, location) => {
    const view = { ...this.state.view };

    if (isNaN(size) || size === 0) return;

    let scale = view.scale + size / -500;
    if (scale < this.MIN_SCALE) {
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

  componentDidMount() {
    this.setCanvasSize();
    window.addEventListener('resize', this.setCanvasSize);

    const node = ReactDOM.findDOMNode(this);
    node.addEventListener('touchstart', this.onPanStart)
    node.addEventListener('mousedown', this.onPanStart)
    
    node.addEventListener('touchmove', this.onPan)
    node.addEventListener('mousemove', this.onPan)
    
    node.addEventListener('touchend', this.onPanEnd)
    node.addEventListener('mouseup', this.onPanEnd)

  }

  foo = e => {
    console.log(`${e.type}`)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  getTransform = () => {
    const view = this.state.view;
    return `matrix(${view.scale},0,0,${view.scale},${view.x},${view.y})`;
  };

  onPanStart = event => {
    this.friction = 1.0;
    this.panPrev = {x: event.pageX, y: event.pageY};
    this.panning = true;
  };

  onPan = event => {
    if (!this.panning) return;

    const delta = {
      x: event.pageX - this.panPrev.x,
      y: event.pageY - this.panPrev.y
    }
   
    const view = { ...this.state.view };
    view.x += delta.x
    view.y += delta.y
    this.panPrev2 = this.panPrev
    this.panPrev = {x: event.pageX, y: event.pageY};
    this.setState({ view });
  };

  onPanEnd = event => {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (!this.panning) return;
    
    this.panning = false;
    if (!this.panPrev2) this.panPrev2 = this.panPrev || {x: event.pageX, y: event.pageY}
    this.velocity = {
      x: (event.pageX - this.panPrev2.x) * 1,
      y: (event.pageY - this.panPrev2.y) * 1
    };
    this.panPrev = this.panPrev2 = null;
    this.friction = 1.0;
    this.animationFrame = requestAnimationFrame(this.glideCanvas.bind(this));
  };

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

  render() {
      //
      const nodes = this.state.nodes
      .map(node => <Node 
          key={node.id} 
          node={node}
          updateNode={this.updateNode}
        />)
    return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={this.state.view.width}
          height={this.state.view.height}
          onWheel={this.onWheel}
          className={styles.Canvas}
        >
          <g id="Canvas" transform={this.getTransform()}>
            <Grid view={this.state.view} type="dot" />
            {nodes}
          </g>
        </svg>
      
    );
  }
}

export default Canvas;
