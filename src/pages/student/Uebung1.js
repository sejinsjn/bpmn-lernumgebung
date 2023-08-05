import BpmnModeler from 'bpmn-js/lib/Modeler';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import interact from 'interactjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import './Uebung1.css';
import { compareBpmnDiagrams } from '../../utils/bpmnChecker';

const ResizableDivs = () => {
    React.useEffect(() => {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
              var div = document.querySelector('.djs-palette');
              
              if (div) {
                div.classList.add('two-column');
                observer.disconnect();
              }
            }
          });
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    
        return () => observer.disconnect();
      }, []);
    
    // Resizing the div container via dragging the border of the right div
    // so that the editor doesn't move the diagram while resizing
    const [activeRightDiv, setActiveRightDiv] = React.useState('task');

    React.useEffect(() => {
        interact('#rightDiv')
          .resizable({
            edges: { left: true }
          })
          .on('resizemove', function (event) {
            var target = event.target;
            var otherTarget = document.querySelector(`#leftDiv`);
      
            target.style.width = event.rect.width + 'px';
            otherTarget.style.width = (otherTarget.parentNode.offsetWidth - event.rect.width) + 'px';
          });
      }, []);
      

    // BPMN-Editor
    const [diagram, setDiagram] = useState("");
    const [solution, setSolution] = useState("");
    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    const feedbackRef = useRef("");

    fetch('/json/uebung1.json')
    .then(response => response.json())
    .then(jsonData => {
      // jsonData is the parsed JSON object received from the URL
      const uebung1Object = jsonData;
      const diagramURL = uebung1Object[1].diagram;

      fetch(diagramURL)
        .then(response => response.text())
        .then(data => {
          setSolution(data);
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });

    const checkIfSame = async () => {
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        setDiagram(xml);
        feedbackRef.current.textContent = compareBpmnDiagrams(xml, solution);
      } catch (err) {
        console.error(err);
      }
    };
    
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
          const xmlContent = e.target.result;
          setDiagram(xmlContent);
      };

      reader.readAsText(file);
  };

    useEffect(() => {
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new BpmnModeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            setDiagram(modelerRef.current.createDiagram());
        }

        if (modelerRef.current && diagram) {
            modelerRef.current.importXML(diagram)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.log("Warnings", warnings);
                    }
                })
                .catch((err) => {
                    console.log("Error", err);
                });
        }
    }, [diagram]);

    return (
      <div id="container">
        <div id="leftDiv">
            <div id="editorContainer">
                <div className="editor" ref={containerRef}></div>
            </div>
            <div className='buttonContainerLeft'>
            <input type="file" accept=".xml" onChange={handleFileChange} />
            <button className='buttonContainerLeftButton' onClick={() => {checkIfSame(); setActiveRightDiv('result')}}>Testen</button>
              <button className='buttonContainerLeftButton'>Lösung</button>
            </div>
        </div>
        <div id="rightDiv">
            <div className='buttonContainerRight'>
                <button className='divRightButton' onClick={() => setActiveRightDiv('task')} style={{ backgroundColor: activeRightDiv === 'task' ? 'lightblue' : '' }}>Aufgabe</button>
                <button className='divRightButton' onClick={() => setActiveRightDiv('result')} style={{ backgroundColor: activeRightDiv === 'result' ? 'lightblue' : '' }}>Ergebnis</button>
            </div>
            <div id={`task`} className={activeRightDiv === 'task' ? 'active' : ''}>
                Right Div 0
            </div>
            <div id={`result`} className={activeRightDiv === 'result' ? 'active' : ''} ref={feedbackRef}>
                Right Div 1
            </div>
            </div>
      </div>
    );
  };

export default function App() {
    //<div className="editor" ref={containerRef}></div>
    return (
        <div className="App">
                <div id="header">
                  <div className='leftHeader'>
                    <Link id="backButton" to="/">
                      <FontAwesomeIcon icon={faArrowLeft} />
                      <p id="backText">Zurück zur Startseite</p>
                    </Link>
                  </div>
                  <div  className='middleHeader'>
                    <h2 className='headerTitle'>Freies Modellieren</h2>
                  </div>
                  <div  className='rightHeader'>
                    
                  </div>
                  
                </div>
                <ResizableDivs/>
        </div>
    );
}