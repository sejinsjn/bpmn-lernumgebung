function compareTree(tree1, tree2, bpmnElements1, bpmnElements2) {
    //Funktion um zwei Nodes zu vergleichen von denen min einer nur ein Attribut besitzt
    function handleSingleAttributeNode(tree1, tree2) {
        //falls ein Node ein Attribut hat aber der andere Node nicht dann ist es ein mismatch
        if ((Object.keys(nodeAttributes1).length === 1 && Object.keys(nodeAttributes2).length !== 1) ||
            (Object.keys(nodeAttributes1).length !== 1 && Object.keys(nodeAttributes2).length === 1)) {

            nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
            //suche nächstes Element was dem jetzigen zu trifft
            if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                missingElements.push(tree2.node); //falls nichts gefunden wurde, wird es zu den fehlenden Elementen hinzugefügt
                checkChildren(tree1.children, tree2.children);
            } else {
                mismatches.push(...nextMatchingElement.nonMatchingElements); //Elemente die nichts ins Diagram gehören
                checkChildren(nextMatchingElement.matchingElement.children, tree2.children);
            }
        } else if (tree1.node.nodeName === tree2.node.nodeName) {
            //überprüft welche art von start event 
            if(checkStartEventType(tree1, tree2)){
                matches.push(tree1.node);
                checkChildren(tree1.children, tree2.children);
            }else{
                mismatches.push(tree1.node);
                checkChildren(tree1.children, tree2.children);
            }
        }
    }
    
    // Überprüfung von nodes mit mehreren Attributen 
    function handleMultipleAttributeNode(tree1, tree2) {
        let attrMatch = true;
        let nodeMatch = true;
        // überprüfe ob start event und welches
        if(tree1.node.nodeName.includes("Event")){
            if(tree1.node.nodeName === tree2.node.nodeName){
                nodeMatch = checkStartEventType(tree1, tree2);
            }
        }
        
        //überprüfe alle Attribute
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                attrMatch = false;
                break;
            }
        }

        if (tree1.node.nodeName !== tree2.node.nodeName) {
            nodeMatch = false;
        }

        if(attrMatch && nodeMatch){
            matches.push(tree1.node);
            checkChildren(tree1.children, tree2.children);
        }else{

            if(tree1.children){
                nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
                //suche nächstes Element was dem jetzigen zu trifft
                if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                    missingElements.push(tree2.node); //zu den fehlenden hinzufügen
                    nextMatchingElement = findNextMatchingElement(tree1.node, tree2.children); //Prüfe ob tree1 in den Kindern von tree2 ist

                    if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                        if(nodeMatch) attrMismatch.push(tree1.node);
                        else mismatches.push(tree1.node); //zu den falschen Elementen hinzufügen
                        checkChildren(tree1.children, tree2.children);
                    }else{
                        matches.push(tree1.node); //Zu den richtigen Elementen hinzufügen
                        missingElements.push(...nextMatchingElement.nonMatchingElements);
                        checkChildren(tree1.children, nextMatchingElement.matchingElement.children);
                    }
                } else {
                    matches.push(nextMatchingElement.matchingElement.node);
                    mismatches.push(...nextMatchingElement.nonMatchingElements);
                    attrMismatch.push(...nextMatchingElement.attrMismatch);
                    nodeNameMismatch.push(...nextMatchingElement.nodeNameMismatch);
                    checkChildren(nextMatchingElement.matchingElement.children, tree2.children);
                }
            }else{
                missingElements.push(tree2.node);
                missingElements.push(...addAllChildren(tree2.children));
            }
        }
    }
      
    //überprüft die art des start events
    function checkStartEventType(tree1, tree2) {
        let children1Array = Array.from(tree1.node.children);
        let children2Array = Array.from(tree2.node.children);

        //suche die definition des start events raus
        let match1 = children1Array.find(
            (child1) => child1.nodeName.includes("Definition")
        );

        let match2 = children2Array.find(
            (child2) => child2.nodeName.includes("Definition")
        );

        if((!match1 && match2) || (match1 && !match2)){
            return false;
        }

        if(match1 && match2){
            if(match1.nodeName === match2.nodeName){
                return true;
            }
        }

        if(!match1 && !match2){
            return true;
        }
        
        return false;
    }
      
    //überprüfung der Kinder von beiden Nodes 
    function checkChildren(children1, children2){
        let children2Matches = [];
        let children1NoMatches = [];
        let children2NoMatches = [];
        if (children1.length !== 0 && children2.length !== 0) {
            if (children1.length === 1 && children2.length === 1) {
                let result = compareTree(children1[0], children2[0], bpmnElements1, bpmnElements2);
                    matches.push(...result.matches);
                    mismatches.push(...result.mismatches);
                    attrMismatch.push(...result.attrMismatch);
                    missingElements.push(...result.missingElements);
                    nodeNameMismatch.push(...result.nodeNameMismatch);
            }else{
                for (let i = 0; i < children1.length; i++) {
                    let child1 = children1[i];
                    let child2 = children2.find(c => (c.node.hasAttribute("name") && child1.node.hasAttribute("name") && 
                    c.node.getAttribute("name") === child1.node.getAttribute("name") && child1.node.nodeName === c.node.nodeName) || 
                        (!child1.node.hasAttribute("name") && !c.node.hasAttribute("name") && child1.node.nodeName === c.node.nodeName));
                    if (child2) {
                        let result = compareTree(child1, child2, bpmnElements1, bpmnElements2);
                        matches.push(...result.matches);
                        mismatches.push(...result.mismatches);
                        attrMismatch.push(...result.attrMismatch);
                        missingElements.push(...result.missingElements);
                        nodeNameMismatch.push(...result.nodeNameMismatch);
                        children2Matches.push(child2);
                    }else{
                        children1NoMatches.push(child1);
                    }
                }   

                children2NoMatches = children2.filter(c => !children2Matches.some(match => match.node.getAttribute("id") === c.node.getAttribute("id")));
                for (let i = 0; i < children2NoMatches.length; i++) {
                    if(children1NoMatches.length > 0){
                        for (let j = 0; j < children1NoMatches.length; j++) {
                            if(children1NoMatches[j].children){
                                nextMatchingElement = findNextMatchingElement(children2NoMatches[i].node, children1NoMatches[j].children); //Prüfe ob tree2 in den Kindern von tree1 ist
                                //suche nächstes Element was dem jetzigen zu trifft
                                if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                                    missingElements.push(children2NoMatches[i].node); //zu den fehlenden hinzufügen
                                    nextMatchingElement = findNextMatchingElement(children1NoMatches[j].node, children2NoMatches[i].children); //Prüfe ob tree1 in den Kindern von tree2 ist
    
                                    if (nextMatchingElement === null || nextMatchingElement.matchingElement === null) {
                                        let result = compareTree(children1NoMatches[j], children2NoMatches[i], bpmnElements1, bpmnElements2);
                                        matches.push(...result.matches);
                                        mismatches.push(...result.mismatches);
                                        attrMismatch.push(...result.attrMismatch);
                                        missingElements.push(...result.missingElements);
                                        nodeNameMismatch.push(...result.nodeNameMismatch);
                                        checkChildren(children1NoMatches[j].children, children2NoMatches[i].children);
                                    }else{
                                        matches.push(children1NoMatches[j].node); //Zu den richtigen Elementen hinzufügen
                                        missingElements.push(...nextMatchingElement.nonMatchingElements);
                                        checkChildren(children1NoMatches[j].children, nextMatchingElement.matchingElement.children);
                                    }
                                } else {
                                    matches.push(nextMatchingElement.matchingElement.node);
                                    mismatches.push(...nextMatchingElement.nonMatchingElements);
                                    checkChildren(nextMatchingElement.matchingElement.children, children2NoMatches[i].children);
                                }
                            }
                        }
                    }else{
                        //Falls children1NoMatches leer zu missingElements hinzufügen
                        if(children2NoMatches.length > 0){
                            missingElements.push(...addAllChildren(children2NoMatches));
                        }
                    }
                }
            }
        }else{
            if(children2.length > 0){
                missingElements.push(...addAllChildren(children2));
            }
        }
    }

    function addAllChildren(children){
        let foundChildren = [];
        for(let i = 0; i < children.length; i++){
            if(children[i].node !== undefined) foundChildren.push(children[i].node);
            if(children[i].children.length > 0){
                foundChildren.push(...addAllChildren(children[i].children));
            }
        }

        return foundChildren;
    }

    //überprüft alle DataStoreObjekte
    function checkNodeChildren(node1, node2){
        const children1 = node1.children;
        const children2 = node2.children;
        
        if(children1.length !== 0 && children2.length !== 0){
            for (let i = 0; i < children1.length; i++) {
                for (let j = 0; j < children2.length; j++) {
                    //Überprüfung ob beide Nodes Input oder Output Element haben
                    if((children1[i].nodeName.includes("Input") && children2[j].nodeName.includes("Input")) || 
                        (children1[i].nodeName.includes("Output") && children2[j].nodeName.includes("Output"))){

                            let child1 = null; let child2 = null;

                            child1 = bpmnElements1.get(children1[i].children[0].textContent);
                            child2 = bpmnElements2.get(children2[j].children[0].textContent);

                            let childAttributes1 = Object.fromEntries(Array.from(child1.attributes).map(attr => [attr.name, attr.value]));
                            let childAttributes2 = Object.fromEntries(Array.from(child2.attributes).map(attr => [attr.name, attr.value]));

                            let isMatch = true;
                            //überprüfung aller Attribute
                            for (let attr in childAttributes1) {
                                if (attr !== "id" && attr !== "dataObjectRef" && childAttributes1[attr] !== childAttributes2[attr]) {
                                    isMatch = false;
                                    break; 
                                }
                            }

                            if (isMatch) {
                                matches.push(child1); 
                            } else {
                                mismatches.push(child1); 
                                attrMismatch.push(child1);
                            }
                    }
                    
                    
                    //falls nur ein Element Input oder Output Elemente besitzt wird es zu den mismatches hinzugefügt
                    if(!children1[i].nodeName.includes("incoming") && !children1[i].nodeName.includes("outgoing")){
                        if(children1[i].nodeName.includes("Input") || children1[i].nodeName.includes("Output")){
                            if(!mismatches.includes(bpmnElements1.get(children1[i].children[0].textContent))){
                                mismatches.push(bpmnElements1.get(children1[i].children[0].textContent));
                            }
                        }
                    }
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

    if (Object.keys(nodeAttributes1).length === 1 || Object.keys(nodeAttributes2).length === 1) {
        handleSingleAttributeNode(tree1, tree2);
    } else {
        handleMultipleAttributeNode(tree1, tree2);
    }
    checkNodeChildren(tree1.node, tree2.node);

    return {matches: matches, mismatches: mismatches, attrMismatch: attrMismatch, nodeNameMismatch: nodeNameMismatch, missingElements: missingElements};
}

function findNextMatchingElement(node, children) {
    let nonMatchingElements = [];
    let attrMismatch = [];
    let nodeNameMismatch = [];
    let visitedNodes = new Set();

    const checkChild = (child) => {
        if (visitedNodes.has(child.node)) {
            return {nodeNameMismatch: nodeNameMismatch, attrMismatch: attrMismatch, nonMatchingElements: nonMatchingElements, matchingElement: null};
        }
        //Element besucht
        visitedNodes.add(child.node);

        //hole alle Attribute und map mit Attributnamen
        let nodeAttributes1 = Object.fromEntries(Array.from(node.attributes).map(attr => [attr.name, attr.value]));
        let nodeAttributes2 = Object.fromEntries(Array.from(child.node.attributes).map(attr => [attr.name, attr.value]));

        let attrMatch = true;
        let nodeMatch = true;
        for (let attr in nodeAttributes1) {
            if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) { //Überprüfung der Attribute
                attrMatch = false;
                break;
            }
        }

        if(node.nodeName !== child.node.nodeName){
            nodeMatch = false;
        }

        if(!attrMatch && !nodeMatch){
            if(!nonMatchingElements.includes(child.node)) nonMatchingElements.push(child.node);
        }else{
            if(!attrMatch) attrMismatch.push(child.node);
            if(!nodeMatch) nodeNameMismatch.push(child.node);
        }

        if (attrMatch && nodeMatch) {
            return { nodeNameMismatch: nodeNameMismatch, attrMismatch: attrMismatch ,nonMatchingElements: nonMatchingElements, matchingElement: child };
        } else if (child.children.length > 0) { //falls Kinder existieren
            for (let i = 0; i < child.children.length; i++) {
                return checkChild(child.children[i]); //Überprüfe Kinder
            }
        }

        return {nodeNameMismatch: null, attrMismatch: null,nonMatchingElements: null, matchingElement: null}; // gibt null zurück falls keins gefunden wurde
    }

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName !== "bpmn:incoming" && children[i].nodeName !== "bpmn:outgoing") {
            let result = checkChild(children[i], nonMatchingElements);
            if (result.matchingElement) return result; //sucht solange bis ein matchingElement gefunden wurde
        }
    }

    return {nodeNameMismatch: null, attrMismatch: null,nonMatchingElements: null, matchingElement: null}; // gibt null zurück falls keins gefunden wurde
}

