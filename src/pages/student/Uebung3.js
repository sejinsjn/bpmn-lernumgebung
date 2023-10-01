import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import './Uebung3.css';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import ReactMarkdown from 'react-markdown';
import interact from 'interactjs';
import Feedback from '../../components/feedback';

var selectedElements = [];
var xmlDiagram = "";

const ResizableDivs = (randomNumber) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    const [diagram, setDiagram] = useState("");
    const [task, setTask] = useState("");
    const [vulnerabilities, setVulnerabilities] = useState("");
    const [explanations, setExplanations] = useState("");
    const [tips, setTips] = useState("");

    const [data, setData] = useState(null);
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target.result;
            setDiagram(xmlContent);
            xmlDiagram = xmlContent;
        };

        reader.readAsText(file);
    };

    const checkSelectedElements = (ids) => {
        const sortedArray1 = [...vulnerabilities].sort();
        const sortedArray2 = [...selectedElements].sort();

        const areEqual = sortedArray1.length === sortedArray2.length && sortedArray1.every((value, index) => value === sortedArray2[index]);
        if(areEqual){
            console.log(true);
        }else{
            console.log(false);
        }
    };

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

   

      useEffect(() => {
        if (!viewerRef.current && containerRef.current) {
            viewerRef.current = new NavigatedViewer({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            fetch('/json/uebung3.json')
                .then(response => response.json())
                .then(jsonData => {
                    // jsonData is the parsed JSON object received from the URL
                    const rNumber = randomNumber.randomNumber;
                    const diagramURL = jsonData[rNumber].diagram;

                    setTask(jsonData[rNumber].task);
                    setExplanations(jsonData[rNumber].explanations);
                    setVulnerabilities(jsonData[rNumber].vulnerabilities);
                    setTips(jsonData[rNumber].tips);
                    setData(jsonData);
                    
                    fetch(diagramURL)
                    .then(response => response.text())
                    .then(data => {
                        setDiagram(data);
                    })
                    .catch(error => {
                        console.error(error);
                    });
                })
                .catch(error => {
                    console.error(error);
                });

            var eventBus = viewerRef.current.get('eventBus');
            eventBus.on('element.click', function(event) {
                var element = event.element;
                var id = element.id;
                var name = element.businessObject.name;
                var type = element.businessObject.$type;
                
                var canvas = viewerRef.current.get('canvas');
                var hasMarker = canvas.hasMarker(id, "highlight");

                if(hasMarker){
                    canvas.removeMarker(id, "highlight");
                    var index = selectedElements.indexOf(id);
                    if (id !== -1) {
                        selectedElements.splice(index, 1);
                    }
                }else{
                    if (type !== 'bpmn:Process' && type !== 'bpmn:StartEvent' && type !== 'bpmn:EndEvent'  && type !== 'bpmn:Collaboration') {
                        console.log(type);
                        canvas.addMarker(id, 'highlight');
                        selectedElements.push(id);
                    }
                }
                //output for the console
                console.log("Clicked " + id + " with the name: " + name);
            });
        }

        if (viewerRef.current && diagram) {
            viewerRef.current.importXML(diagram)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.log("Warnings", warnings);
                    }
                })
                .catch((err) => {
                    console.log("Error", err);
                });
        }
    }, [diagram, data]);

    

    return (
        <div id="container">
            <div id="leftDiv">
                <div id="editorContainer">
                    <div className="editor" ref={containerRef}></div>
                </div>
                <div className='buttonContainerLeft'>
                <button className='buttonContainerLeftButton' onClick={() => {checkSelectedElements(selectedElements); setActiveRightDiv('result')}}>Testen</button>
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
                <div id={`result`} className={activeRightDiv === 'result' ? 'active' : ''} >
                    <Feedback Header='Schwachstellen' Description='You got this many right!'/>
                </div>
            </div>
        </div>
    );
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