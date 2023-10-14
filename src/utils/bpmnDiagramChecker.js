function compareTree(tree1, tree2) {
    function handleSingleAttributeNode(tree1, tree2) {
        if ((Object.keys(nodeAttributes1).length === 1 && Object.keys(nodeAttributes2).length !== 1) ||
            (Object.keys(nodeAttributes1).length !== 1 && Object.keys(nodeAttributes2).length === 1)) {
            mismatches.push(tree1.node);
            attrMismatch.push(tree1.node);
        } else if (tree1.node.nodeName === tree2.node.nodeName) {
            matches.push(tree1.node);
        }
        checkChildren(tree1.children, tree2.children);
    }
    
    function handleMultipleAttributeNode(tree1, tree2) {
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                mismatches.push(tree1.node);
                attrMismatch.push(tree1.node);
                nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);

                if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                    missingElements.push(tree2.node);
                    tree2.children.forEach(child => {
                        
                        let compare = compareTree(tree1, child);
                        mismatches.push(...compare.mismatches);
                        matches.push(...compare.matches);
                        attrMismatch.push(...compare.attrMismatch);
                        nodeNameMismatch.push(...compare.nodeNameMismatch);
                        missingElements.push(...compare.missingElements);
                    });
                    break;
                } else {
                    mismatches.push(...nextMatchingElement.nonMatchingElements);
                    checkChildren(nextMatchingElement.matchingElement.children, tree2.children);
                    break;
                }
            } else if (attr !== "id" && nodeAttributes1[attr] === nodeAttributes2[attr]) {
                matches.push(tree1.node);
                checkChildren(tree1.children, tree2.children);
            }
        }
    }
    

    function checkChildren(children1, children2){
        if(children1.length !== 0 && children2.length !== 0){
            for (let i = 0; i < children1.length; i++) {
                for (let j = 0; j < children2.length; j++) {
                    let result = compareTree(children1[i], children2[j]);
                    matches.push(...result.matches);
                    mismatches.push(...result.mismatches);
                    attrMismatch.push(...result.attrMismatch);
                    missingElements.push(...result.missingElements);
                    nodeNameMismatch.push(...result.nodeNameMismatch);
                }
            }
        }
    }

    let matches = [];
    let mismatches = [];
    let attrMismatch = [];
    let missingElements = [];
    let nodeNameMismatch = [];
    let nextMatchingElement = null;
    
    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    if (tree1.node.nodeName !== tree2.node.nodeName) {
        mismatches.push(tree1.node);
        nodeNameMismatch.push(tree1.node);
    }
    if (Object.keys(nodeAttributes1).length === 1 || Object.keys(nodeAttributes2).length === 1) {
        handleSingleAttributeNode(tree1, tree2);
    } else {
        handleMultipleAttributeNode(tree1, tree2);
    }

    return {matches: matches, mismatches: mismatches, attrMismatch: attrMismatch, nodeNameMismatch: nodeNameMismatch, missingElements: missingElements};
}

function findNextMatchingElement(node, children) {
    let nonMatchingElements = [];
    let visitedNodes = new Set();

    const checkChild = (child, nonMatchingElements) => {
        if (visitedNodes.has(child.node)) {
            return {nonMatchingElements: nonMatchingElements, matchingElement: null};
        }
        visitedNodes.add(child.node);

        let nodeAttributes1 = Object.fromEntries(Array.from(node.attributes).map(attr => [attr.name, attr.value]));
        let nodeAttributes2 = Object.fromEntries(Array.from(child.node.attributes).map(attr => [attr.name, attr.value]));

        let isMatch = true;
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                isMatch = false;
                break;
            }
        }

        if(node.nodeName !== child.node.nodeName){
            isMatch = false;
        }

        if (!isMatch && !nonMatchingElements.includes(child.node)) {
            nonMatchingElements.push(child.node);
        }

        if (isMatch) {
            const nextMatchingElement = {
                nonMatchingElements: nonMatchingElements,
                matchingElement: child,
            }
            return nextMatchingElement;
        } else if (child.children.length > 0) {
            let matchingChild = null;
            for (let i = 0; i < child.children.length; i++) {
                let result = checkChild(child.children[i], nonMatchingElements);
                if (result.matchingElement) {
                    matchingChild = result.matchingElement;
                    nonMatchingElements = result.nonMatchingElements;
                }
            }
            if (matchingChild) {
                const nextMatchingElement = {
                    nonMatchingElements: nonMatchingElements,
                    matchingElement: matchingChild,
                }
                return nextMatchingElement;
            }
        }

        return {nonMatchingElements: nonMatchingElements, matchingElement: null}; // Return null if no matching element is found
    }

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName !== "bpmn:incoming" && children[i].nodeName !== "bpmn:outgoing") {
            let result = checkChild(children[i], nonMatchingElements);
            if (result.matchingElement) return result;
        }
    }

    return {nonMatchingElements: nonMatchingElements, matchingElement: null}; // Return null if no matching element is found
}

