export function parseBpmnElements(parentElementName, xmlString) {
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

    while(node){
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
           if(children[i].nodeName === "bpmn:startEvent"){
              startEvents.push(children[i]);
           }
           if(children[i].nodeName === "bpmn:sequenceFlow"){
              sequenceFlows.set(children[i].getAttribute("id"), children[i]);
           }else{
              if(children[i].nodeName === "bpmn:laneSet"){
                laneSets.push(children[i]);
              }else{
                bpmnElements.set(children[i].getAttribute("id"), children[i]);
              }
           }
  
        }
        node = xpathResult.iterateNext();
     }
  
     return [startEvents, bpmnElements, sequenceFlows, laneSets];
 }

function parseCollaborationElements(xpathResult) {
    let node = xpathResult.iterateNext();
    var collaborations = [];
 
    while(node){
       var collaboration = null;
       const messageFlows = [];
       const participants = [];
 
       const children = node.children;
       for (let i = 0; i < children.length; i++) {
          if(children[i].nodeName === "bpmn:messageFlow"){
             messageFlows.push(children[i]);
          }
          if(children[i].nodeName === "bpmn:participant"){
             participants.push(children[i]);
          }
       }
 
       collaboration = [participants, messageFlows];
       collaborations.push(collaboration);
 
       node = xpathResult.iterateNext();
    }
    return collaborations;
 }

 function createTree(rootNode, bpmnElements, sequenceFlows, visited = new Set()) {
    if (visited.has(rootNode.getAttribute("id"))) {
      // Cycle detected
      return null;
    }
  
    const root = bpmnElements.get(rootNode.getAttribute("id"));
    const tree = {
      node: rootNode,
      name: rootNode.nodeName,
      children: []
    };
  
    visited.add(rootNode.getAttribute("id"));
    if(root !== undefined){
        const outgoingFlows = Array.from(root.getElementsByTagName("bpmn:outgoing"));
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

export function createTrees(processes){
    let trees = [];
    for(let i = 0; i < processes[0].length; i++){
        trees.push(createTree(processes[0][i], processes[1], processes[2]));
    }

    return trees;
}