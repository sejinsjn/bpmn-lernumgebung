import React, { useState } from 'react';
import styles from './feedback.module.css';
import ReactMarkdown from 'react-markdown';

const Feedback = ({Header = "", Description = "", Elements = [], Matches = []}) => {
  const [showContent, setShowContent] = useState(true);

console.log(Elements);

  const filteredElements = Elements.filter(element => !Matches.some(match => match.getAttribute("id") === element.getAttribute("id")))
  .reduce((unique, item) => 
    unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

  if(filteredElements.length === 0) return <></>

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
