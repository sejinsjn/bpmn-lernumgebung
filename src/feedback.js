function missingElements() {

}

function compareBPMNDiagrams(diagram1, diagram2) {
    // Parse XML strings into DOM objects
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(diagram1, "application/xml");
    const doc2 = parser.parseFromString(diagram2, "application/xml");

    // Get all BPMN elements from the first diagram
    const elements1 = doc1.querySelectorAll("bpmn\:element");

    // Get all BPMN elements from the second diagram
    const elements2 = doc2.querySelectorAll("bpmn\:element");

    // Compare the number of elements
    if (elements1.length !== elements2.length) {
        return "Diagrams have a different number of elements.";
    }

    // Compare each element
    for (let i = 0; i < elements1.length; i++) {
        const element1 = elements1[i];
        const element2 = elements2[i];

        // Check if the element attributes are the same
        if (element1.outerHTML !== element2.outerHTML) {
            return "Difference found at element with ID: ${ element1.getAttribute(" + i + ") }";
        }
    }

    // Diagrams are the same
    return "Diagrams are identical.";
}

function compareBpmnDiagrams2(diagram1, diagram2) {
    const elements1 = getBpmnElements(diagram1);
    const elements2 = getBpmnElements(diagram2);

    const missingElements = [];

    for (const element1 of elements1) {
        let found = false;

        for (const element2 of elements2) {
            if (areElementsEqual(element1, element2)) {
                found = true;
                break;
            }
        }

        if (!found) {
            missingElements.push(element1);
        }
    }

    return missingElements;
}

function getBpmnElements(diagram) {
    const elements = [];

    const process = diagram.getElementsByTagName("bpmn:process")[0];
    const bpmnElements = process.getElementsByTagName("*");

    for (const element of bpmnElements) {
        if (element.nodeType === 1 && element.nodeName.startsWith("bpmn:")) {
            elements.push(element);
        }
    }

    return elements;
}

function areElementsEqual(element1, element2) {
    // Compare the relevant attributes of the BPMN elements
    // Modify this function based on your specific comparison criteria

    if (element1.nodeName !== element2.nodeName) {
        return false;
    }

    const element1Attributes = element1.attributes;
    const element2Attributes = element2.attributes;

    if (element1Attributes.length !== element2Attributes.length) {
        return false;
    }

    for (let i = 0; i < element1Attributes.length; i++) {
        const attr1 = element1Attributes[i];
        const attr2 = element2Attributes[i];

        if (attr1.name !== attr2.name || attr1.value !== attr2.value) {
            return false;
        }
    }

    return true;
}

function compareBpmnDiagrams3(firstDiagram, secondDiagram) {
    const parser = new DOMParser();
    const firstXml = parser.parseFromString(firstDiagram, "application/xml");
    const secondXml = parser.parseFromString(secondDiagram, "application/xml");

    const feedback = [];

    const firstStartEvent = firstXml.querySelector("bpmn\\:startEvent");
    const secondStartEvent = secondXml.querySelector("bpmn\\:startEvent");
    if (!secondStartEvent) {
        feedback.push("Missing start event in the second diagram.");
    } else if (
        firstStartEvent &&
        firstStartEvent.getAttribute("id") !== secondStartEvent.getAttribute("id")
    ) {
        feedback.push("Start event ID mismatch.");
    }

    const firstTasks = Array.from(firstXml.querySelectorAll("bpmn\\:task"));
    const secondTasks = Array.from(secondXml.querySelectorAll("bpmn\\:task"));
    for (const secondTask of secondTasks) {
        const matchingTask = firstTasks.find(
            (task) => task.getAttribute("id") === secondTask.getAttribute("id")
        );
        if (!matchingTask) {
            feedback.push(
                `Missing task with ID ${secondTask.getAttribute("id")} in the first diagram.`
            );
        } else if (
            matchingTask.getAttribute("name") !== secondTask.getAttribute("name")
        ) {
            feedback.push(
                `Task name mismatch for ID ${secondTask.getAttribute("id")}.`
            );
        }
    }

    const firstFlows = Array.from(firstXml.querySelectorAll("bpmn\\:sequenceFlow"));
    const secondFlows = Array.from(secondXml.querySelectorAll("bpmn\\:sequenceFlow"));
    for (const secondFlow of secondFlows) {
        const matchingFlow = firstFlows.find(
            (flow) => flow.getAttribute("id") === secondFlow.getAttribute("id")
        );
        if (!matchingFlow) {
            feedback.push(
                `Missing sequence flow with ID ${secondFlow.getAttribute("id")} in the first diagram.`
            );
        }
    }

    if (feedback.length === 0) {
        feedback.push("No differences found. The second diagram matches the first diagram.");
    } else {
        feedback.unshift("Differences found between the two diagrams:");
    }

    return feedback;
}


export { compareBPMNDiagrams, compareBpmnDiagrams2, compareBpmnDiagrams3 }