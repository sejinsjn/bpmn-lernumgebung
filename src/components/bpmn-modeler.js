import React, { useEffect, useState, useRef } from "react";
import modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import { saveAs } from "file-saver";

function BpmnEditor() {
    const [diagram, setDiagram] = useState("");
    const containerRef = useRef(null);
    const modelerRef = useRef(null);

    useEffect(() => {
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new modeler({
                container: containerRef.current,
                keyboard: {
                    bindTo: document,
                },
            });

            modelerRef.current
                .importXML(modelerRef.current.createDiagram())
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.log("Warnings", warnings);
                    }

                    const canvas = modelerRef.current.get("modeling");
                    canvas.setColor("CalmCustomerTask", {
                        stroke: "green",
                        fill: "yellow",
                    });
                })
                .catch((err) => {
                    console.log("error", err);
                });
        }
    }, [diagram]);

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

    return (
        <div className="App">
            <button onClick={() => handleSave("xml")}>Save as XML</button>
            <button onClick={() => handleSave("svg")}>Save as SVG</button>
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

export default BpmnEditor;
