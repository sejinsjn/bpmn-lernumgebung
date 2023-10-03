import React, { useState } from 'react';
import styles from './feedback.module.css';
import ReactMarkdown from 'react-markdown';

const Feedback = ({Header = "", Description = ""}) => {
  const [showContent, setShowContent] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.toggle} onClick={() => setShowContent(!showContent)}>
        <span>{Header}</span> 
        <i className={`${styles.arrow} ${showContent ? styles.up : styles.down}`}></i>
      </div>
      <div className={`${styles.content} ${showContent ? styles.open : ''}`}>
        <ReactMarkdown>{Description}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Feedback;