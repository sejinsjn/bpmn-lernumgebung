export function parseAndStoreBpmnProcessElements(xmlString) {
   const sequenceFlows = new Map();
   const bpmnElements = new Map();
   const parser = new DOMParser();
   const xmlDoc = parser.parseFromString(xmlString, "text/xml");
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
      }else{
         bpmnElements.set(children[i].getAttribute("id"), children[i]);
      }
   }

   return [children[0], bpmnElements, sequenceFlows];
}

export function createTree(rootNode, bpmnElements, sequenceFlows, visited = new Set()) {
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
 
   const outgoingFlows = Array.from(root.getElementsByTagName("bpmn:outgoing"));
   outgoingFlows.forEach((flow) => {
     const flowId = flow.textContent;
     const targetId = sequenceFlows.get(flowId).getAttribute("targetRef");
     const subtree = createTree(bpmnElements.get(targetId), bpmnElements, sequenceFlows, visited);
     if (subtree) {
       tree.children.push(subtree);
     }
   });
 
   visited.delete(rootNode.getAttribute("id"));
 
   return tree;
 }
 
export function compareTrees(tree1, tree2) {
   if (tree1.name !== tree2.name) {
     return false;
   }
   
   if((!tree1.node.hasAttribute("name") && tree2.node.hasAttribute("name")) || (tree1.node.hasAttribute("name") && !tree2.node.hasAttribute("name"))){
      return false;
   }

   if(tree1.node.hasAttribute("name") && tree2.node.hasAttribute("name")){
      if (tree1.node.getAttribute("name").toLowerCase() !== tree2.node.getAttribute("name").toLowerCase()) {
         return false;
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
 