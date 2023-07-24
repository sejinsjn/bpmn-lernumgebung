import BpmnModeler from 'bpmn-js/lib/Modeler';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from "file-saver";
import { parseAndStoreBpmnProcessElements } from '../../utils/uebung';

export default function App() {
    const [diagram, setDiagram] = useState("");
    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target.result;
            setDiagram(xmlContent);
            parseAndStoreBpmnProcessElements(xmlContent);
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
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new BpmnModeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            setDiagram(modelerRef.current.createDiagram());

            var eventBus = modelerRef.current.get('eventBus');
            eventBus.on('element.click', function(event) {
                var element = event.element;
                var modeling = modelerRef.current.get('modeling');
                modeling.setColor(element, {
                    fill: 'red',
                    stroke: 'black'
                });
                //output for the console
                var id = element.id;
                var name = element.businessObject.name;
                console.log("Clicked " + id + " with the name: " + name);
            });
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
                <input type="file" accept=".xml" onChange={handleFileChange} />
                <button onClick={() => handleSave("xml")}>Save as XML</button>
                <button onClick={() => handleSave("svg")}>Save as SVG</button>
            </div>
            <div
                ref={containerRef}
                style={{
                    border: "1px solid #000000",
                    height: "90vh",
                    width: "90vw",
                    margin: "auto",
                }}
            ></div>
        </div>
    );
}