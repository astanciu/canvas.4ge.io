import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js';
import EventManager from '../Util/EventManager.js';
import { physics, spring } from 'popmotion';

export default class Node extends React.Component {
  static displayName = 'Node';
  static defaultProps = {
    position: { x: 0, y: 0 },
    icon: 'cog',
    gridSize: 50,
    snapToGrid: true
  };
  
  dragging = false;
  dragged = false;

  componentDidMount() {
    this.domNode = ReactDOM.findDOMNode(this);
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
    const grid = this.props.gridSize;

    const node = { ...this.props.node };
    const hgrid = 100 * .5;
    const vgrid = 114 * .75
    const target = {
      x: Math.round(node.position.x / hgrid) * hgrid,
      y: Math.round(node.position.y / vgrid) * vgrid
    };

    node.position = target
    this.props.updateNode(node)
  };

  getTransform = () => {
    const loc = {
      x: this.props.node.position.x - 50,
      y: this.props.node.position.y - 57
    };

    return `translate(${loc.x},${loc.y})`;
  };

  render() {
    let nodeClass = styles.Node;
    let nodeIconClass = styles.NodeIcon
    if (this.props.unselected) {
      nodeClass = styles.NodeUnselected;
      nodeIconClass = styles.NodeIconUnSelected
    }
    if (this.props.node.selected) {
      nodeClass = styles.NodeSelected;
      nodeIconClass = styles.NodeIcon
    }

    return (
      <g id="Node" transform={this.getTransform()}>
        <defs />
        {this.props.node.selected ? null : null}
        <polygon
          id={this.props.node.id}
          className={nodeClass}
          points="50 0 100 28.5 100 85.5 50 114 3.55271368e-14 85.5 3.55271368e-15 28.5"
        />
        <g transform={`translate(${50},${57})`}>
          <Icon icon={this.props.node.icon} className={nodeIconClass} />
          {this.props.debug ? (
            <React.Fragment>
              <line
                x1="0"
                y1="-600"
                x2="0"
                y2="600"
                strokeWidth="1"
                stroke="red"
              />
              <line
                x1="-600"
                y1="00"
                x2="600"
                y2="0"
                strokeWidth="1"
                stroke="red"
              />
              <circle
                cx="0"
                cy="0"
                r="2"
                stroke="green"
                strokeWidth="0"
                fill="green"
              />
            </React.Fragment>
          ) : null}
        </g>
      </g>
    );
  }
}
