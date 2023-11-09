import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import React, { useState, useEffect, useRef } from 'react';
import './Loesung.css';

export default function Loesung() {
  const solution = JSON.parse(sessionStorage.getItem("solution"));
  
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [diagram, setDiagram] = useState(solution);

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

    sessionStorage.clear();
}, [diagram]);




  return (
    <div id="viewerContainer">
        <div className="viewer" ref={containerRef}></div>
    </div>
  );
}
