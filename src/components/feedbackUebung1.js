import React, { useState } from 'react';
import styles from './feedback.module.css';
import ReactMarkdown from 'react-markdown';

const Feedback = ({Header = "", Description = "", Elements = []}) => {
  const [showContent, setShowContent] = useState(true);

  if(Elements.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.toggle} onClick={() => setShowContent(!showContent)}>
          <span>{Header}</span> 
          <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
        </div>
        <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
          <div className={styles.feedbackElements}>
            Keine gefunden!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toggle} onClick={() => setShowContent(!showContent)}>
        <span>{Header}</span> 
        <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
      </div>
      <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
        <ReactMarkdown>{Description}</ReactMarkdown>
        <div className={styles.feedbackElements}>
          {Elements.map((item, index) => (
            <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px'}}>
              <p style={{margin: '0'}}>{item.nodeName.replace("bpmn:", "")}</p>
              <p style={{margin: '0'}}>{item.getAttribute('name')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
