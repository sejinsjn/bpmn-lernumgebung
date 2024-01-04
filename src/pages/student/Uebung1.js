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

const Ubeung1 = () => {
  /**
   * Palette/Toolbar im Editor in zwei Spalten anzeigen anstatt einer durch das hinzufügen der klasse 'two-column'
   */
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
  
  /**
   * Ermöglicht das Vergrößern/Verkleinern des Editors und der Aufgabenspalte
   */
  React.useEffect(() => {
    interact('#rightDiv')
      .resizable({
        edges: { left: true }
      })
      .on('resizemove', function (event) {
        var target = event.target;
        var otherTarget = document.querySelector(`#leftDiv`);
  
        // Die Breite des Ziels wird auf die Breite des Events/rechten Divs gesetzt
        target.style.width = event.rect.width + 'px';
        // Die Breite des anderen Ziels wird auf die Differenz zwischen der Breite des Elternelements und der Breite des Events/rechten Divs gesetzt
        otherTarget.style.width = (otherTarget.parentNode.offsetWidth - event.rect.width) + 'px';
      });
  }, []);
    

  //Alle nötigen useState Konstanten
  const [activeRightDiv, setActiveRightDiv] = React.useState('task'); 
  const [taskData, setTaskData] = useState(null);
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

  /**
   * Prüft die erstellte Lösung mit der Musterlösung mit der Funktion compareBpmnDiagrams2
   */
  const checkIfSame = async () => {
    try {
      let { xml } = await modelerRef.current.saveXML({ format: true }); // hole erstelltes Diagram
      setParsedDiagram(parseBpmnDiagram(xml)); // Erstelle Bäume und hole alle Elemente
      setCompareResult(compareBpmnDiagrams2(parseBpmnDiagram(xml), parsedSolution)); // Überprüfe beide Diagramme

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

  /**
   * Ersetzt das jetzige Diagramm durch ein neues leeres Diagramm
   */ 
  const clearDiagram = async () => {
    setDiagram(modelerRef.current.createDiagram());
  };
  
  /**
   * Ermöglicht das Öffnen einer XML Datei, um ein Diagramm in den Editor zu laden
   */
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
    event.target.value = null;
  };

  /**
   * Speichert das erstellte Diagram als XML oder SVG basierend auf den Parameter format
   * @param {*} format ist entweder xml oder svg
   */
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

  //Auswahl von anderen Aufgaben
  const handleSelectChange = (event) => {
    var index = Object.keys(taskData).findIndex((key) => taskData[key].name === event.target.value);
    index++;
    setTaskNumber(index);
    setTask(taskData[index]);
    setTries(0);
    setCompareResult("");
    setParsedSolution("");
  };

  /**
   * Anhand der Ergebnisse wird die Farbe der entsprechenden Elemente angepasst
   */
  useEffect(() => {
    if(modelerRef.current != null && compareResult !== ""){
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

      //Färbe alle falsch benannten Elemente rot
      for(let e of compareResult.attrMismatch){
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

  /**
   * Öffnet Popup beim fünften Versuch
   */
  useEffect(() => {
    if(tries === 5){
      setIsOpen(true);
    } 
  }, [tries]);

  /**
   * Lädt eine Aufgabe zufällig aus der uebung1.json
   */
  useEffect(() => {
    fetch('/json/uebung1.json').then(response => response.json()).then(jsonData => {
      let randomNumber;
      //Falls Aufgabe nicht geladen wurde, wird eine geladen ansonsten die gleiche Aufgabe bleibt
      if(!jsonLoaded){
        randomNumber = Math.floor(Math.random() * Object.keys(jsonData).length) + 1;
        setTaskNumber(randomNumber);
        setJsonLoaded(true);
      }else{
        randomNumber = taskNumber;
      }

      //Lädt Aufgabe aus der JSON-Datei
      const diagramURL = jsonData[randomNumber].diagram;
      setTask(jsonData[randomNumber]);
      setTaskData(jsonData);

      //Lädt das Diagramm anhand einer URL aus dem lokalen Ordner
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
        <select className='taskSelect' value={task.name} onChange={handleSelectChange}>
          {taskData && Object.keys(taskData).map((key) => (
            <option key={key} value={taskData[key].name}>
              {taskData[key].name}
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
            <input type="file" accept=".xml" onChange={handleFileChange} />
            <button className='buttonContainerLeftButton' onClick={() => handleSave("xml")}>Speichern als XML</button>
            <button className='buttonContainerLeftButton' onClick={() => handleSave("svg")}>Speichern als SVG</button>
            <Popup open={isOpen} onClose={() => setIsOpen(false)} position="right center">
              <div className='popupContent'>
                Bisher hatten Sie schon fünf Versuche. Den Weg zur Lösung finden Sie unter dem Feedback/Ergebnis
                <button className='closePopupButton' onClick={() => setIsOpen(false)}>Close</button>
              </div>
            </Popup>
            <button className='buttonContainerLeftButton' onClick={() => {clearDiagram();}}>Diagram löschen</button>
            <button className='buttonContainerLeftButton' onClick={() => {checkIfSame(); setActiveRightDiv('result')}}>Prüfen</button>
          </div>
      </div>
      <div id="rightDiv">
          <div className='buttonContainerRight'>
              <button className='divRightButton' onClick={() => setActiveRightDiv('task')} style={{ backgroundColor: activeRightDiv === 'task' ? 'lightblue' : '' }}>Aufgabe</button>
              <button className='divRightButton' onClick={() => setActiveRightDiv('result')} style={{ backgroundColor: activeRightDiv === 'result' ? 'lightblue' : '' }}>Ergebnis</button>
          </div>
          <div id={`task`} className={activeRightDiv === 'task' ? 'active' : ''}>
            <ReactMarkdown>{task.task}</ReactMarkdown><br/>
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

/**
 * Erstellt die Feedbacks anhand der Feedback-Komponente
 * @param {*} parsedDiagram Ist die vom Nutzer erstellte Lösung
 * @param {*} compareResult Das Ergebnis der Prüfung beider Lösungen
 * @param {*} solution Musterlösung
 * @param {*} tries Anzahl der Versuche
 * @returns 
 */
function initializeFeedback(parsedDiagram, compareResult, solution, tries) {
  let result = [];

  //Feedback wird erstellt wenn Überprüfung stattgefunden hat und ein Diagramm vom Nutzer erstellt wurde
  if(compareResult.mismatches !== undefined && parsedDiagram !== undefined){
    
    //Filter alle mismatches aus, die auch in matches sind
    const filteredElements = compareResult.mismatches.filter(element => !compareResult.matches.some(match => match.getAttribute("id") === element.getAttribute("id")))
    .reduce((unique, item) => unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

    //Rückmeldung für alle falschen Elemente (Element + Attribute oder gehören einfach nicht ins Diagram)
    let wrongElementString = "Die folgenden Elemente sind nicht richtig dargestellt oder gehören nicht ins Diagram. Überprüfe nochmal " +
                              "auf Rechtschreibfehler und ob das ausgewählte Element stimmt.\n" + 
                              "Hinweis: Falls die Beschriftung stimmt aber das Element hier angezeigt wird, kann es sein, dass das Element an der falschen " + 
                              "Position erstellt wurde.";
    result.push(<Feedback key={1} Header='Falsche Elemente' Description={wrongElementString} Elements={filteredElements}/>);

    //Filter alle Elemente aus, die auch in matches sind
    const filteredElementNames = compareResult.attrMismatch.filter(element => !compareResult.matches.some(match => match.getAttribute("id") === element.getAttribute("id")))
      .reduce((unique, item) => unique.find(obj => obj.getAttribute('id') === item.getAttribute('id')) ? unique : [...unique, item], []);

    //Rückmeldung für Elemente mit falschen Attributen
    let wrongElementNameString = "Die folgenden Elemente sind nicht richtig beschriftet. Bitte kontrolliere nochmal die Beschriftungen der folgenden Element. ";
    result.push(<Feedback key={2} Header='Falsche Beschriftungen' Description={wrongElementNameString} Elements={compareResult.attrMismatch}/>);

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
  
/**
 * Initialisiert die ganzen Elemente, die in der Musterlösung existieren, mit der Beschriftungen-Komponente
 * @param {*} parsedSolution Verarbeitete Musterlösung durch den Parser
 * @returns 
 */
function initializeBeschriftungen(parsedSolution) {
  let result = [];

  if(parsedSolution.length === 0)
    return <></>;
  else{
    parsedSolution.processes.bpmnElementsArray = parsedSolution.processes.bpmnElementsArray.filter(element => element.nodeName !== "bpmn:dataObject");
    result.push(<Beschriftungen ParsedSolution={parsedSolution}/>);
  }

  return result;
}

export default function App() {
    return (
        <div className="App">
                <Ubeung1 />
        </div>
    );
}