import BpmnModeler from 'bpmn-js/lib/Modeler';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from "file-saver";
import './Test.css';
import { compareBpmnDiagrams } from '../../utils/bpmnChecker';


export default function App() {
    const [diagram, setDiagram] = useState("");
    const [diagram2, setDiagram2] = useState("");
    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    const feedbackRef = useRef("");
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target.result;
            setDiagram(xmlContent);
        };

        reader.readAsText(file);
    };

    const handleFileChange2 = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target.result;
            setDiagram2(xmlContent);
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

    const checkIfSame = async (diagram1, diagram2) => {
        feedbackRef.current.textContent = compareBpmnDiagrams(diagram1, diagram2);
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
        <div className="App">
            <div>
                <div className="description">
                    Bitte wählen Sie zwei Diagramme im XML-Format aus und öffnen Sie diese über die zwei Button hier drunter. Falls Sie keine 
                    fertigen Diagramme als XML besitzen, können Sie im Editor eins erstellen und abspeichern. Nachdem Sie zwei Diagramme ausgewählt haben,
                    drücken Sie den "Compare"-Button um die beiden Diagramme zu vergleichen.
                </div>
                <div>
                    <div>
                        <input type="file" accept=".xml" onChange={handleFileChange} />
                        <input type="file" accept=".xml" onChange={handleFileChange2} />
                        <button onClick={() => handleSave("xml")}>Save as XML</button>
                        <button onClick={() => handleSave("svg")}>Save as SVG</button>
                    </div>
                    <div className="editor" ref={containerRef}
                    ></div>
                    <div>
                        <button onClick={() => checkIfSame(diagram, diagram2)}>Compare</button>
                    </div>
                </div>
            </div>
           
            <div className="feedback" ref={feedbackRef}>
                
            </div>
        </div>
    );
}