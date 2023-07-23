import BpmnModeler from 'bpmn-js/lib/Modeler';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from "file-saver";
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const newDiagram = '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"><bpmn:startEvent id="StartEvent_1"/></bpmn:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"><bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds x="173" y="102" width="36" height="36"/></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>';
var createNewDiagram = false;

export function BpmnEditor(loadedDiagram = newDiagram) {
    const [diagram, setDiagram] = useState("");  
    const [result, setResult] = useState(null);
    const containerRef = useRef(null);
    const modelerRef = useRef(null);

    if(diagram.length === 0){
        createNewDiagram = true;
    }
    
    const handleParse = () => {
        if (XMLValidator.validate(diagram) === true) {
          const parser = new XMLParser();
          let result = parser.parse(diagram, { ignoreAttributes: false, ignoreNameSpace: false });
          setResult(result['bpmn:definitions']['bpmn:process']);
        } else {
          // handle invalid XML
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
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new BpmnModeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            if(createNewDiagram) setDiagram(newDiagram);

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
            <div>
                <textarea value={diagram} onChange={e => setDiagram(e.target.value)} width="1000px"/>
                <button onClick={handleParse}>Parse</button>
                <pre>{JSON.stringify(result, null, 2)}</pre>
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