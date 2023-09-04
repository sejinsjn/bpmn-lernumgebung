import { faIgloo } from "@fortawesome/free-solid-svg-icons";
import { parseBpmnElements, createTrees } from "./bpmnParser";

function compareTree(tree1, tree2) {
    let mismatches = [];

    if (tree1.name !== tree2.name || tree1.children.length !== tree2.children.length) {
       mismatches.push(tree1);
       return mismatches;
    }

    let children1 = tree1.node.children;
    let children2 = tree2.node.children;

    for (let i = 0; i < children1.length; i++) {
       let child1 = children1[i];
       let child2 = children2[i];
       if (child1.nodeName !== "bpmn:incoming" && child1.nodeName !== "bpmn:outgoing" && child1.textContent !== child2.textContent) {
          mismatches.push(child1);
       }
    }

    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    for (let attr in nodeAttributes1) {
       if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
          mismatches.push(tree1);
          break;
       }
    }

    for (let i = 0; i < tree1.children.length; i++) {
       mismatches.push(...compareTree(tree1.children[i], tree2.children[i]));
    }
    
    return mismatches;
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
    return compareTrees(diagram1.trees, diagram2.trees);
}