//fügt alle Elemente aller Bäume in Arrays
function turnTreesIntoArray(trees){
    let elements = [];
    
    trees.forEach(child => elements.push(...turnTreeIntoArray(child)));

    return elements;
}

//fügt alle Elemente eines Baumes in ein Array
function turnTreeIntoArray(tree){
    let elements = [];
    
    if(tree.node !== undefined){
        elements.push(tree.node);
        if(tree.children !== undefined) tree.children.forEach(child => elements.push(...turnTreeIntoArray(child)));
    }

    return elements;
}

//Vergleich aller Bäume von diagram1 mit diagram2
function compareTrees(diagram1, diagram2){ //diagram2 ist die lösung
    const allNonMatchingElements = [];
    const allNonMatchingAttributes = [];
    const allNonMatchingNodeNames = [];
    const allMissingElements = [];
    const allMatchingElements = [];
    let treesFound = [];
    let treesNotFound = [];
    const trees1 = diagram1.trees;
    const trees2 = diagram2.trees;

    for (let i = 0; i < trees1.length; i++) {
        let tree1 = trees1[i];
        let tree2 = trees2.find(t => t.node.getAttribute("name") === tree1.node.getAttribute("name"));
        if (tree2) {
            let compare = compareTree(tree1, tree2, diagram1.processes.bpmnElements, diagram2.processes.bpmnElements);
            allNonMatchingElements.push(...compare.mismatches);
            allMatchingElements.push(...compare.matches);
            allNonMatchingAttributes.push(...compare.attrMismatch);
            allNonMatchingNodeNames.push(...compare.nodeNameMismatch);
            allMissingElements.push(...compare.missingElements);
            treesFound.push(tree2);
        }
    }

    treesNotFound = trees2.filter(t => !treesFound.includes(t));
    allMissingElements.push(...turnTreesIntoArray(treesNotFound));
    
    return {matches: allMatchingElements, mismatches: allNonMatchingElements, attrMismatch: allNonMatchingAttributes, nodeNameMismatch: allNonMatchingNodeNames, 
        missingElements: allMissingElements};
}

