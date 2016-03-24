// Code goes here
function Node(data) {
  this.data = data;
  this.parent = null;
  this.children = [];
}

function BinaryTree(data) {
  var node = new Node(data);
  this.root = node;
  return this.root;
}


var all = [];

function buildTree(level) {
  var rootElement = document.querySelector(".root");
  var root = BinaryTree(rootElement);
  all.push(root);
  var queue = [];
  queue.push(root);
  for (var i = 1; i < level; i++) {
    var p = queue.shift();
    var n = Math.pow(2, i);
    while (n > 0) {
      if (p.children.length === 2) {
        p = queue.shift();
      }
      var newElement = document.createElement("div");
      var height = "height:" + (p.data.clientHeight - 50) + 'px;';
      var width = "width:" + (p.data.clientWidth - 50) / 2 + 'px;';
      var padding = "margin: 10px;";
      var style = height + width + padding + "border-style:solid;border-width:1px;display:flex;align-items:center;"
      newElement.style = style;
      var newNode = new Node(newElement);
      all.push(newNode);
      queue.push(newNode);
      p.children.push(newNode);
      p.data.appendChild(newElement);
      newNode.parent = p;
      n--;
    }
  }
  return root;
}


function colorNode(node) {
  all.forEach(function(item) {
    if (item === node) {
      item.data.style.backgroundColor = 'red';
    } else {
      item.data.style.backgroundColor = '';
    }
  });
}

function visit(node) {
  setTimeout(function() {
    colorNode(node);
  }, (i++) * 1000);
}

// pre
function preOrder(node) {
  if (node !== undefined) {
    visit(node);
    if (node.children[0] !== undefined) preOrder(node.children[0]);
    if (node.children[1] !== undefined) preOrder(node.children[1]);
  }
}

// mid 
function midOrder(node) {
  if (node !== undefined) {
    if (node.children[0] !== undefined) midOrder(node.children[0]);
    visit(node);
    if (node.children[1] !== undefined) midOrder(node.children[1]);
  }
}

// post 
function postOrder(node) {
  if (node !== undefined) {
    if (node.children[0] !== undefined) postOrder(node.children[0]);
    if (node.children[1] !== undefined) postOrder(node.children[1]);
    visit(node);
  }
}

var i = 1;
var level = 4;
var root = buildTree(level);
var preOrderButton = document.querySelector("#preOrder");
var midOrderButton = document.querySelector("#midOrder");
var postOrderButton = document.querySelector("#postOrder");
preOrderButton.onclick = function() {
  i = 1;
  colorNode(null);
  preOrder(root);
}
midOrderButton.onclick = function() {
  i = 1;
  colorNode(null);
  midOrder(root);
}
postOrderButton.onclick = function() {
  i = 1;
  colorNode(null);
  postOrder(root);
}