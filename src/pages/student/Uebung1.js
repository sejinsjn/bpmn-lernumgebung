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
import { parseBpmnDiagram } from '../../utils/bpmnParser';
import { compareBpmnDiagrams2 } from '../../utils/bpmnDiagramChecker';
import Feedback from '../../components/feedbackUebung1';
import Beschriftungen from '../../components/beschriftungen';
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
    const [compareResult, setCompareResult] = useState("");
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
        setCompareResult(compareBpmnDiagrams2(parseBpmnDiagram(xml), parsedSolution));
        
        xml = await modelerRef.current.saveXML({ format: true });
        setDiagram(xml);
      } catch (err) {
        console.error(err);
      }
    };

    const clearDiagram = async () => {
      setDiagram(modelerRef.current.createDiagram());
    };
    
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const xmlContent = e.target.result;

        if (modelerRef.current && diagram) {
          modelerRef.current.importXML(xmlContent)
              .then(({ warnings }) => {
                  if (warnings.length) {
                      console.log("Warnings", warnings);
                  }
              })
              .catch((err) => {
                  console.log("Error", err);
              });
        }
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
      if(modelerRef.current != null){
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const modeling = modelerRef.current.get('modeling');

        console.log(compareResult);
        /*
        for(let e of compareResult.nodeNameMismatch){const element = elementRegistry.get(e.getAttribute("id"));
          modeling.setColor(element, {
            stroke: 'red'
          });

          const htmlElement = document.querySelector(`[data-element-id="${e.getAttribute("id")}"]`);
          if (htmlElement) {
            const textElement = htmlElement.querySelector('text');
            if (textElement) {
              textElement.style.fill = 'black';
            }
          }

          const htmlLabeElement = document.querySelector(`[data-element-id="${e.getAttribute("id")}_label"]`);
          if (htmlLabeElement) {
            const textElement = htmlLabeElement.querySelector('text');
            if (textElement) {
              textElement.style.fill = 'black';
            }
          }
        }*/
        /*
        for(let e of compareResult.attrMismatch){
          const htmlElement = document.querySelector(`[data-element-id="${e.getAttribute("id")}"]`);
          if (htmlElement) {
            const textElement = htmlElement.querySelector('text');
            if (textElement) {
              textElement.style.fill = 'red';
            }
          }

          const htmlLabeElement = document.querySelector(`[data-element-id="${e.getAttribute("id")}_label"]`);
          if (htmlLabeElement) {
            const textElement = htmlLabeElement.querySelector('text');
            if (textElement) {
              textElement.style.fill = 'red';
            }
          }
        }*/
        
        for(let e of compareResult.mismatches){
          const element = elementRegistry.get(e.getAttribute("id"));
          modeling.setColor(element, {
            stroke: 'red'
          });
        }

        for(let e of compareResult.matches){
          const element = elementRegistry.get(e.getAttribute("id"));
          modeling.setColor(element, {
            stroke: 'black'
          });
        }
      }
        
    }, [compareResult]);

    useEffect(() => {
      if(diagram !== ""){
         console.log(parsedDiagram.processes.bpmnElements);
      }
    }, [diagram]);

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
    }, [parsedSolution]);

    return (
      <div id="container">
        <div id="leftDiv">
            <div id="editorContainer">
                <div className="editor" ref={containerRef}></div>
            </div>
            <div className='buttonContainerLeft'>
              <button className='buttonContainerLeftButton' onClick={() => {clearDiagram();}}>Diagram löschen</button>
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
              Die folgenden Elemente und Beschriftungen müssen genutzt werden: <br/>
              {initializeBeschriftungen(parsedSolution)}
            </div>
            <div id={`result`} className={activeRightDiv === 'result' ? 'active' : ''} ref={feedbackRef}>
                {initializeFeedback(parsedDiagram, parsedSolution, compareResult)}
            </div>
        </div>
      </div>
    );
  };

function initializeFeedback(bpmnDiagram, bpmnSolution, compareResult) {
    let result = [];
    let wrongElementString = "Die folgenden Elemente sind nicht richtig dargestellt oder gehören nicht ins Diagram. Überprüfe nochmal " +
                    "auf Rechtschreibfehler und ob das ausgewählte Element stimmt.\n" + 
                    "Hinweis: Falls die Beschriftung stimmt aber das Element hier angezeigt wird, kann es sein, dass das Element an der falschen " + 
                    "Position erstellt wurde.";
    result.push(<Feedback key={1} Header='Falsche Elemente' Description={wrongElementString} Elements={compareResult.mismatches} Matches={compareResult.matches}/>);
    
    let wrongElementNameString = "Die folgenden Elemente sind nicht richtig beschriftet. Bitte kontrolliere nochmal die Beschriftungen der folgenden Element. " + 
                                "\nHinweis: Falls die Beschriftung stimmt aber das Element hier angezeigt wird, kann es sein, dass das Element an der falschen " + 
                                "Position erstellt wurde.";
    result.push(<Feedback key={2} Header='Falsche Beschriftungen' Description={wrongElementNameString} Elements={compareResult.attrMismatch} Matches={compareResult.matches}/>);
    
    let missingElementString = "Die folgenden Element fehlen im Diagram.";
    result.push(<Feedback key={3} Header='Nicht im Diagram enthaltene Diagramme' Description={missingElementString} Elements={compareResult.missingElements} Matches={compareResult.matches}/>);
    
    return result;
}
  
function initializeBeschriftungen(parsedSolution) {
  let result = [];

  if(parsedSolution.length === 0)
    return <></>;
  else
    result.push(<Beschriftungen ParsedSolution={parsedSolution}/>);

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