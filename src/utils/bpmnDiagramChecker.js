/**function compareTree(tree1, tree2) {
    let matches = [];
    let mismatches = [];
    let nextMatchingElement = null;

    if (tree1.name !== tree2.name || tree1.children.length !== tree2.children.length) {
        for(let i = 0; i < tree1.children.length; i++){
            mismatches.push(tree1.children[i].node);
        }
       return {matches, mismatches};
    }

    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    for (let attr in nodeAttributes1) {
        if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
            nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
            if(nextMatchingElement === null){
                mismatches.push(tree1.node);
                break;
            }else{
                mismatches.push(tree1.node);
                mismatches.push(...nextMatchingElement.nonMatchingElements);
                let children1 = nextMatchingElement.matchingElement.node.children;
                let children2 = tree2.node.children;

                if(children1.length !== 0 && children2.length !== 0){
                    for (let i = 0; i < nextMatchingElement.matchingElement.children.length; i++) {
                        let result = compareTree(nextMatchingElement.matchingElement.children[i], tree2.children[i]);
                        matches.push(...result.matches);
                        mismatches.push(...result.mismatches);
                    }
                }
                break;
            }
        }else{
            if (attr !== "id" && nodeAttributes1[attr] === nodeAttributes2[attr]){
                matches.push(tree1.node);
            }
        }
    }

    if(nextMatchingElement === null){
        let children1 = tree1.node.children;
        let children2 = tree2.node.children;
    
        if(children1.length !== 0 && children2.length !== 0){
            for (let i = 0; i < tree1.children.length; i++) {
                let result = compareTree(tree1.children[i], tree2.children[i]);
                matches.push(...result.matches);
                mismatches.push(...result.mismatches);
            }
        }
    }

    return {matches: matches, mismatches: mismatches};
}**/

function compareTree(tree1, tree2) {
    let matches = [];
    let mismatches = [];
    let nextMatchingElement = null;

    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    if(Object.keys(nodeAttributes1).length === 1){
        if(tree1.node.nodeName === tree2.node.nodeName && (tree1.node.nodeName === "bpmn:startEvent" || tree1.node.nodeName === "bpmn:endEvent")){
            matches.push(tree1.node);
            checkChildren(tree1.children, tree2.children);
        }
    }else{
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
                console.log(nextMatchingElement);
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

function compareMessageFlows(bpmnElements1, messageFlows1, bpmnElements2, messageFlows2){
    const nonMatchingMessageFlows = [];

    for(var j = 0; j < messageFlows1.length; j++){
        const messageFlow1 = messageFlows1[j];
        let isMatchFound = false;

        for(var k = 0; k < messageFlows2.length; k++){
            const messageFlow2 = messageFlows2[k];
            let isMatch = true;

            const sourceRef1 = messageFlow1.getAttribute("sourceRef");
            const targetRef1 = messageFlow1.getAttribute("targetRef");
            const sourceRef2 = messageFlow2.getAttribute("sourceRef");
            const targetRef2 = messageFlow2.getAttribute("targetRef");

            if(bpmnElements1.get(sourceRef1) !== undefined && bpmnElements2.get(sourceRef2) !== undefined){
                if(bpmnElements1.get(sourceRef1).getAttribute("name") !== bpmnElements2.get(sourceRef2).getAttribute("name") 
                || bpmnElements1.get(targetRef1).getAttribute("name") !== bpmnElements2.get(targetRef2).getAttribute("name")
                || messageFlow1.nodeName !== messageFlow2.nodeName) {
                    isMatch = false;
                }
            }

            if(isMatch){
                isMatchFound = true;
                break;
            }
        }

        if(!isMatchFound){
            nonMatchingMessageFlows.push(messageFlow1);
        }
    }

    return nonMatchingMessageFlows;

}

function compareLanes(bpmnElements1, laneSets1, bpmnElements2, laneSets2){
    let nonMatchingLanes = [];
    
    for(var j = 0; j < laneSets1.length; j++){
        let children1 = laneSets1[j].children;
        let children2 = laneSets2[j].children;

        if(children1.length !== children2.length){
            nonMatchingLanes.push(...laneSets1[j].children);
            break;
        }

        for(var i = 0; i < children1.length; i++){
            const laneAttributes1 = children1[i].attributes;
            const laneAttributes2 = children2[i].attributes;

            if(laneAttributes1.length !== laneAttributes2.length){
                nonMatchingLanes.push(children1[i]);
                break;
            }
            
            for (let i = 0; i < laneAttributes1.length; i++) {
                const attrValue1 = laneAttributes1[i].value;
                const attrValue2 = laneAttributes2[i].value;

                if (laneAttributes1[i].name !== "id" && attrValue1 !== attrValue2) {
                    nonMatchingLanes.push(children1[i]);
                    break;
                }
            }

            const flowNodeRefs1 = Array.from(children1[i].getElementsByTagName("bpmn:flowNodeRef"));
            const flowNodeRefs2 = Array.from(children2[i].getElementsByTagName("bpmn:flowNodeRef"));

            if(flowNodeRefs1.length !== flowNodeRefs2.length){
                console.log(children1[i]);
                nonMatchingLanes.push(children1[i]);
                break;
            }

            for(var a = 0; a < flowNodeRefs1.length; a++){
                const attributes1 = bpmnElements1.get(flowNodeRefs1[a].textContent).attributes;
                const attributes2 = bpmnElements2.get(flowNodeRefs2[a].textContent).attributes;
                for (let i = 0; i < attributes1.length; i++) {
                    const attrValue1 = attributes1[i].value;
                    const attrValue2 = attributes2[i].value;

                    if (attributes1[i].name !== "id" && attrValue1 !== attrValue2) {
                        nonMatchingLanes.push(children1[i]);
                        break;
                    }
                }
            }
        }
    }

    return nonMatchingLanes;
}

export function compareBpmnDiagrams2(diagram1, diagram2){
    const allNonMatchingElements = [];
    const allMatchingElements = [];

    const compare = compareTrees(diagram1.trees, diagram2.trees);
    allNonMatchingElements.push(...compare.mismatches);
    allMatchingElements.push(...compare.matches);
    allNonMatchingElements.push(...compareParticipants(diagram1.collaborations.participants, diagram2.collaborations.participants));
    allNonMatchingElements.push(...compareMessageFlows(diagram1.processes.bpmnElements ,diagram1.collaborations.messageFlows, diagram2.processes.bpmnElements, diagram2.collaborations.messageFlows));
    allNonMatchingElements.push(...compareLanes(diagram1.processes.bpmnElements ,diagram1.processes.laneSets, diagram2.processes.bpmnElements, diagram2.processes.laneSets));

    return {matches: allMatchingElements, mismatches: allNonMatchingElements };
}