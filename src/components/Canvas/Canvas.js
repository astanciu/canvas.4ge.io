import React from 'react'
import debounce from 'lodash/debounce';
import Grid from '../Grid/Grid.js';
import Node from '../Node/Node.js'
import Hammer from '../Util/Hammer.js'
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

  MIN_SCALE = 0.25
  MAX_SCALE = 3
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

  onPinch = (event) => {
    let size =  event.distance ;
    if (event.additionalEvent === 'pinchout') size *= -1.25
    if (event.additionalEvent === 'pinchin') size *= .9
    let location = {
      x: event.center.x,
      y: event.center.y
    }

    this.zoomCanvas(size, location)
  }

  onWheel = (event) => {
    let size =  event.deltaY ? event.deltaY : 0-event.wheelDeltaY;
    let location = {
      x: event.clientX,
      y: event.clientY
    }

    this.zoomCanvas(size, location)
  }

  zoomCanvas = (delta, location) => {
    const view = {...this.state.view};

    
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
      x: location.x - view.x,
      y: location.y - view.y  
    }

    view.scale = scale
    view.x += -1 * posDelta.x * xFactor
    view.y += -1 * posDelta.y * xFactor
    
    this.setState({view})
  }

  panCanvas = (delta, mouse) => {
    const view = {...this.state.view};
    // this.velocity = delta
    view.x += delta.x
    view.y += delta.y
    this.setState({ view, mouseMoveStart: { x: mouse.screenX, y: mouse.screenY } })
  }

  glideCanvas = () => {
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
    this.animationFrame = requestAnimationFrame(this.glideCanvas.bind(this))
  }

  componentDidMount(){
    this.setCanvasSize();
    window.addEventListener("resize", this.setCanvasSize);
  }
  
  componentWillUnmount(){
    window.removeEventListener("resize", this.setCanvasSize);
  }

  getTransform = () => {
    const view = this.state.view;
    return `matrix(${view.scale},0,0,${view.scale},${view.x},${view.y})`
  }

  onPanStart = (event) => {
    this.originalView = this.state.view
  }

  onPanEnd = (event) => {
    this.originalView = null;
    this.velocity = {
      x: event.velocityX*10,
      y: event.velocityY*10
    }
    requestAnimationFrame(this.glideCanvas.bind(this));
  }

  onPan = (event) => {
    if (!this.originalView) return;
    const view = {...this.state.view};
    view.x = this.originalView.x + event.deltaX
    view.y = this.originalView.y + event.deltaY
    
    this.setState({ view })
  }

  render(){
    return (
      <Hammer 
        
        onPan={this.onPan} onPanStart={this.onPanStart} onPanEnd={this.onPanEnd}
        onPinch={this.onPinch}
        options={{
          recognizers: {
             pinch: { enable: true }
          }
       }}
        >
      <svg xmlns="http://www.w3.org/2000/svg"
        width={this.state.view.width} height={this.state.view.height} 
        // onMouseDown={this.mouseDown.bind(this)}
        // onMouseMove={this.mouseMove.bind(this)}
        // onMouseUp={this.mouseUp.bind(this)}
        onWheel={this.onWheel}
        className={styles.Canvas}
      >

        <g transform={this.getTransform()}>
          <Grid view={this.state.view} type="dot"/>
          {/* <circle cx="0" cy="0" r="100" fill="#209abe" />
          <circle cx="-150" cy="0" r="20" fill="#eee" />
          <circle cx="150" cy="150" r="20" fill="#6780a5" /> */}
          <Node />
         
        </g>
      </svg>
      </Hammer>
    )
  }
}

export default Canvas