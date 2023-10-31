import styles from './beschriftungen.module.css';

const Beschriftungen = ({ParsedSolution}) => {

    return (
      <>
        <div className={styles.container}>
          <p className={styles.header}>BPMN Elemente</p>
          <div className={styles.feedbackElements}>
            {ParsedSolution.processes.bpmnElementsArray.map((item, index) => (
              item.getAttribute('name') && <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.getAttribute('name')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.container}>
          <p className={styles.header}>Lanes</p>
          <div className={styles.feedbackElements}>
            {ParsedSolution.processes.laneSets.map((item, index) => (
              item.getAttribute('name') && <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.getAttribute('name')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.container}>
          <p className={styles.header}>Akteure</p>
          <div className={styles.feedbackElements}>
            {ParsedSolution.collaborations.participants.map((item, index) => (
              item.getAttribute('name') && <div key={index} style={{border: '1px solid black', textAlign: 'center', margin: '5px auto', borderRadius: '20px', fontSize: '14px', padding: '5px'}}>
                <p style={{margin: '0'}}>{item.getAttribute('name')}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  export default Beschriftungen;