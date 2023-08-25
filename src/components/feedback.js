import React, { useState } from 'react';
import styles from './feedback.module.css';

const Feedback = ({Header = "Prozesse", UserDiagram = [], Solution = []}) => {
  const [showContent, setShowContent] = useState(false);

  if(UserDiagram === [] && Solution === [] || UserDiagram.length === 0 && Solution.length === 0 || UserDiagram.size === 0 && Solution.size === 0){
    return (<></>);
  }
  return (
    <div className={styles.container}>
      <div className={styles.toggle} onClick={() => setShowContent(!showContent)}>
        {variableLength(Header, UserDiagram, Solution)}  
        <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
      </div>
      <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
        <p>This is the content that will be toggled.</p>
      </div>
    </div>
  );
};

function variableLength(header, userDiagram, solution){
  let result = [];
  if (solution instanceof Map) {
    result.push(<span>{header} {userDiagram.size}/{solution.size}</span>);
  } else {
    result.push(<span>{header} {userDiagram.length}/{solution.length}</span>);
  }
  return result;
}

export default Feedback;