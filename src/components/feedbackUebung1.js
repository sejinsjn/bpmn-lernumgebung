import React, { useState } from 'react';
import styles from './feedback.module.css';
import ReactMarkdown from 'react-markdown';

const Feedback = ({Header = "", Description = "", Elements = [], Matches = []}) => {
  const [showContent, setShowContent] = useState(true);

  const filteredElements = Elements.filter(element => !Matches.some(match => match.getAttribute("name") === element.getAttribute("name")))
  .reduce((unique, item) => 
    unique.find(obj => obj.getAttribute('name') === item.getAttribute('name')) ? unique : [...unique, item], []);

  return (
    <div className={styles.container}>
      <div className={styles.toggle} onClick={() => setShowContent(!showContent)}>
        <span>{Header}</span> 
        <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
      </div>
      <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
        <ReactMarkdown>{Description}</ReactMarkdown>
        <div className={styles.feedbackElements}>
          {filteredElements.map((item, index) => (
            <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px'}}>
              <p style={{margin: '0'}}>{item.nodeName}</p>
              <p style={{margin: '0'}}>{item.getAttribute('name')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
