import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js';
import EventManager from '../Util/EventManager.js';

export default class Node extends React.Component {
  static displayName = 'Node';
  static defaultProps = {
    position: { x: 0, y: 0 },
    icon: 'cog',
    gridSize: 50,
    snapToGrid: true
  };
  
  width = 100;
  height = 100;
  
  dragging = false;
  dragged = false;

  componentDidMount() {
    this.domNode = ReactDOM.findDOMNode(this);
    this.bb = this.domNode.getBBox();
    
    this.em = new EventManager(this.domNode, false);
    this.em.onTap(this._onTap);
    this.em.onMove(this._onMove);

    if (this.props.snapToGrid) this.em.onMoveEnd(this._onMoveEnd);
  }

  _onTap = e => {
    e.stopPropagation();
    const node = { ...this.props.node };
    this.props.selectNode(node);
  };

  _onMove = e => {
    e.stopPropagation();
    if (this.snap) this.snap.stop();
    const node = { ...this.props.node };
    const scaleFactor =
      (this.props.canvasView && this.props.canvasView.scale) || 1;
    node.position = {
      x: node.position.x + (e.detail.delta.x * 1) / scaleFactor,
      y: node.position.y + (e.detail.delta.y * 1) / scaleFactor
    };
    this.props.updateNode(node);
  };

  _onMoveEnd = e => {
    this.snapToGrid();
  };

  snapToGrid = () => {
    const node = { ...this.props.node };
    const hgrid = 130 * .5;
    const vgrid = 140 * .75
    const target = {
      x: Math.round(node.position.x / hgrid) * hgrid,
      y: Math.round(node.position.y / vgrid) * vgrid
    };

    node.position = target
    this.props.updateNode(node)
  };

  getTransform = () => {
    const loc = {
      x: this.props.node.position.x ,
      y: this.props.node.position.y ,
    };
    return `translate(${loc.x},${loc.y})`;
    
  };


  render() {
    let nodeClass = styles.normal;
    let nodeOutline = styles.normalOutline
    let nodeIconClass = styles.normalIcon
    if (this.props.unselected) {
      nodeClass = styles.unselected;
      nodeOutline = styles.unselectedOutline
      nodeIconClass = styles.unselectedIcon
    }
    if (this.props.node.selected) {
      nodeClass = styles.selected;
      nodeOutline = styles.selectedOutline
      nodeIconClass = styles.selectedIcon
    }

    return (
      <g id="Node" transform={this.getTransform()}>
        <g id="Hexagons" transform="translate(-50.000000, -55.000000)">
            <polygon className={nodeClass} points="50 5 93.3012702 30 93.3012702 80 50 105 6.69872981 80 6.69872981 30"></polygon>
            <polygon className={nodeOutline} strokeWidth="2" points="50 0 97.6313972 27.5 97.6313972 82.5 50 110 2.36860279 82.5 2.36860279 27.5"></polygon>
            {this.props.node.selected ? 
              <polygon className={styles.selectedHighlight} transform="translate(-28.000000, -34.000000)"  points="77.5 0 154.143248 44.25 154.143248 132.75 77.5 177 0.856751765 132.75 0.856751765 44.25"></polygon>
            : null}
        </g>
        <g transform={`translate(${0},${0})`}>
          <Icon icon={this.props.node.icon} className={nodeIconClass} />
        </g>
      </g>
    );
  }
}
