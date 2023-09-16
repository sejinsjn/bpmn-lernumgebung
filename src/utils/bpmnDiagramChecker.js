function compareTree(tree1, tree2) {
    let mismatches = [];
    let nextMatchingElement = null;

    if (tree1.name !== tree2.name || tree1.children.length !== tree2.children.length) {
       return mismatches;
    }

    let nodeAttributes1 = Object.fromEntries(Array.from(tree1.node.attributes).map(attr => [attr.name, attr.value]));
    let nodeAttributes2 = Object.fromEntries(Array.from(tree2.node.attributes).map(attr => [attr.name, attr.value]));

    for (let attr in nodeAttributes1) {
        if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
            nextMatchingElement = findNextMatchingElement(tree2.node, tree1.children);
            if(nextMatchingElement === null){
                mismatches.push(tree1);
                break;
            }else{
                console.log(nextMatchingElement.node);
                mismatches.push(tree1);
                let children1 = nextMatchingElement.node.children;
                let children2 = tree2.node.children;

                if(children1.length !== 0 && children2.length !== 0){
                    for (let i = 0; i < nextMatchingElement.children.length; i++) {
                        mismatches.push(...compareTree(nextMatchingElement.children[i], tree2.children[i]));
                    }
                }
                break;
            }
        }
    }

    if(nextMatchingElement === null){
        let children1 = tree1.node.children;
        let children2 = tree2.node.children;
    
        if(children1.length !== 0 && children2.length !== 0){
            for (let i = 0; i < tree1.children.length; i++) {
                mismatches.push(...compareTree(tree1.children[i], tree2.children[i]));
            }
        }
    }
    return mismatches;
}

function findNextMatchingElement(node, children) {
    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName !== "bpmn:incoming" && children[i].nodeName !== "bpmn:outgoing") {
            let nodeAttributes1 = Object.fromEntries(Array.from(node.attributes).map(attr => [attr.name, attr.value]));
            let nodeAttributes2 = Object.fromEntries(Array.from(children[i].node.attributes).map(attr => [attr.name, attr.value]));

            let isMatch = true;
            for (let attr in nodeAttributes1) {
                if (attr !== "id" && nodeAttributes1[attr] !== nodeAttributes2[attr]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return children[i];
            } else if (children[i].children.length > 0) {
                let matchingChild = findNextMatchingElement(node, children[i].children);
                if (matchingChild) {
                    return matchingChild;
                }
            }
        }
    }

    return null; // Return null if no matching element is found
}


 
function treeToArray(tree){
   let treeArray = [];

   treeArray.push(tree);
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
    if(trees1.length === trees2.length){
        for(var i = 0; i < trees1.length; i++){
            let nonMatchingElements = compareTree(trees1[i], trees2[i]);
            allNonMatchingElements.push(...nonMatchingElements);
        }
    }else{
      allNonMatchingElements.push(...treesToArray(trees1));
    }
    return allNonMatchingElements;
}

export function compareBpmnDiagrams2(diagram1, diagram2){
    return compareTrees(diagram1.trees, diagram2.trees);
}