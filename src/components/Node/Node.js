import React from 'react';
import styles from './Node.module.css';

export default class Node extends React.Component {
  render() {
    return (
      <g id="Node">
        {/* <path className={styles.Node} d="M50,0.721614979 L0.625,29.2167713 L0.625,86.2066468 L50,114.701803 L99.375,86.2066468 L99.375,29.2167713 L50,0.721614979 Z"></path> */}
        <polygon className={styles.Node} points="50 0 100 28.8558545 100 86.5675636 50 115.423418 3.55271368e-14 86.5675636 3.55271368e-15 28.8558545"></polygon>
      </g>
    );
  }
}