function turnTreesIntoArray(trees){
    let elements = [];
    
    trees.forEach(child => elements.push(...turnTreeIntoArray(child)));

    return elements;
}


function turnTreeIntoArray(tree){
    let elements = [];
    
    if(tree.node !== undefined){
        elements.push(tree.node);
        if(tree.children !== undefined) tree.children.forEach(child => elements.push(...turnTreeIntoArray(child)));
    }

    return elements;
}

function compareTrees(trees1, trees2){
    const allNonMatchingElements = [];
    const allNonMatchingAttributes = [];
    const allNonMatchingNodeNames = [];
    const allMissingElements = [];
    const allMatchingElements = [];
    
    if(trees1.length > trees2.length) allNonMatchingElements.push(...turnTreesIntoArray(trees1.splice(trees2.length)));
    if(trees2.length > trees1.length) allMissingElements.push(...turnTreesIntoArray(trees2.splice(trees1.length)));

    for(var i = 0; i < trees1.length; i++){
        let compare = compareTree(trees1[i], trees2[i]);
        allNonMatchingElements.push(...compare.mismatches);
        allMatchingElements.push(...compare.matches);
        allNonMatchingAttributes.push(...compare.attrMismatch);
        allNonMatchingNodeNames.push(...compare.nodeNameMismatch);
        allMissingElements.push(...compare.missingElements);
    }
    
    return {matches: allMatchingElements, mismatches: allNonMatchingElements, attrMismatch: allNonMatchingAttributes, nodeNameMismatch: allNonMatchingNodeNames, 
        missingElements: allMissingElements};
}

function compareParticipants(participants1, participants2) {
    const allNonMatchingElements = [];
    const allMatchingElements = [];

    for(var j = 0; j < participants1.length; j++){
        const participant1 = participants1[j];
        let isMatchFound = false;

        for(var k = 0; k < participants2.length; k++){
            const participant2 = participants2[k];
            const attributes1 = participant1.attributes;
            let isMatch = true;

            for (let i = 0; i < attributes1.length; i++) {
                const attrName = attributes1[i].name;
                if ((attrName !== "id" || attrName !== "processRef") && participant1.getAttribute(attrName) !== participant2.getAttribute(attrName)) {
                    isMatch = false;
                    break;
                }
            }

            if(isMatch){
                isMatchFound = true;
                allMatchingElements.push(participant1);
                break;
            }
        }

        if(!isMatchFound){
            allNonMatchingElements.push(participant1);
        }
    }

    return {allNonMatchingElements: allNonMatchingElements, allMatchingElements: allMatchingElements};
}


function compareMessageFlows(bpmnElements1, messageFlows1, bpmnElements2, messageFlows2) {
    let matchingMessageFlows = [];
    let nonMatchingMessageFlows = [];

    for (let messageFlow1 of messageFlows1) {
        let isMatchFound = false;

        for (let messageFlow2 of messageFlows2) {
            if (isMatch(messageFlow1, messageFlow2, bpmnElements1, bpmnElements2)) {
                isMatchFound = true;
                break;
            }
        }

        if (isMatchFound) {
            matchingMessageFlows.push(messageFlow1);
        } else {
            nonMatchingMessageFlows.push(messageFlow1);
        }
    }

    return { matches: matchingMessageFlows, mismatches: nonMatchingMessageFlows };
}

function isMatch(messageFlow1, messageFlow2, bpmnElements1, bpmnElements2) {
    const sourceRef1 = messageFlow1.getAttribute("sourceRef");
    const targetRef1 = messageFlow1.getAttribute("targetRef");
    const sourceRef2 = messageFlow2.getAttribute("sourceRef");
    const targetRef2 = messageFlow2.getAttribute("targetRef");

    if (bpmnElements1.get(sourceRef1) !== undefined && bpmnElements2.get(sourceRef2) !== undefined) {
        if (bpmnElements1.get(sourceRef1).getAttribute("name") !== bpmnElements2.get(sourceRef2).getAttribute("name") 
            || bpmnElements1.get(targetRef1).getAttribute("name") !== bpmnElements2.get(targetRef2).getAttribute("name")
            || messageFlow1.nodeName !== messageFlow2.nodeName) {
            return false;
        }
    }

    return true;
}


