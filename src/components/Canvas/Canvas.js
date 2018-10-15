import React from 'react'
import debounce from 'lodash/debounce';
import Grid from '../Grid/Grid.js';

import styles from './Canvas.module.css'; 

class Canvas extends React.Component {
  state={
    view: {
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.innerWidth/2, 
      y: window.innerHeight/2, 
      scale: 1
    },
    mouseMoveStart: null, 
  }

  MIN_SCALE = 0.1
  MAX_SCALE = 4
  force = {x: 0, y: 0}
  velocity = {x: 0, y: 0}
  acc= {x: 0, y: 0}
  friction= 1

  setCanvasSize = debounce(() => {
    const view = {...this.state.view};
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    this.setState({ view })
  }, 50)

  setCanvasZoom = (e) => {
    const view = {...this.state.view};

    let delta =  e.deltaY ? e.deltaY : 0-e.wheelDeltaY;
    if (isNaN(delta) || delta === 0) return;

    let scale = view.scale + delta/-500;
    if (scale < this.MIN_SCALE) {
      scale = this.MIN_SCALE;
    }
    else if (scale > this.MAX_SCALE) {
      scale = this.MAX_SCALE;
    }
    
    const xFactor = scale / view.scale - 1; //trial & error
    const posDelta = {
      x: e.clientX - view.x,
      y: e.clientY - view.y  
    }

    view.scale = scale
    view.x += -1 * posDelta.x * xFactor
    view.y += -1 * posDelta.y * xFactor
    
    this.setState({view})
  }

  setCanvasPan = (delta, mouse) => {
    const view = {...this.state.view};
    this.velocity = delta
    view.x += delta.x
    view.y += delta.y
    this.setState({ view, mouseMoveStart: { x: mouse.screenX, y: mouse.screenY } })
  }

  loop = (x) => {
    this.friction -= 0.01
    if (this.friction < 0.01) this.friction = 0.01
    this.velocity = {
      x: this.velocity.x * this.friction,
      y: this.velocity.y * this.friction
    }
    if (this.velocity.x < 0.02 
      && this.velocity.x > -0.02
      && this.velocity.y < 0.02
      && this.velocity.y > -0.02
    ) {  
      this.friction = 1.0
      return;
    };
    
    const view = {...this.state.view};
    view.x += this.velocity.x 
    view.y += this.velocity.y 

    this.setState({view})
    requestAnimationFrame(this.loop.bind(this))

  }

  componentDidMount(){
    this.setCanvasSize();
    window.addEventListener("resize", this.setCanvasSize);
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this.setCanvasSize);
  }

  mouseDown = (e) => {
    this.setState({mouseMoveStart: { x: e.screenX, y: e.screenY }})
  }

  mouseMove = (e) => {
    if (this.state.mouseMoveStart){
      const delta = {
        x: e.screenX - this.state.mouseMoveStart.x,
        y: e.screenY - this.state.mouseMoveStart.y
      }
      this.setCanvasPan(delta, e)
    }
  }
  
  mouseUp = (e) => {
    this.setState({mouseMoveStart: null})
    requestAnimationFrame(this.loop.bind(this))
  }


  getTransform = () => {
    const view = this.state.view;

    return `matrix(${view.scale},0,0,${view.scale},${view.x},${view.y})`
  }
  render(){
    return (
      <svg xmlns="http://www.w3.org/2000/svg"
        width={this.state.view.width} height={this.state.view.height} 
        onMouseDown={this.mouseDown.bind(this)}
        onMouseMove={this.mouseMove.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
        onWheel={this.setCanvasZoom.bind(this)}
        className={styles.Canvas}
      >

        <g transform={this.getTransform()}>
          <Grid view={this.state.view} type="dot"/>
          <circle cx="0" cy="0" r="100" stroke="black" strokeWidth="3" fill="red" />
          <circle cx="-150" cy="0" r="20" stroke="black" strokeWidth="1" fill="blue" />
          <circle cx="150" cy="150" r="20" stroke="black" strokeWidth="1" fill="blue" />
         
        </g>
      </svg>
    )
  }
}

export default Canvas