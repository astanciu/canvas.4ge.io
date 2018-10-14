import React from 'react'
import debounce from 'lodash/debounce';
import Grid from '../Grid/Grid.js';

import styles from './Canvas.module.css'; 

class Canvas extends React.Component {
  constructor(){
    super()
    this.MIN_SCALE = 0.05
    this.MAX_SCALE = 5
    this.state={
      view: {
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0, 
        y: 0, 
        scale: 1
      },
      mouseMoveStart: null
    }
  }

  setCanvasSize = debounce(() => {
    const view = {...this.state.view};
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    this.setState({ view })
  }, 100)

  setCanvasZoom = (e) => {
    const zoomDelta = e.deltaY < 0 ? -0.1 : 0.1;
    let scale = this.state.view.scale + zoomDelta
    if (scale <= this.MIN_SCALE) scale = this.MIN_SCALE
    if (scale >= this.MAX_SCALE) scale = this.MAX_SCALE
    const view = {...this.state.view};
    view.scale = scale
    this.setState({view})
  }

  setCanvasPan = (delta, mouse) => {
    const view = {...this.state.view};
    view.x += delta.x
    view.y += delta.y
    this.setState({ view, mouseMoveStart: { x: mouse.screenX, y: mouse.screenY } })
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
  }


  getTransform = () => {
    const view = this.state.view;

    return `matrix(${view.scale},0,0,${view.scale},${view.x},${view.y})`
  }
  render(){
    return (
      <svg 
        width={this.state.view.width} height={this.state.view.height} 
        onMouseDown={this.mouseDown.bind(this)}
        onMouseMove={this.mouseMove.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
        onWheel={this.setCanvasZoom.bind(this)}
        className={styles.Canvas}
      >

        <g transform={this.getTransform()}>
          <Grid view={this.state.view} type="dot"/>
          
          {/* <rect width="100%" height="100%" fill="url(#grid)" /> */}
          <circle cx="0" cy="0" r="100" stroke="black" strokeWidth="3" fill="red" />
        </g>
      </svg>
    )
  }
}

export default Canvas