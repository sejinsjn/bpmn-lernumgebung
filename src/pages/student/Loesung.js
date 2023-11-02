import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import './Loesung.css';
import { useLocation } from "react-router-dom";

export default function Loesung() {
  const location = useLocation(); // Get the location object
  const solution = location.state; // Get the solution state
  
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [diagram, setDiagram] = useState(solution["solution"]);

  useEffect(() => {
    if (!viewerRef.current && containerRef.current) {
        viewerRef.current = new NavigatedViewer({
            container: containerRef.current,
            keyboard: {
                bindTo: document,
            },
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
}, [diagram]);




  return (
    <div id="viewerContainer">
        <div className="viewer" ref={containerRef}></div>
    </div>
  );
}
