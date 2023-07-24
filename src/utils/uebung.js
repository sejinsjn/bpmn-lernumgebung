const sequenceFlows = new Map();
const bpmnElements = new Map();

export function parseAndStoreBpmnProcessElements(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    console.log(xmlDoc);
    const nsResolver = (prefix) => {
        const ns = {
          bpmn: "http://www.omg.org/spec/BPMN/20100524/MODEL",
        };
        return ns[prefix] || null;
      };

    const xpathResult = xmlDoc.evaluate(
        "//bpmn:process",
        xmlDoc,
        nsResolver,
        XPathResult.ANY_TYPE,
        null
    );

    let node = xpathResult.iterateNext();
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        if(children[i].nodeName === "bpmn:sequenceFlow"){
            sequenceFlows.set(children[i].getAttribute("id"), children[i]);
            console.log("SequenceFlow: " + children[i].nodeName);
        }else{
            bpmnElements.set(children[i].getAttribute("id"), children[i]);
            console.log("BPMNElements: " + children[i].nodeName);
        }
    }

    console.log(createTree(children[0]));
}

function createTree(rootNode, visited = new Set()) {
   if (visited.has(rootNode.getAttribute("id"))) {
     // Cycle detected
     return null;
   }
 
   const root = bpmnElements.get(rootNode.getAttribute("id"));
   const tree = {
     node: rootNode,
     children: []
   };
 
   visited.add(rootNode.getAttribute("id"));
 
   const outgoingFlows = Array.from(root.getElementsByTagName("bpmn:outgoing"));
   outgoingFlows.forEach((flow) => {
     const flowId = flow.textContent;
     const targetId = sequenceFlows.get(flowId).getAttribute("targetRef");
     const subtree = createTree(bpmnElements.get(targetId), visited);
     if (subtree) {
       tree.children.push(subtree);
     }
   });
 
   visited.delete(rootNode.getAttribute("id"));
 
   return tree;
 }
 