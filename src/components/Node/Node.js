import React from 'react';
import styles from './Node.module.css';
import Icon from '../Icon/Icon.js'

export default class Node extends React.Component {
  static displayName = 'Node'
  static defaultProps = {
    location: {x: 0, y:0},
    icon: 'cog'
  };
  render() {
    return (
      <g id="Node" transform={`translate(${this.props.location.x - 50},${this.props.location.y - 57})`}>

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
    );
  }
}