//Vergleich der Akteure
function compareParticipants(participants1, participants2) {
    //Filtert alle Elemente in participants1 die keinen match mit Elementen in participants2 haben
    const allNonMatchingElements = participants1.filter(participant1 => !participants2.some(participant2 => participant2.getAttribute("name") === participant1.getAttribute("name"))); 
    //Filtert alle Elemente in participants1 die einen match mit Elementen in participants2 haben
    const allMatchingElements = participants1.filter(participant1 => participants2.some(participant2 => participant1.getAttribute("name") === participant2.getAttribute("name")));
    //Filtert alle Elemente in participants2 die keinen match mit Elementen in participants1 haben
    const missingElements = participants2.filter(participant2 => !participants1.some(participant1 => participant1.getAttribute("name") === participant2.getAttribute("name")));

    return {allNonMatchingElements: allNonMatchingElements, allMatchingElements: allMatchingElements, missingElements: missingElements};
}

//Vergleich der Elemente, die mit einem Messageflow verbunden sind
function compareMessageFlows(bpmnElements1, messageFlows1, bpmnElements2, messageFlows2) {

    //Prüft ob zwei Messageflows übereintimmen
    function isMatch(messageFlow1, messageFlow2) {
        const sourceRef1 = messageFlow1.getAttribute("sourceRef");
        const targetRef1 = messageFlow1.getAttribute("targetRef");
        const sourceRef2 = messageFlow2.getAttribute("sourceRef");
        const targetRef2 = messageFlow2.getAttribute("targetRef");

        if (bpmnElements1.get(sourceRef1) !== undefined && bpmnElements2.get(sourceRef2) !== undefined) {
            //Vergleich der zwei Elemente vom Ziel und Ursprung
            if (bpmnElements1.get(sourceRef1).getAttribute("name") !== bpmnElements2.get(sourceRef2).getAttribute("name")
                || bpmnElements1.get(targetRef1).getAttribute("name") !== bpmnElements2.get(targetRef2).getAttribute("name")
                || messageFlow1.nodeName !== messageFlow2.nodeName) {
                return false;
            }
        }
        
        return true;
    }

    //Filtert alle Elemente in messageFlows1 die keinen match mit Elementen in messageFlows2 haben
    const allNonMatchingElements = messageFlows1.filter(messageFlow1 => messageFlows2.some(messageFlow2 => !isMatch(messageFlow1, messageFlow2))); 
    //Filtert alle Elemente in messageFlows1 die einen match mit Elementen in messageFlows2 haben
    const allMatchingElements = messageFlows1.filter(messageFlow1 => messageFlows2.some(messageFlow2 => isMatch(messageFlow1, messageFlow2))); 
    //Filtert alle Elemente in messageFlows2 die keinen match mit Elementen in messageFlows1 haben
    const missingElements = messageFlows2.filter(messageFlow2 => messageFlows1.some(messageFlow1 => isMatch(messageFlow1, messageFlow2))); 

    return { matches: allMatchingElements, mismatches: allNonMatchingElements, missingElements: missingElements };
}

