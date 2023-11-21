import styles from './beschriftungen.module.css';
import React, { useState } from 'react';

const Beschriftungen = ({ParsedSolution}) => {
  const [showBpmnElements, setShowBpmnElements] = useState(true);
  const [showLanes, setShowLanes] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);

  ParsedSolution.processes.bpmnElementsArray.sort((a, b) => a.hasAttribute('name') && b.hasAttribute('name') && a.getAttribute('name').localeCompare(b.getAttribute('name')));
  
  return (
    <>
      <div className={styles.container}>
        <div className={styles.toggle} onClick={() => setShowBpmnElements(!showBpmnElements)}>
          <span>BPMN Elemente</span> 
          <i className={`${styles.arrow} ${showBpmnElements ? styles.up : styles.down}`}></i>
        </div>
        <div className={`${styles.content} ${showBpmnElements ? styles.open : ''}`}>
          <div className={styles.feedbackElements}>
            {ParsedSolution.processes.bpmnElementsArray.map((item, index) => (
              <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.nodeName.replace("bpmn:", "")}</p>
                <p style={{margin: '0'}}>{(item.hasAttribute('name') && item.getAttribute('name')) || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.container} style={{ display: ParsedSolution.processes.laneSets && ParsedSolution.processes.laneSets.length > 0 ? 'block' : 'none' }}>
        <div className={styles.toggle} onClick={() => setShowLanes(!showLanes)}>
          <span>Lanes</span> 
          <i className={`${styles.arrow} ${showLanes ? styles.up : styles.down}`}></i>
        </div>
        <div className={`${styles.content} ${showLanes ? styles.open : ''}`}>
          <div className={styles.feedbackElements}>
            {ParsedSolution.processes.laneSets.map((item, index) => (
              item.getAttribute('name') && <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.nodeName.replace("bpmn:", "")}</p>
                <p style={{margin: '0'}}>{(item.hasAttribute('name') && item.getAttribute('name')) || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.toggle} onClick={() => setShowParticipants(!showParticipants)}>
          <span>Akteure</span> 
          <i className={`${styles.arrow} ${showParticipants ? styles.up : styles.down}`}></i>
        </div>
        <div className={`${styles.content} ${showParticipants ? styles.open : ''}`}>
          <div className={styles.feedbackElements}>
            {ParsedSolution.collaborations.participants.map((item, index) => (
              <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.nodeName.replace("bpmn:", "")}</p>
                <p style={{margin: '0'}}>{(item.hasAttribute('name') && item.getAttribute('name')) || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
  
export default Beschriftungen;