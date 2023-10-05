function compareTree(tree1, tree2) {
    let matches = [];
    let mismatches = [];
    let nextMatchingElement = null;
    
    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    if(Object.keys(nodeAttributes1).length === 1){
        if(tree1.node.nodeName === tree2.node.nodeName && (tree1.node.nodeName !== "bpmn:task")){
            matches.push(tree1.node);
            checkChildren(tree1.children, tree2.children);
        }else{
            mismatches.push(tree1.node);
            checkChildren(tree1.children, tree2.children);
        }
    }else{
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
                if(nextMatchingElement === null || nextMatchingElement.matchingElement === null){
                    mismatches.push(tree1.node);
                    checkChildren(tree1.children, tree2.children);
                    break;
                }else{
                    mismatches.push(tree1.node);
                    mismatches.push(...nextMatchingElement.nonMatchingElements);
                    checkChildren(nextMatchingElement.matchingElement.children, tree2.children);
                    break;
                }
            }else{
                if (attr !== "id" && nodeAttributes1[attr] === nodeAttributes2[attr]){
                    matches.push(tree1.node);
                    checkChildren(tree1.children, tree2.children);
                }
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
                }
            }
        }
    }

    return {matches: matches, mismatches: mismatches};
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

 
function treeToArray(tree){
   let treeArray = [];

   treeArray.push(tree.node);
   for (let i = 0; i < tree.children.length; i++) {
      treeArray.push(...treeToArray(tree.children[i]));
   }

   return treeArray;
}

function treesToArray(trees){
   let treesArray = [];

   for(var i = 0; i < trees.length; i++){
      let treeArray = treeToArray(trees[i]);
      treesArray.push(...treeArray);
  }

  return treesArray;
}

function compareTrees(trees1, trees2){
    const allNonMatchingElements = [];
    const allMatchingElements = [];
    
    for(var i = 0; i < trees1.length; i++){
        let compare = compareTree(trees1[i], trees2[i]);
        allNonMatchingElements.push(...compare.mismatches);
        allMatchingElements.push(...compare.matches);
    }
    
    return {matches: allMatchingElements, mismatches: allNonMatchingElements };
}

function compareParticipants(participants1, participants2) {
    const allNonMatchingElements = [];

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
                break;
            }
        }

        if(!isMatchFound){
            allNonMatchingElements.push(participant1);
        }
    }

    return allNonMatchingElements;
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

    const compare = compareTrees(diagram1.trees, diagram2.trees);
    allNonMatchingElements.push(...compare.mismatches);
    allMatchingElements.push(...compare.matches);
    allNonMatchingElements.push(...compareParticipants(diagram1.collaborations.participants, diagram2.collaborations.participants));
    allNonMatchingElements.push(...compareMessageFlows(diagram1.processes.bpmnElements ,diagram1.collaborations.messageFlows, diagram2.processes.bpmnElements, diagram2.collaborations.messageFlows).mismatches);
    allMatchingElements.push(...compareMessageFlows(diagram1.processes.bpmnElements ,diagram1.collaborations.messageFlows, diagram2.processes.bpmnElements, diagram2.collaborations.messageFlows).matches);
    allNonMatchingElements.push(...compareLanes(diagram1.processes.bpmnElements ,diagram1.processes.laneSets, diagram2.processes.bpmnElements, diagram2.processes.laneSets).mismatches);
    allMatchingElements.push(...compareLanes(diagram1.processes.bpmnElements ,diagram1.processes.laneSets, diagram2.processes.bpmnElements, diagram2.processes.laneSets).matches);

    return {matches: allMatchingElements, mismatches: allNonMatchingElements };
}