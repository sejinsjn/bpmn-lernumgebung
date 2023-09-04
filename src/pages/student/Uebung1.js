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
import { compareBpmnDiagrams, compareTrees } from '../../utils/bpmnChecker';
import { parseBpmnDiagram } from '../../utils/bpmnParser';
import { compareBpmnDiagrams2 } from '../../utils/bpmnDiagramChecker';
import Feedback from '../../components/feedback';
import ReactMarkdown from 'react-markdown';

const ResizableDivs = (randomNumber) => {
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
    const [task, setTask] = useState("");
    const [diagram, setDiagram] = useState("");
    const [parsedDiagram, setParsedDiagram] = useState([]);
    const [solution, setSolution] = useState("");
    const [parsedSolution, setParsedSolution] = useState([]);
    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    const feedbackRef = useRef("");

    const checkIfSame = async () => {
      try {
        let { xml } = await modelerRef.current.saveXML({ format: true });
        //feedbackRef.current.textContent = compareBpmnDiagrams(xml, solution);
        //compareBpmnDiagrams2(xml, solution);
        
        setParsedDiagram(parseBpmnDiagram(xml));
          // This code will only run after setDiagram has finished updating the state
          const wrongElements = compareBpmnDiagrams2(parseBpmnDiagram(xml), parsedSolution);
          const elementRegistry = modelerRef.current.get('elementRegistry');
          const modeling = modelerRef.current.get('modeling');
        
          for(let e of wrongElements){
            const element = elementRegistry.get(e.node.getAttribute("id"));
            modeling.setColor(element, {
              stroke: 'red'
            });
          }
          
          xml = await modelerRef.current.saveXML({ format: true });
          setDiagram(xml);
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

  const handleSave = async (format) => {
    try {
        if (format === "xml") {
            const { xml } = await modelerRef.current.saveXML({ format: true });
            const blob = new Blob([xml], { type: "application/xml" });
            saveAs(blob, "diagram.xml");
        } else if (format === "svg") {
            const { svg } = await modelerRef.current.saveSVG();
            const blob = new Blob([svg], { type: "image/svg+xml" });
            saveAs(blob, "diagram.svg");
        }
    } catch (err) {
        console.log(err);
    }
  };

    useEffect(() => {
      fetch('/json/uebung1.json')
        .then(response => response.json())
        .then(jsonData => {
          // jsonData is the parsed JSON object received from the URL
          const rNumber = randomNumber.randomNumber;
          const diagramURL = jsonData[rNumber].diagram;
          setTask(jsonData[rNumber].task);

          fetch(diagramURL)
            .then(response => response.text())
            .then(data => {
              setSolution(data);
              setParsedSolution(parseBpmnDiagram(solution));
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(error => {
          console.error(error);
        });

        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new BpmnModeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            setDiagram(modelerRef.current.createDiagram());
            setParsedDiagram(parseBpmnDiagram(diagram));
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
              <button onClick={() => handleSave("xml")}>Save as XML</button>
              <button onClick={() => handleSave("svg")}>Save as SVG</button>
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
              <ReactMarkdown>{task}</ReactMarkdown>
            </div>
            <div id={`result`} className={activeRightDiv === 'result' ? 'active' : ''} ref={feedbackRef}>
                {initializeFeedback(parsedDiagram, parsedSolution)}
            </div>
        </div>
      </div>
    );
  };

  function initializeFeedback(bpmnDiagram, bpmnSolution) {
    let result = [];
    result.push(<Feedback key={1} Header='Anzahl der Prozesse' UserDiagram={bpmnDiagram?.processes?.startEvents} Solution={bpmnSolution?.processes?.startEvents}/>);
    result.push(<Feedback key={2} Header='Anzahl der Elemente' UserDiagram={bpmnDiagram?.processes?.bpmnElements} Solution={bpmnSolution?.processes?.bpmnElements}/>);
    result.push(<Feedback key={3} Header='Anzahl der Verbindungen' UserDiagram={bpmnDiagram?.processes?.sequenceFlows} Solution={bpmnSolution?.processes?.sequenceFlows}/>);
    result.push(<Feedback key={4} Header='Anzahl der LaneSets' UserDiagram={bpmnDiagram?.processes?.laneSets} Solution={bpmnSolution?.processes?.laneSets}/>);
    result.push(<Feedback key={5} Header='Anzahl der SubProzesse' UserDiagram={bpmnDiagram?.processes?.subProcesses} Solution={bpmnSolution?.processes?.subProcesses}/>);
    result.push(<Feedback key={6} Header='Anzahl der Teilnehmer' UserDiagram={bpmnDiagram?.collaborations?.participants} Solution={bpmnSolution?.collaborations?.participants}/>);
    result.push(<Feedback key={7} Header='Anzahl der Nachrichten' UserDiagram={bpmnDiagram?.collaborations?.messageFlows} Solution={bpmnSolution?.collaborations?.messageFlows}/>);

    return result;
  }
  

export default function App() {
  const randomNumber = Math.floor(Math.random() * 2) + 1;
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
                <ResizableDivs randomNumber={randomNumber}/>
        </div>
    );
}