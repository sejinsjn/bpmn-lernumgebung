import { parseBpmnElements, createTrees } from "./bpmnParser";

function compareTrees(tree1, tree2) {
    if (tree1.name !== tree2.name) {
       return false;
    }
 
    let children1 = tree1.node.children;
    let children2 = tree2.node.children;
    let length = Math.min(children1.length, children2.length);
 
    for (let i = 0; i < length; i++) {
       let child1 = children1[i];
       let child2 = children2[i];
       if (child1.nodeName !== "bpmn:incoming" && child1.nodeName !== "bpmn:outgoing") {
          if (child1.textContent !== child2.textContent) {
             return false;
          }
       }
    }
 
    let nodeAttributes1 = tree1.node.attributes;
    let nodeAttributes2 = tree2.node.attributes;
    length = Math.min(nodeAttributes1.length, nodeAttributes2.length);
 
    for (let i = 0; i < length; i++) {
       let attr1 = nodeAttributes1[i];
       let attr2 = nodeAttributes2[i];
 
       if ((attr1 !== null && attr2 === null) || (attr1 === null && attr2 !== null)) {
          return false;
       }
 
       if (attr1.name !== "id") {
          if (attr1 !== null && attr2 !== null) {
             if (attr1.value !== attr2.value) {
                return false;
             }
          }
       }
    }
 
    if (tree1.children.length !== tree2.children.length) {
       return false;
    }
 
    for (let i = 0; i < tree1.children.length; i++) {
       if (!compareTrees(tree1.children[i], tree2.children[i])) {
          return false;
       }
    }
 
    return true;
 }
 
 function compareParticipants(participants1, participants2) {
    if(participants1 === undefined || participants2 === undefined || participants1.length !== participants2.length){
        if(participants1 === undefined && participants2 === undefined){
            return true;
        }
        return false;
    }
    for(var j = 0; j < participants1.length; j++){
       const attributes1 = participants1[j].attributes;
       const attributes2 = participants2[j].attributes;
       
       for (let i = 0; i < attributes1.length; i++) {
          const attrName = attributes1[i].name;
          if ((attrName !== "id" || attrName !== "processRef") && participants1[j].getAttribute(attrName) !== participants2[j].getAttribute(attrName)) {
             return false;
          }
       }
    }
    
    return true;
 }

function compareMessageFlows(bpmnElements1, messageFlows1, bpmnElements2, messageFlows2){
    if(messageFlows1 === undefined || messageFlows2 === undefined || messageFlows1.length !== messageFlows2.length){
        if(messageFlows1 === undefined && messageFlows2 === undefined){
            return true;
        }
        return false;
    }

    for(var j = 0; j < messageFlows1.length; j++){
        const attributes1 = messageFlows1[j].attributes;
        const attributes2 = messageFlows2[j].attributes;

        
        for (let i = 0; i < attributes1.length; i++) {
            const attrValue1 = attributes1[i].value;
            const attrValue2 = attributes2[i].value;
            if (attributes1[i].name !== "id" && bpmnElements1.get(attrValue1).getAttribute("name") !== bpmnElements2.get(attrValue2).getAttribute("name")) {
                return false;
            }
        }
    }

    return true;
}

function compareLanes(bpmnElements1, laneSets1, bpmnElements2, laneSets2){
    if(laneSets1 === undefined || laneSets2 === undefined || laneSets1.length !== laneSets2.length){
        if(laneSets1 === undefined && laneSets2 === undefined){
            return true;
        }
        return false;
    }

    for(var j = 0; j < laneSets1.length; j++){
        let children1 = laneSets1[j].children;
        let children2 = laneSets2[j].children;

        if(children1.length !== children2.length){
            return false;
        }

        for(var i = 0; i < children1.length; i++){
            const laneAttributes1 = children1[i].attributes;
            const laneAttributes2 = children2[i].attributes;

            if(laneAttributes1.length !== laneAttributes2.length){
                return false;
            }
            
            for (let i = 0; i < laneAttributes1.length; i++) {
                const attrValue1 = laneAttributes1[i].value;
                const attrValue2 = laneAttributes2[i].value;

                if (laneAttributes1[i].name !== "id" && attrValue1 !== attrValue2) {
                    return false;
                }
            }

            const flowNodeRefs1 = Array.from(children1[i].getElementsByTagName("bpmn:flowNodeRef"));
            const flowNodeRefs2 = Array.from(children2[i].getElementsByTagName("bpmn:flowNodeRef"));

            if(flowNodeRefs1.length !== flowNodeRefs2.length){
                return false;
            }

            for(var a = 0; a < flowNodeRefs1.length; a++){
                const attributes1 = bpmnElements1.get(flowNodeRefs1[a].textContent).attributes;
                const attributes2 = bpmnElements2.get(flowNodeRefs2[a].textContent).attributes;
                
                for (let i = 0; i < attributes1.length; i++) {
                    const attrValue1 = attributes1[i].value;
                    const attrValue2 = attributes2[i].value;
                    console.log(attrValue1 + " " + attrValue2);
                    if (attributes1[i].name !== "id" && attrValue1 !== attrValue2) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}
 
function findMissingElements(trees, bpmnElements) {
    const missingElements = [];
    const treeElements = new Set();
    const visited = new Set();
  
    function dfs(treeNode) {
      const bpmnElement = treeNode.node;
      treeElements.add(bpmnElement.getAttribute("id"));
      visited.add(treeNode);
      for (const child of treeNode.children) {
        if (!visited.has(child)) {
          dfs(child);
        }
      }
    }
  
    for (let i = 0; i < trees.length; i++) {
      dfs(trees[i]);
    }
  
    for (const [id, element] of bpmnElements) {
      if (!treeElements.has(id)) {
        missingElements.push(element);
      }
    }
  
    return missingElements;
  }

export function compareBpmnDiagrams(diagram1, diagram2){
    const processes1 = parseBpmnElements("//bpmn:process", diagram1);
    const processes2 = parseBpmnElements("//bpmn:process", diagram2);

    const collaborations1 = parseBpmnElements("//bpmn:collaboration", diagram1);
    const collaborations2 = parseBpmnElements("//bpmn:collaboration", diagram2);

    const trees1 = createTrees(processes1);
    const trees2 = createTrees(processes2);

    for(var i = 0; i < processes1[0].length; i++){
        for(var j = 0; j < trees1.length; j++){
            if(compareTrees(trees1[j], trees2[j])){
                let missingElements = findMissingElements(trees2, processes2[1])
                if(missingElements.length !== 0){
                    return "Das Diagramm besitzt unerreichbare Element. Überprüfe dein Diagram nochmal.";
                }
                console.log(processes2[3]);
                if(!compareLanes(processes1[1], processes1[3], processes2[1], processes2[3])){
                    return "Bitte überprüfen Sie Ihre Lanes im Diagram!";
                }
                continue;
            }else{
                return "Die beiden Diagramme sind nicht gleich!";
            }
        }

        if(!compareParticipants(collaborations1[0], collaborations2[0])){
           return "Die Akteure sind nicht richtig!";
        }
        if(!compareMessageFlows(processes1[1], collaborations1[1], processes2[1], collaborations2[1])){
            return "Die MessageFlows stimmen nicht! Überprüfe diese nochmal!";
        }
    }
    return "Die beiden Diagramme sind gleich!";
}