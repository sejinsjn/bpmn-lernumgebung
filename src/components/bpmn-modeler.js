import React, { useEffect, useState, useRef } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";

function BpmnEditor() {
    const [diagram, setDiagram] = useState("");
    const containerRef = useRef(null);
    const modelerRef = useRef(null);

    useEffect(() => {
        if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new Modeler({
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

    const handleSave = async () => {
        try {
            const { xml } = await modelerRef.current.saveXML({ format: true });
            console.log(xml);
            // Save the xml to your server here
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="App">
            <button onClick={handleSave}>Save</button>
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
