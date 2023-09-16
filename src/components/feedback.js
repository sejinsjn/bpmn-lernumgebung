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
        <span>{Header}</span> 
        <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
      </div>
      <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
        {generateFeedbackText(Header, UserDiagram, Solution)}
      </div>
    </div>
  );
};

function variableLength(header, userDiagram, solution){
  let result = [];
  let k = 0;
  if (solution instanceof Map) {
    result.push(<span key={k++}>{header} {userDiagram.size}/{solution.size}</span>);
  } else {
    result.push(<span key={k++}>{header} {userDiagram.length}/{solution.length}</span>);
  }
  return result;
}

function generateFeedbackText(header, userDiagram, solution){
  if(header === "Prozesse"){
    if(userDiagram.length !== solution.length || userDiagram.size != solution.size){
      if (solution instanceof Map) {
        return <p>Die Anzahl der Prozesse stimmt nicht überein! ({userDiagram.size}/{solution.size})</p>;
      } else {
        return <p>Die Anzahl der Prozesse stimmt nicht überein! ({userDiagram.length}/{solution.length})</p>;
      }
    }else{
      if (solution instanceof Map) {
        return <p>Die Anzahl der Prozesse stimmen überein!({userDiagram.size}/{solution.size})</p>;
      } else {
        return <p>Die Anzahl der Prozesse stimmen überein!({userDiagram.length}/{solution.length})</p>;
      }
    }
  }
}

export default Feedback;