import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import './Uebung1.css';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { parseBpmnDiagram } from '../../utils/bpmnParser';
import ReactMarkdown from 'react-markdown';
import interact from 'interactjs';
import Feedback from '../../components/feedback';
import SchwachstellenErklaerung from '../../components/schwachstellenErklaerung';

var selectedElements = [];

const Ubeung3 = () => {
    const containerRef = useRef(null); // Reference für den Container wo der Viewer ist
    const viewerRef = useRef(null);  // Reference auf den Viewer

    const [diagram, setDiagram] = useState(""); // Diagram welches im Viewer ist
    const [task, setTask] = useState(""); // Aufgabenstellung als Text
    const [vulnerabilities, setVulnerabilities] = useState(""); // Array mit IDs von Elementen
    const [explanations, setExplanations] = useState(""); // String Array mit den Erklärungen zu den Schwachstellen
    const [feedback, setFeedback] = useState(""); // Feedback text
    const [isSolutionCorrect, setIsSolutionCorrect] = useState(false); // Tracked ob die erstellte Lösung richtig ist
    const [data, setData] = useState(null); // 
    const [parsedDiagram, setParsedDiagram] = useState(null); //Beinhaltet die Objekte processes, collaborations, trees von solution
    const [jsonLoaded, setJsonLoaded] = useState(false); // Ob JSON geladen wurde
    const [taskNumber, setTaskNumber] = useState(0); // Welche Aufgabe geladen wurde
    const [activeRightDiv, setActiveRightDiv] = React.useState('task');

    const countMatchingElements = (array1, array2) => {
        let count = 0;

        for (let i = 0; i < array2.length; i++) {
            if(array1.includes(array2[i])){
                count++;
            }else{
                var canvas = viewerRef.current.get('canvas');
                canvas.removeMarker(array2[i], "highlight");
                canvas.addMarker(array2[i], 'highlightWrong');
            }
        }
        return count;
    };

    const checkSelectedElements = (ids) => {
        const sortedArray1 = [...vulnerabilities].sort();
        const sortedArray2 = [...selectedElements].sort();
    
        const count = countMatchingElements(sortedArray1, sortedArray2);
        
        if(count === sortedArray1.length){
            setFeedback("Du hast alle Schwachstellen gefunden.");
            setIsSolutionCorrect(true);
        }
        if(count < sortedArray1.length){
            setFeedback(`Du hast ${count}/${sortedArray1.length} Schwachstellen gefunden.`);
            setIsSolutionCorrect(false);
        }
        if(sortedArray2.length > sortedArray1.length){
            setFeedback(`Du hast ${count}/${sortedArray1.length} Schwachstellen gefunden. Jedoch has du zu viele Element ausgewählt.`);
            setIsSolutionCorrect(false);
        }
    };

    const handleSelectChange = (event) => {
        var index = Object.keys(data).findIndex((key) => data[key].name === event.target.value);
        index++;
        setTaskNumber(index);
        setTask(data[index]);
    };

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
                    let randomNumber;
                    if(!jsonLoaded){
                        randomNumber = Math.floor(Math.random() * Object.keys(jsonData).length) + 1;
                        setTaskNumber(randomNumber);
                        setJsonLoaded(true);
                    }else{
                        randomNumber = taskNumber;
                    }
                    const diagramURL = jsonData[randomNumber].diagram;
                    
                    setTask(jsonData[randomNumber].task);
                    setExplanations(jsonData[randomNumber].explanations);
                    setVulnerabilities(jsonData[randomNumber].vulnerabilities);
                    setData(jsonData);
                    
                    fetch(diagramURL)
                    .then(response => response.text())
                    .then(data => {
                        setParsedDiagram(parseBpmnDiagram(data));
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
                var hasMarkerWrong = canvas.hasMarker(id, "highlightWrong");

                if(hasMarker){
                    canvas.removeMarker(id, "highlight");
                    var index = selectedElements.indexOf(id);
                    if (id !== -1) {
                        selectedElements.splice(index, 1);
                    }
                }else{
                    if(hasMarkerWrong){
                        canvas.removeMarker(id, "highlightWrong");
                        index = selectedElements.indexOf(id);
                        if (id !== -1) {
                            selectedElements.splice(index, 1);
                        }
                    }else{
                        if (type !== 'bpmn:Process' && type !== 'bpmn:StartEvent' && type !== 'bpmn:EndEvent'  && type !== 'bpmn:Collaboration' && type !== 'bpmn:sequenceFlow') {
                            canvas.addMarker(id, 'highlight');
                            selectedElements.push(id);
                        }
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

    useEffect(() => {
    }, [feedback, parsedDiagram]);

    return (
        <>
            <div id="header">
                <div className='leftHeader'>
                    <Link id="backButton" to="/">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <p id="backText">Zurück zur Startseite</p>
                    </Link>
                </div>
                <div  className='middleHeader'>
                    <h2 className='headerTitle'>Schwachstellenanalyse</h2>
                </div>
                <div  className='rightHeader'>
                    <select className='taskSelect' value={task.name} onChange={handleSelectChange}>
                        {data && Object.keys(data).map((key) => (
                            <option key={key} value={data[key].name}>
                                {data[key].name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div id="container">
                <div id="leftDiv">
                    <div id="editorContainer">
                        <div className="editor" ref={containerRef}></div>
                    </div>
                    <div className='buttonContainerLeft'>
                    <button className='buttonContainerLeftButton' onClick={() => {checkSelectedElements(selectedElements); setActiveRightDiv('result')}}>Prüfen</button>
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
                        <Feedback Header='Schwachstellen' Description={feedback}/>
                        {isSolutionCorrect && <SchwachstellenErklaerung Vulnerabilities={vulnerabilities} Explanations={explanations} ParsedDiagram={parsedDiagram}/>}
                    </div>
                </div>
            </div>
        </> 
    );
}

export default function App() {
      return (
          <div className="App">
                <Ubeung3 />
          </div>
      );
  }