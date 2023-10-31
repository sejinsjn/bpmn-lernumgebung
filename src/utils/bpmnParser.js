function parseBpmnElements(parentElementName, xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const nsResolver = (prefix) => {
       const ns = {
          bpmn: "http://www.omg.org/spec/BPMN/20100524/MODEL",
       };
       return ns[prefix] || null;
    };
 
    const xpathResult = xmlDoc.evaluate(
       parentElementName,
       xmlDoc,
       nsResolver,
       XPathResult.ANY_TYPE,
       null
    );
 
    if(parentElementName === "//bpmn:process"){
        return parseProcessElements(xpathResult);
    }

    if(parentElementName === "//bpmn:collaboration"){
        return parseCollaborationElements(xpathResult);
    }
 
    return null;
}

function parseProcessElements(xpathResult){
    let node = xpathResult.iterateNext();
    var startEvents = [];
    const bpmnElements = new Map();
    const sequenceFlows = new Map();
    const laneSets = [];
    const subProcesses = [];
    const bpmnElementsArray = [];


    while(node){
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
         switch(children[i].nodeName){
            case "bpmn:startEvent":
               startEvents.push(children[i]);
               bpmnElementsArray.push(children[i]);
               bpmnElements.set(children[i].getAttribute("id"), children[i]);
               break;
            case "bpmn:sequenceFlow":
               sequenceFlows.set(children[i].getAttribute("id"), children[i]);
               break;
            case "bpmn:laneSet":
               laneSets.push(children[i]);
               break;
            case "bpmn:subProcess":
               bpmnElementsArray.push(children[i]);
               subProcesses.push(children[i]);
               bpmnElements.set(children[i].getAttribute("id"), children[i]);
               break;
            default:
               bpmnElementsArray.push(children[i]);
               bpmnElements.set(children[i].getAttribute("id"), children[i]);
               break;
         }
        }
        node = xpathResult.iterateNext();
     }
     
     const processes = {
         startEvents: startEvents,
         bpmnElements: bpmnElements,
         sequenceFlows: sequenceFlows,
         laneSets: laneSets,
         subProcesses: subProcesses,
         bpmnElementsArray: bpmnElementsArray
     }

     return processes;
 }

function parseCollaborationElements(xpathResult) {
    let node = xpathResult.iterateNext();
    const messageFlows = [];
    const participants = [];
 
    while(node){
       const children = node.children;
       for (let i = 0; i < children.length; i++) {
          if(children[i].nodeName === "bpmn:messageFlow"){
             messageFlows.push(children[i]);
          }
          if(children[i].nodeName === "bpmn:participant"){
             participants.push(children[i]);
          }
       }
       node = xpathResult.iterateNext();
    }

    const collaborations = {
      participants: participants,
      messageFlows: messageFlows
    }

    return collaborations;
 }

 function createTree(rootNode, bpmnElements, sequenceFlows, visited = new Set()) {
    if (visited.has(rootNode.getAttribute("id"))) {
      // Cycle detected
      return null;
    }

    const tree = {
      node: rootNode,
      name: rootNode.nodeName,
      children: []
    };
  
    visited.add(rootNode.getAttribute("id"));
    if(rootNode !== undefined){
        const outgoingFlows = Array.from(rootNode.getElementsByTagName("bpmn:outgoing"));
        outgoingFlows.forEach((flow) => {
                const flowId = flow.textContent;
                const targetId = sequenceFlows.get(flowId).getAttribute("targetRef");
                const subtree = createTree(bpmnElements.get(targetId), bpmnElements, sequenceFlows, visited);
                if (subtree) {
                    tree.children.push(subtree);
                }
        });
    }
 
    visited.delete(rootNode.getAttribute("id"));
    return tree;
  }

function createTrees(processes){
    let trees = [];
    for(let i = 0; i < processes.startEvents.length; i++){
        trees.push(createTree(processes.startEvents[i], processes.bpmnElements, processes.sequenceFlows));
    }

    return trees;
}

export function parseBpmnDiagram(diagram){
   // processes object contain 4 arrays with StartEvents, BpmnElements, Flows, LaneSets
   const processes = parseBpmnElements("//bpmn:process", diagram);
   // collaborations object contains 2 Arrays with participants and messageFlows
   const collaborations = parseBpmnElements("//bpmn:collaboration", diagram);
   // creates trees from all processes in the object
   const trees = createTrees(processes);

   const bpmnDiagram = {
      processes: processes,
      collaborations: collaborations,
      trees: trees
   }

   return bpmnDiagram;
}