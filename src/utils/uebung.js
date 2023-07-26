//parse MessageFlows, Participants and Lanes
//create for every process a tree
//check what kind of start event, intermediatecatch event
export function parseAndStoreBpmnProcessElements(xmlString) {
   var processes = [];
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

   while(node){
      var process = null;
      var startEvent = null;
      const sequenceFlows = new Map();
      const bpmnElements = new Map();

      const children = node.children;
      console.log(children);
      for (let i = 0; i < children.length; i++) {
         if(children[i].nodeName === "bpmn:startEvent"){
            startEvent = children[i];
         }
         if(children[i].nodeName === "bpmn:sequenceFlow"){
            sequenceFlows.set(children[i].getAttribute("id"), children[i]);
         }else{
            if(children[i].nodeName !== "bpmn:laneSet"){
               console.log(children[i]);
               bpmnElements.set(children[i].getAttribute("id"), children[i]);
            }
         }

      }

      process = [startEvent, bpmnElements, sequenceFlows];
      processes.push(process);

      node = xpathResult.iterateNext();
   }

   return processes;
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

export function compareProcesses(processes1, processes2){
   for(var i = 0; i < processes1.length; i++){
      var maps = processes1[i];
      var maps2 = processes2[i];

      var tree = createTree(maps[0], maps[1], maps[2]);
      var tree2 = createTree(maps2[0], maps2[1], maps2[2]);

      console.log(tree);
      console.log(tree2);

      if(compareTrees(tree, tree2)){
          if(findMissingElements(tree2, maps2[1]).length !== 0){
              return "Das Diagramm besitzt unerreichbare Element. Überprüfe dein Diagram nochmal.";
          }
      }else{
         return "Die beiden Diagramme sind nicht gleich!";
      }
  }
  return "Die beiden Diagramme sind gleich!";
}

export function findMissingElements(tree, bpmnElements) {
   const missingElements = [];
   const treeElements = new Set();

   function dfs(treeNode) {
      const bpmnElement = treeNode.node;
      treeElements.add(bpmnElement.getAttribute("id"));
      for (const child of treeNode.children) {
         dfs(child);
      }
   }

   dfs(tree);

   for (const [id, element] of bpmnElements) {
      if (!treeElements.has(id)) {
         missingElements.push(element);
      }
   }
   
   return missingElements;
 }

 