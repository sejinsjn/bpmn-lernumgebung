import styles from './schwachstellenErklaerung.module.css';
import React, { useState, useEffect, useRef } from 'react';

const Erklaerung = ({Vulnerabilities, Explanations, ParsedDiagram}) => {
    const [showSolution, setShowSolution] = useState(false);
    const [value, setValue] = useState('');

    if(Explanations === "") return <></>;

    // create a function to toggle the solution visibility
    const handleShowSolution = () => {
        setShowSolution(!showSolution);
    };

    return (
    <>
        <div className={styles.container}>
            {Explanations.map((explanation, index) => (
                <div key={index} className={styles.contentWeakness}>
                    <p className={styles.header}>Schwachstelle {index + 1}</p>
                    <p className={styles.header}>{ParsedDiagram.processes.bpmnElements.get(Vulnerabilities[index]).getAttribute("name")}</p>
                    <div className={styles.input}>
                        <span contentEditable="true"/>
                    </div>
                </div>
            ))}
            
            <button className={styles.solutionButton} onClick={handleShowSolution}>
                {showSolution ? "Lösung verstecken" : "Lösung anzeigen"}
            </button>
        </div>
        {showSolution && (
            <div>
                {Explanations.map((explanation, index) => (
                <div key={index} className={styles.container}>
                    <div key={index} className={styles.content}>
                        <p className={styles.header} style={{margin: '0'}}>Schwachstelle {index + 1}</p>
                        <p className={styles.header}>{ParsedDiagram.processes.bpmnElements.get(Vulnerabilities[index]).getAttribute("name")}</p>
                        <p className={styles.header}>{explanation}</p>
                    </div>
                </div>
                ))}
            </div>
        )}
    </>
    );
};

export default Erklaerung;
