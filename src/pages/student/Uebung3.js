import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import './Uebung3.css';

var selectedElements = [];
var xmlDiagram = "";

export default function Uebung3() {
    const [diagram, setDiagram] = useState("");
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

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
        const sortedArray1 = [...data['1'].vulnerabilities].sort();
        const sortedArray2 = [...selectedElements].sort();

        console.log(sortedArray1);console.log(sortedArray2);

        const areEqual = sortedArray1.length === sortedArray2.length && sortedArray1.every((value, index) => value === sortedArray2[index]);
        if(areEqual){
            console.log(true);
        }else{
            console.log(false);
        }
    };

    useEffect(() => {
        if (!viewerRef.current && containerRef.current) {
            viewerRef.current = new NavigatedViewer({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            fetch('/json/uebung3.json')
                .then(res => res.json())
                .then(data => {
                    setDiagram(data["1"].xmlDiagram);
                    setData(data);
                    console.log(data);
                })
                .catch(error => {
                    // handle any errors here
                    console.error("e" + error);
                });

            if(data != null){
                setDiagram(data['1'].xmlDiagram);
            }

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
                    if (type !== 'bpmn:Process' && type !== 'bpmn:StartEvent' && type !== 'bpmn:EndEvent') {
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
        <div className="Uebung3">
            <div>
                <input type="file" accept=".xml" onChange={handleFileChange} />
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
            <div>
                <button onClick={() => checkSelectedElements(selectedElements)}>Check</button>
            </div>
        </div>
    );
}