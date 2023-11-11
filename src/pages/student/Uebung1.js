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
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css'

const ResizableDivs = () => {
  //Palette im Editor in zwei Spalten anzeigen anstatt einer
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
  
  const [activeRightDiv, setActiveRightDiv] = React.useState('task'); //

  //ermöglich das resizen der rechten und linken Spalte
  React.useEffect(() => {
    interact('#rightDiv')
      .resizable({
        edges: { left: true }
      })
      .on('resizemove', function (event) {
        var target = event.target;
        var otherTarget = document.querySelector(`#leftDiv`);
  
        target.style.width = event.rect.width + 'px';
        //Vergrößer oder verkleiner die linke Spalte wenn rechte vergrößert oder verkleinert wird
        otherTarget.style.width = (otherTarget.parentNode.offsetWidth - event.rect.width) + 'px';
      });
  }, []);
    

  //Alle nötigen useState Konstanten
  const [task, setTask] = useState(""); //Aufgabenstellung - string
  const [diagram, setDiagram] = useState(""); //XML welches in den Editor geladen wird
  const [parsedDiagram, setParsedDiagram] = useState([]); //Beinhaltet die Objekte processes, collaborations, trees von diagram
  const [solution, setSolution] = useState(""); // XML der Lösung
  const [parsedSolution, setParsedSolution] = useState([]); //Beinhaltet die Objekte processes, collaborations, trees von solution
  const [compareResult, setCompareResult] = useState(""); // Beinhaltet die Arrays Matching, NonMatching, Missing, NonMatchingAttributes, NonMatchingNodeNames
  const [tries, setTries] = useState(0); // Speichert die Anzahl der Versuche
  const [isOpen, setIsOpen] = useState(false); // Ob das popup geöffnet wird
  const [jsonLoaded, setJsonLoaded] = useState(false); // Ob Aufgabe geladen wurde
  const [taskNumber, setTaskNumber] = useState(0); // Welche Aufgabe geladen wurde
  const containerRef = useRef(null); // Reference für den Container wo der Editor drinne ist
  const modelerRef = useRef(null); // Reference für den Editor
  const feedbackRef = useRef(""); // Reference für den Feedback Div

  //started die Überprüfung des erstellten Diagrams
  const checkIfSame = async () => {
    try {
      let { xml } = await modelerRef.current.saveXML({ format: true }); //hole erstelltes Diagram
      setParsedDiagram(parseBpmnDiagram(xml)); //Erstelle Bäume und hole alle Elemente
      setCompareResult(compareBpmnDiagrams2(parseBpmnDiagram(xml), parsedSolution)); //Überprüfe beide Diagramme

      //setze das aktuelle Diagram in den Editor
      xml = await modelerRef.current.saveXML({ format: true });
      setDiagram(xml);

      //Tracking der Versuche
      let tempTries = tries + 1;
      setTries(tempTries);
    } catch (err) {
      console.error(err);
    }
  };

  //löscht das Diagram im Editor
  const clearDiagram = async () => {
    setDiagram(modelerRef.current.createDiagram());
  };
  
  //öffnen eines Diagrams im Editor basierend auf eine XML Datei
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

  //Speichert das Diagram als XML oder SVG
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

  //Verarbeite die Ergebnisse nach dem Überprüfen
  useEffect(() => {
    if(modelerRef.current != null){
      compareResult.mismatches = compareResult.mismatches.filter(element => element.nodeName !== ("bpmn:dataObject"));
      
      const elementRegistry = modelerRef.current.get('elementRegistry');
      const modeling = modelerRef.current.get('modeling');

      //Färbe alle falschen Elemente rot
      for(let e of compareResult.mismatches){
        const element = elementRegistry.get(e.getAttribute("id"));
        if(element !== undefined){
          modeling.setColor(element, {
            stroke: 'red'
          });
        }
      }

      //Färbe alle richtigen Elemente schwarz (Kann sein dass es mismatches gibt, die eigentlich keine sind)
      for(let e of compareResult.matches){
        const element = elementRegistry.get(e.getAttribute("id"));
        if(element !== undefined){
          modeling.setColor(element, {
            stroke: 'black'
          });
        }
      }
    }
      
  }, [compareResult]);

  useEffect(() => {
  }, [diagram, solution, isOpen]);
  
  //Öffne Popup nach 5 Versuchen
  useEffect(() => {
    if(tries === 5){
      setIsOpen(true);
    } 
  }, [tries]);

  //Lade eine Aufgabe beim Laden der Webseite
  useEffect(() => {
    fetch('/json/uebung1.json').then(response => response.json()).then(jsonData => {
      let randomNumber;
      if(!jsonLoaded){
        //Lade Aufgabe nach einer zufälligen Nummer
        randomNumber = Math.floor(Math.random() * Object.keys(jsonData).length) + 1;
        setTaskNumber(randomNumber);
        setJsonLoaded(true);
      }else{
        //Ansonsten lade die jetzige Aufgabe rein solange offen
        randomNumber = taskNumber;
      }

      const diagramURL = jsonData[randomNumber].diagram;
      setTask(jsonData[randomNumber].task);

      //Parse die Lösung damit diese bereit ist für den Vergleich
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

      //Erstelle einen neuen Editor falls keiner existiert
      if (!modelerRef.current && containerRef.current) {
        modelerRef.current = new BpmnModeler({
            container: containerRef.current,
            keyboard: {
                bindTo: document,
            },
        });

        //Lade ein neues Diagram falls kein Diagram offen
        setDiagram(modelerRef.current.createDiagram());
        setParsedDiagram(parseBpmnDiagram(diagram));
      }

  }, [parsedSolution]);

  return (<>
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
        <h5 className='headerTitle'>Versuche: {tries}</h5>
      </div>
    </div>
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
            <Popup open={isOpen} onClose={() => setIsOpen(false)} position="right center">
              <div className='popupContent'>
                Bisher hatten Sie schon fünf Versuche. Den Weg zur Lösung finden Sie unter dem Feedback/Ergebnis
                <button className='closePopupButton' onClick={() => setIsOpen(false)}>Close</button>
              </div>
            </Popup>
            <button className='buttonContainerLeftButton' onClick={() => {checkIfSame(); setActiveRightDiv('result')}}>Testen</button>
          </div>
      </div>
      <div id="rightDiv">
          <div className='buttonContainerRight'>
              <button className='divRightButton' onClick={() => setActiveRightDiv('task')} style={{ backgroundColor: activeRightDiv === 'task' ? 'lightblue' : '' }}>Aufgabe</button>
              <button className='divRightButton' onClick={() => setActiveRightDiv('result')} style={{ backgroundColor: activeRightDiv === 'result' ? 'lightblue' : '' }}>Ergebnis</button>
          </div>
          <div id={`task`} className={activeRightDiv === 'task' ? 'active' : ''}>
            <ReactMarkdown>{task}</ReactMarkdown><br/>
            Die Aufgabe sollte in 5 Versuchen erledigt werden.
            Die folgenden Elemente und Beschriftungen müssen genutzt werden: <br/>
            {initializeBeschriftungen(parsedSolution)}
          </div>
          <div id={`result`} className={activeRightDiv === 'result' ? 'active' : ''} ref={feedbackRef}>
              {initializeFeedback(parsedDiagram, compareResult, solution, tries)}
          </div>
      </div>
    </div>
  </>
    
  );
};

//Initialisiert die Rückmeldung
function initializeFeedback(parsedDiagram, compareResult, solution, tries) {
  let result = [];

  //Nur wenn Überprüfung stattgefunden hat
  if(compareResult.mismatches !== undefined && parsedDiagram !== undefined){
    //Finde alle Elemente die keine Verbindung haben bzw lose sind
    const elementsWithoutConnections = parsedDiagram.processes.bpmnElementsArray.filter(element => !compareResult.matches.some(match => match.getAttribute("id") === element))
    .reduce((unique, item) => unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

    //füge lose Elemente zu den mismatches
    elementsWithoutConnections.forEach(element => {
      if(!compareResult.mismatches.includes(parsedDiagram.processes.bpmnElements.get(element.getAttribute("id")))){
        compareResult.mismatches.push(parsedDiagram.processes.bpmnElements.get(element.getAttribute("id")));
      }
    });

    //filter dataObjects heraus weil diese keine visuellen Elemente darstellen
    compareResult.mismatches = compareResult.mismatches.filter(element => element.nodeName !== ("bpmn:dataObject"));

    //Filter alle mismatches aus, die auch in matches sind
    const filteredElements = compareResult.mismatches.filter(element => !compareResult.matches.some(match => match.getAttribute("id") === element.getAttribute("id")))
    .reduce((unique, item) => unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

    //Rückmeldung für alle falschen Elemente (Element + Attribute oder einfach gehören nicht ins Diagram)
    let wrongElementString = "Die folgenden Elemente sind nicht richtig dargestellt oder gehören nicht ins Diagram. Überprüfe nochmal " +
                              "auf Rechtschreibfehler und ob das ausgewählte Element stimmt.\n" + 
                              "Hinweis: Falls die Beschriftung stimmt aber das Element hier angezeigt wird, kann es sein, dass das Element an der falschen " + 
                              "Position erstellt wurde.";
    result.push(<Feedback key={1} Header='Falsche Elemente' Description={wrongElementString} Elements={filteredElements}/>);

    //Filter alle elemente aus, die auch in matches sind
    const filteredElementNames = compareResult.attrMismatch.filter(element => !compareResult.matches.some(match => match.getAttribute("id") === element.getAttribute("id")))
      .reduce((unique, item) => unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

    //Rückmeldung für Elemente mit falschen Attributen
    let wrongElementNameString = "Die folgenden Elemente sind nicht richtig beschriftet. Bitte kontrolliere nochmal die Beschriftungen der folgenden Element. ";
    result.push(<Feedback key={2} Header='Falsche Beschriftungen' Description={wrongElementNameString} Elements={filteredElementNames}/>);

    //Rückmeldung für alle Elemente, die fehlen
    let missingElementString = "Die folgenden Elemente fehlen im Diagram.";
    result.push(<Feedback key={3} Header='Nicht im Diagram enthaltene Diagramme' Description={missingElementString} Elements={compareResult.missingElements}/>);

    //Falls alle drei gefilterten Arrays leer sind wird die Lösung angezeigt oder nach 5 Versuchen
    if((filteredElements.length === 0 && filteredElementNames.length === 0 && compareResult.missingElements.length === 0) || tries >= 5){
      result.push( <div className='solutionButton'>
                      <Link onClick={(event) => {
                            sessionStorage.setItem("solution", JSON.stringify(solution)); //speichere die Lösung in die sessionstorage
                            window.open("/loesung", "_blank"); //öffne ein neues Tab damit das aktuelle nicht geschlossen wird
                          }}>
                          <button type="button" className="buttonContainerLeftButton">
                              Zur L&ouml;sung
                          </button>
                      </Link>
                    </div>);
    }
  }
  
  return result;
}
  
//Zeigt alle Elementen, die es in der Lösung gibt
function initializeBeschriftungen(parsedSolution) {
  let result = [];

  if(parsedSolution.length === 0)
    return <></>;
  else
    result.push(<Beschriftungen ParsedSolution={parsedSolution}/>);

  return result;
}

export default function App() {
    return (
        <div className="App">
                <ResizableDivs/>
        </div>
    );
}