//Vergleich der Lanes innerhalb eines Akteures
function compareLanes(bpmnElements1, laneSets1, bpmnElements2, laneSets2) {
    let nonMatchingLanes = [];
    let matchingLanes = [];

    //Vergleich alle Kinder eines Lanes mit den Kindern eines anderen
    for (let laneSet1 of laneSets1) {
        //Durchlaufe alle Kinder
        for (let child1 of laneSet1.children) {
            let matchFound = false;
            const laneAttributes1 = child1.attributes;

            // Durchlaufe alle Lanes von 2
            for (let laneSet2 of laneSets2) {
                //Durchlaufe alle Kinder von 2
                for (let child2 of laneSet2.children) {
                    const laneAttributes2 = child2.attributes;
                    //prüfe ob Attribute stimmen
                    if (!attributesMatch(laneAttributes1, laneAttributes2)) continue; 

                    const flowNodeRefs1 = Array.from(child1.getElementsByTagName("bpmn:flowNodeRef"));
                    const flowNodeRefs2 = Array.from(child2.getElementsByTagName("bpmn:flowNodeRef"));

                    //Prüfe ob die Elemente innerhalb der Lanes übereinstimmt, wenn nicht wird übersprungen
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

//Vergleiche die Attribute von zwei Lanes
function attributesMatch(laneAttributes1, laneAttributes2) {
    if (laneAttributes1.length !== laneAttributes2.length) return false;

    for (let i = 0; i < laneAttributes1.length; i++) {
        const attrValue1 = laneAttributes1[i].value;
        const attrValue2 = laneAttributes2[i].value;

        if (laneAttributes1[i].name !== "id" && attrValue1 !== attrValue2) return false;
    }

    return true;
}

//Vergleich der Elemente innerhalb eines Lanes
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

//Alle Funktionen für den Vergleich nötig aufrufen und Ergebnisse zurückgeben
export function compareBpmnDiagrams2(diagram1, diagram2){
    let allNonMatchingElements = [];
    let allMatchingElements = [];
    let allNonMatchingAttributes = [];
    let allNonMatchingNodeNames = [];
    let allMissingElements = [];

    //Vergleich der Bäume
    const compare = compareTrees(diagram1, diagram2);
    allNonMatchingElements.push(...compare.mismatches);
    allMatchingElements.push(...compare.matches);
    allNonMatchingAttributes.push(...compare.attrMismatch);
    allNonMatchingNodeNames.push(...compare.nodeNameMismatch);
    allMissingElements.push(...compare.missingElements);

    //Vergleich der Akteure
    const compareParticipantsResult = compareParticipants(diagram1.collaborations.participants, diagram2.collaborations.participants)
    allNonMatchingElements.push(...compareParticipantsResult.allNonMatchingElements);
    allMatchingElements.push(...compareParticipantsResult.allMatchingElements);
    allMissingElements.push(...compareParticipantsResult.missingElements);

    //Vergleich der MessageFlows
    const compareMessageFlowsResult = compareMessageFlows(diagram1.processes.bpmnElements ,diagram1.collaborations.messageFlows, diagram2.processes.bpmnElements, diagram2.collaborations.messageFlows);
    allNonMatchingElements.push(...compareMessageFlowsResult.mismatches);
    allMatchingElements.push(...compareMessageFlowsResult.matches);
    
    //Vergleich der Lanes
    const compareLanesResult = compareLanes(diagram1.processes.bpmnElements ,diagram1.processes.laneSets, diagram2.processes.bpmnElements, diagram2.processes.laneSets);
    allNonMatchingElements.push(...compareLanesResult.mismatches);
    allMatchingElements.push(...compareLanesResult.matches);
    
    //Entferne alle doppelten Elemente
    allNonMatchingElements = allNonMatchingElements.filter((item, index, self) => self.indexOf(item) === index);
    allNonMatchingAttributes = allNonMatchingAttributes.filter((item, index, self) => self.indexOf(item) === index);
    allNonMatchingNodeNames = allNonMatchingNodeNames.filter((item, index, self) => self.indexOf(item) === index);
    allMissingElements = allMissingElements.filter((item, index, self) => self.indexOf(item) === index);

    //filter dataObjects heraus weil diese keine visuellen Elemente darstellen
    allNonMatchingElements = allNonMatchingAttributes.filter(element => element.nodeName !== ("bpmn:dataObject"));
    //filtere lose Elemente und füge sie ins allNonMatchingelements ein
    let looseElements = diagram1.processes.bpmnElementsArray.filter(element => !allMatchingElements.some(match => match.getAttribute("id") === element.getAttribute("id")));
    allNonMatchingElements.push(...looseElements);
     
    allNonMatchingElements = allNonMatchingElements.filter(e => !allNonMatchingAttributes.some(a => a.getAttribute("id") === e.getAttribute("id")));
    allMissingElements = allMissingElements.filter(e => !allMatchingElements.some(a => a.getAttribute("name") === e.getAttribute("name")));
    
    return {matches: allMatchingElements, mismatches: allNonMatchingElements, attrMismatch: allNonMatchingAttributes, nodeNameMismatch: allNonMatchingNodeNames, 
        missingElements: allMissingElements };
}