function compareLanes(bpmnElements1, laneSets1, bpmnElements2, laneSets2) {
    let nonMatchingLanes = [];
    let matchingLanes = [];

    for (let laneSet1 of laneSets1) {
        for (let child1 of laneSet1.children) {
            let matchFound = false;
            const laneAttributes1 = child1.attributes;

            for (let laneSet2 of laneSets2) {
                for (let child2 of laneSet2.children) {
                    const laneAttributes2 = child2.attributes;

                    if (!attributesMatch(laneAttributes1, laneAttributes2)) continue;

                    const flowNodeRefs1 = Array.from(child1.getElementsByTagName("bpmn:flowNodeRef"));
                    const flowNodeRefs2 = Array.from(child2.getElementsByTagName("bpmn:flowNodeRef"));

                    if (!flowNodeRefsMatch(flowNodeRefs1, flowNodeRefs2, bpmnElements1, bpmnElements2)) continue;

                    matchFound = true;
                    break;
                }

                if (matchFound) break;
            }

            if (matchFound) {
                matchingLanes.push(child1);
            } else {
                nonMatchingLanes.push(child1);
            }
        }
    }

    return { matches: matchingLanes, mismatches: nonMatchingLanes };
}

function attributesMatch(laneAttributes1, laneAttributes2) {
    if (laneAttributes1.length !== laneAttributes2.length) return false;

    for (let i = 0; i < laneAttributes1.length; i++) {
        const attrValue1 = laneAttributes1[i].value;
        const attrValue2 = laneAttributes2[i].value;

        if (laneAttributes1[i].name !== "id" && attrValue1 !== attrValue2) return false;
    }

    return true;
}

function flowNodeRefsMatch(flowNodeRefs1, flowNodeRefs2, bpmnElements1, bpmnElements2) {
    if (flowNodeRefs1.length !== flowNodeRefs2.length) return false;

    for (let i = 0; i < flowNodeRefs1.length; i++) {
        const element1 = bpmnElements1.get(flowNodeRefs1[i].textContent);
        let matchFound = false;

        for (let j = 0; j < flowNodeRefs2.length; j++) {
            const element2 = bpmnElements2.get(flowNodeRefs2[j].textContent);

            if (element1.nodeName === element2.nodeName) {
                matchFound = true;
                break;
            }
        }

        if (!matchFound) return false;
    }

    return true;
}

export function compareBpmnDiagrams2(diagram1, diagram2){
    const allNonMatchingElements = [];
    const allMatchingElements = [];
    const allNonMatchingAttributes = [];
    const allNonMatchingNodeNames = [];
    const allMissingElements = [];

    const compare = compareTrees(diagram1.trees, diagram2.trees);
    allNonMatchingElements.push(...compare.mismatches);
    allMatchingElements.push(...compare.matches);
    allNonMatchingAttributes.push(...compare.attrMismatch);
    allNonMatchingNodeNames.push(...compare.nodeNameMismatch);
    allMissingElements.push(...compare.missingElements);

    const compareParticipantsResult = compareParticipants(diagram1.collaborations.participants, diagram2.collaborations.participants)
    allNonMatchingElements.push(...compareParticipantsResult.allNonMatchingElements);
    allMatchingElements.push(...compareParticipantsResult.allMatchingElements);

    const compareMessageFlowsResult = compareMessageFlows(diagram1.processes.bpmnElements ,diagram1.collaborations.messageFlows, diagram2.processes.bpmnElements, diagram2.collaborations.messageFlows);
    allNonMatchingElements.push(...compareMessageFlowsResult.mismatches);
    allMatchingElements.push(...compareMessageFlowsResult.matches);
    
    const compareLanesResult = compareLanes(diagram1.processes.bpmnElements ,diagram1.processes.laneSets, diagram2.processes.bpmnElements, diagram2.processes.laneSets);
    allNonMatchingElements.push(...compareLanesResult.mismatches);
    allMatchingElements.push(...compareLanesResult.matches);

    return {matches: allMatchingElements, mismatches: allNonMatchingElements, attrMismatch: allNonMatchingAttributes, nodeNameMismatch: allNonMatchingNodeNames, 
        missingElements: allMissingElements };
}