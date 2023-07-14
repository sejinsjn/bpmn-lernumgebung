import modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useEffect, useRef, useState } from "react";

function Viewer() {
    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    const [diagram, setDiagram] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target.result;
            setDiagram(xmlContent);
        };

        reader.readAsText(file);
    };

    useEffect(() => {
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new modeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
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

export default Viewer;
