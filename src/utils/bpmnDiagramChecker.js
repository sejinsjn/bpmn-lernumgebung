import { faIgloo } from "@fortawesome/free-solid-svg-icons";
import { parseBpmnElements, createTrees } from "./bpmnParser";

function compareTree(tree1, tree2) {
    let nonMatchingElements = [];
    // Compare the names of the two trees
    if(tree1 !== undefined || tree2 !== undefined){
        if (tree1.name !== tree2.name) {
            nonMatchingElements.push(tree2);
        }
     
        let children1 = tree1.node.children;
        let children2 = tree2.node.children;
        let length = Math.min(children1.length, children2.length);
     
        // Compare the children of the two trees
        for (let i = 0; i < length; i++) {
            let child1 = children1[i];
            let child2 = children2[i];
            if (child1.nodeName !== "bpmn:incoming" && child1.nodeName !== "bpmn:outgoing") {
                if (child1.textContent !== child2.textContent) {
                    if (!nonMatchingElements.includes(child2)) {
                        nonMatchingElements.push(child2);
                    }
                }
            }
        }
     
        let nodeAttributes1 = tree1.node.attributes;
        let nodeAttributes2 = tree2.node.attributes;
        length = Math.min(nodeAttributes1.length, nodeAttributes2.length);
     
        // Compare the attributes of the two trees
        for (let i = 0; i < length; i++) {
            let attr1 = nodeAttributes1[i];
            let attr2 = nodeAttributes2[i];
     
            if ((attr1 !== null && attr2 === null) || (attr1 === null && attr2 !== null)) {
                if (!nonMatchingElements.includes(tree2)) {
                    nonMatchingElements.push(tree2);
                }
            }
     
            if (attr1.name !== "id") {
                if (attr1 !== null && attr2 !== null) {
                    if (attr1.value !== attr2.value) {
                        if (!nonMatchingElements.includes(tree2)) {
                            nonMatchingElements.push(tree2);
                        }
                    }
                }
            }
        }
     
        // Compare the number of children in the two trees
        if (tree1.children.length !== tree2.children.length) {
            if (!nonMatchingElements.includes(tree2)) {
                nonMatchingElements.push(tree2);
            }
        }
     
        // Recursively compare the children of the two trees
        for (let i = 0; i < tree1.children.length; i++) {
            nonMatchingElements.push(...compareTree(tree1.children[i], tree2.children[i]));
        }
     
        return [...new Set(nonMatchingElements)];
    }
}

function compareTrees(trees1, trees2){
    const allNonMatchingElements = [];
    if(trees1.length === trees2.length){
        for(var i = 0; i < trees1.length; i++){
            let nonMatchingElements = compareTree(trees1[i], trees2[i]);
            allNonMatchingElements.push(...nonMatchingElements);
        }
    }   
    return allNonMatchingElements;
}

export function compareBpmnDiagrams2(diagram1, diagram2){
    /*const processes1 = parseBpmnElements("//bpmn:process", diagram1);
    const processes2 = parseBpmnElements("//bpmn:process", diagram2);

    const collaborations1 = parseBpmnElements("//bpmn:collaboration", diagram1);
    const collaborations2 = parseBpmnElements("//bpmn:collaboration", diagram2);

    const trees1 = createTrees(processes1);
    const trees2 = createTrees(processes2);

    let allNonMatchingElements = compareTrees(trees1, trees2);

    for (let element of allNonMatchingElements) {
        console.log("wrong: " + element.name);
    }*/
}