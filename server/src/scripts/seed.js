const mongoose = require("mongoose");
const { getEnv } = require("../config/env");
const Planet = require("../models/Planet");
const Topic = require("../models/Topic");

async function seed() {
  const { MONGO_URI } = getEnv({ requireJwt: false });
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI, { autoIndex: true });

  const planetCount = await Planet.countDocuments();
  if (planetCount > 0) {
    // eslint-disable-next-line no-console
    console.log("Planets already seeded; skipping planet creation.");
  } else {
    const planets = await Planet.insertMany([
      { name: "Data Structures & Algorithms", slug: "dsa", description: "Core algorithms, data structures, and visual learning.", order: 1, themeColor: "#60a5fa" },
      { name: "Frontend", slug: "frontend", description: "HTML/CSS/JS and modern React UI patterns.", order: 2, themeColor: "#34d399" },
      { name: "Backend", slug: "backend", description: "Node/Express fundamentals and API design.", order: 3, themeColor: "#fbbf24" },
      { name: "Database", slug: "database", description: "MongoDB modeling, querying, and indexing.", order: 4, themeColor: "#f472b6" },
    ]);
  }

  const planets = await Planet.find({});
  const planetBySlug = new Map(planets.map((p) => [p.slug, p]));

  // Check if topics already exist
  const topicCount = await Topic.countDocuments();
  if (topicCount > 0) {
    // eslint-disable-next-line no-console
    console.log("Topics already seeded; skipping topic creation.");
    await mongoose.disconnect();
    return;
  }

  const topics = [
    // DSA - Sorting (expanded)
    {
      title: "Bubble Sort (Step-by-Step)",
      description: "Visualize adjacent comparisons and swaps; learn stable sorting behavior.",
      difficulty: "Easy",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.\\n\\nKey ideas:\\n- Each pass bubbles the largest remaining element to the end\\n- The `swapped` flag allows early termination",
      code:
        "function bubbleSort(arr) {\n" +
        "  const a = arr.slice();\n" +
        "  for (let i = 0; i < a.length - 1; i++) {\n" +
        "    let swapped = false;\n" +
        "    for (let j = 0; j < a.length - 1 - i; j++) {\n" +
        "      if (a[j] > a[j + 1]) {\n" +
        "        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n" +
        "        swapped = true;\n" +
        "      }\n" +
        "    }\n" +
        "    if (!swapped) break;\n" +
        "  }\n" +
        "  return a;\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "bubble" } },
      quiz: [
        {
          question: "In bubble sort, what does the first pass guarantee?",
          options: ["Smallest goes to start", "Largest bubbles to the end", "Array becomes fully sorted", "No changes occur"],
          answerIndex: 1,
          explanation: "Each outer pass moves the current largest element to its correct position at the end.",
        },
      ],
    },
    {
      title: "Selection Sort (Minimum Selection)",
      description: "Find minimum element repeatedly and place it at the beginning of unsorted portion.",
      difficulty: "Easy",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Selection sort divides array into sorted and unsorted regions. Each pass finds the minimum in unsorted region and swaps it with first unsorted element.\\n\\nTime complexity: O(n²) always\\nSpace complexity: O(1)\\nNot stable but simple to implement.",
      code:
        "function selectionSort(arr) {\n" +
        "  const a = arr.slice();\n" +
        "  for (let i = 0; i < a.length - 1; i++) {\n" +
        "    let minIdx = i;\n" +
        "    for (let j = i + 1; j < a.length; j++) {\n" +
        "      if (a[j] < a[minIdx]) minIdx = j;\n" +
        "    }\n" +
        "    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];\n" +
        "  }\n" +
        "  return a;\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "selection" } },
      quiz: [
        {
          question: "How many swaps does selection sort perform in worst case?",
          options: ["O(n)", "O(n²)", "O(n log n)", "Exactly n-1"],
          answerIndex: 3,
          explanation: "Selection sort performs exactly n-1 swaps in the worst case.",
        },
      ],
    },
    {
      title: "Insertion Sort (Building Sorted Array)",
      description: "Build sorted array one element at a time by inserting into correct position.",
      difficulty: "Easy",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Insertion sort maintains a sorted subarray and inserts each new element into its correct position within it.\\n\\nBest case: O(n) when array is already sorted\\nWorst case: O(n²)\\nStable and adaptive algorithm.",
      code:
        "function insertionSort(arr) {\n" +
        "  const a = arr.slice();\n" +
        "  for (let i = 1; i < a.length; i++) {\n" +
        "    const key = a[i];\n" +
        "    let j = i - 1;\n" +
        "    while (j >= 0 && a[j] > key) {\n" +
        "      a[j + 1] = a[j];\n" +
        "      j--;\n" +
        "    }\n" +
        "    a[j + 1] = key;\n" +
        "  }\n" +
        "  return a;\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "insertion" } },
      quiz: [
        {
          question: "When is insertion sort most efficient?",
          options: ["Random data", "Nearly sorted data", "Reverse sorted data", "Large datasets"],
          answerIndex: 1,
          explanation: "Insertion sort performs well on nearly sorted arrays with O(n) time complexity.",
        },
      ],
    },
    {
      title: "Merge Sort (Divide & Conquer)",
      description: "Understand recursion, splitting, and merging two sorted halves.",
      difficulty: "Medium",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Merge sort divides the array into halves until single elements remain, then merges sorted halves back together.\\n\\nProperties:\\n- Time: O(n log n)\\n- Stable if implemented carefully\\n- Requires extra space for merging",
      code:
        "function mergeSort(arr) {\n" +
        "  if (arr.length <= 1) return arr.slice();\n" +
        "  const mid = Math.floor(arr.length / 2);\n" +
        "  const left = mergeSort(arr.slice(0, mid));\n" +
        "  const right = mergeSort(arr.slice(mid));\n" +
        "  return merge(left, right);\n" +
        "}\n" +
        "function merge(left, right) {\n" +
        "  const result = [];\n" +
        "  let i = 0, j = 0;\n" +
        "  while (i < left.length && j < right.length) {\n" +
        "    if (left[i] <= right[j]) result.push(left[i++]);\n" +
        "    else result.push(right[j++]);\n" +
        "  }\n" +
        "  while (i < left.length) result.push(left[i++]);\n" +
        "  while (j < right.length) result.push(right[j++]);\n" +
        "  return result;\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "merge" } },
      quiz: [
        {
          question: "Merge sort splits until what size subarrays?",
          options: ["Size 2", "Size 1", "Size 0", "Any size"],
          answerIndex: 1,
          explanation: "Base case is arrays of length 1 (already sorted).",
        },
      ],
    },
    {
      title: "Quick Sort (Pivot Partitioning)",
      description: "Learn partitioning around a pivot and recursive sorting of partitions.",
      difficulty: "Medium",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Quick sort selects a pivot, partitions elements so that those smaller than pivot go left and larger go right, then recursively sorts partitions.\\n\\nAverage-case complexity is O(n log n). Worst-case is O(n^2) with bad pivots.",
      code:
        "function quickSort(arr) {\n" +
        "  if (arr.length <= 1) return arr.slice();\n" +
        "  const pivot = arr[arr.length - 1];\n" +
        "  const left = [];\n" +
        "  const right = [];\n" +
        "  for (let i = 0; i < arr.length - 1; i++) {\n" +
        "    if (arr[i] < pivot) left.push(arr[i]);\n" +
        "    else right.push(arr[i]);\n" +
        "  }\n" +
        "  return [...quickSort(left), pivot, ...quickSort(right)];\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "quick" } },
      quiz: [
        {
          question: "Which value is used as pivot in the given implementation?",
          options: ["First element", "Last element", "Median element", "Random element only"],
          answerIndex: 1,
          explanation: "The implementation sets pivot to the last element.",
        },
      ],
    },
    {
      title: "Heap Sort (Priority Queue Based)",
      description: "Build a max-heap and repeatedly extract maximum elements.",
      difficulty: "Hard",
      category: "Sorting",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Heap sort uses a binary heap data structure. First build a max-heap, then repeatedly swap root with last element and heapify.\\n\\nTime: O(n log n)\\nSpace: O(1) auxiliary\\nNot stable but in-place.",
      code:
        "function heapSort(arr) {\n" +
        "  const a = arr.slice();\n" +
        "  \n" +
        "  // Build max heap\n" +
        "  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {\n" +
        "    heapify(a, a.length, i);\n" +
        "  }\n" +
        "  \n" +
        "  // Extract elements\n" +
        "  for (let i = a.length - 1; i > 0; i--) {\n" +
        "    [a[0], a[i]] = [a[i], a[0]];\n" +
        "    heapify(a, i, 0);\n" +
        "  }\n" +
        "  return a;\n" +
        "}\n" +
        "function heapify(arr, n, i) {\n" +
        "  let largest = i;\n" +
        "  const left = 2 * i + 1;\n" +
        "  const right = 2 * i + 2;\n" +
        "  \n" +
        "  if (left < n && arr[left] > arr[largest]) largest = left;\n" +
        "  if (right < n && arr[right] > arr[largest]) largest = right;\n" +
        "  \n" +
        "  if (largest !== i) {\n" +
        "    [arr[i], arr[largest]] = [arr[largest], arr[i]];\n" +
        "    heapify(arr, n, largest);\n" +
        "  }\n" +
        "}",
      visualization: { type: "sorting", config: { algorithm: "heap" } },
      quiz: [
        {
          question: "What is the space complexity of heap sort?",
          options: ["O(n)", "O(log n)", "O(1) auxiliary", "O(n log n)"],
          answerIndex: 2,
          explanation: "Heap sort is an in-place sorting algorithm using O(1) auxiliary space.",
        },
      ],
    },

    // DSA - Trees (expanded)
    {
      title: "Binary Search Tree (BST) Insertion",
      description: "Visualize how nodes are inserted based on ordering rules.",
      difficulty: "Medium",
      category: "Trees",
      planet: planetBySlug.get("dsa")._id,
      content:
        "In a BST, left children are smaller and right children are larger (or equal depending on policy).\\n\\nInsertion rule:\\n- Start at root\\n- Compare value\\n- Go left if smaller, right if larger\\n- Repeat until null position is found.",
      code:
        "class TreeNode {\n" +
        "  constructor(val) { this.val = val; this.left = null; this.right = null; }\n" +
        "}\n" +
        "function insertBST(root, val) {\n" +
        "  if (!root) return new TreeNode(val);\n" +
        "  if (val < root.val) root.left = insertBST(root.left, val);\n" +
        "  else root.right = insertBST(root.right, val);\n" +
        "  return root;\n" +
        "}",
      visualization: { type: "tree", config: { algorithm: "bst_insert" } },
      quiz: [
        {
          question: "In a BST, where do values smaller than the current node go?",
          options: ["Right subtree", "Left subtree", "Always root", "Ignored"],
          answerIndex: 1,
          explanation: "Smaller values go to the left subtree.",
        },
      ],
    },
    {
      title: "BST Search & Deletion",
      description: "Learn how to find nodes and remove them while maintaining BST properties.",
      difficulty: "Medium",
      category: "Trees",
      planet: planetBySlug.get("dsa")._id,
      content:
        "BST search follows the same comparison rules as insertion. Deletion is more complex:\\n- Leaf node: simply remove\\n- One child: replace with child\\n- Two children: replace with inorder successor\\n\\nSearch time: O(h) where h is tree height.",
      code:
        "function searchBST(root, val) {\n" +
        "  if (!root || root.val === val) return root;\n" +
        "  return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val);\n" +
        "}\n" +
        "function deleteNode(root, key) {\n" +
        "  if (!root) return null;\n" +
        "  if (key < root.val) {\n" +
        "    root.left = deleteNode(root.left, key);\n" +
        "  } else if (key > root.val) {\n" +
        "    root.right = deleteNode(root.right, key);\n" +
        "  } else {\n" +
        "    if (!root.left) return root.right;\n" +
        "    if (!root.right) return root.left;\n" +
        "    const successor = findMin(root.right);\n" +
        "    root.val = successor.val;\n" +
        "    root.right = deleteNode(root.right, successor.val);\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function findMin(node) {\n" +
        "  while (node.left) node = node.left;\n" +
        "  return node;\n" +
        "}",
      visualization: { type: "tree", config: { algorithm: "bst_delete" } },
      quiz: [
        {
          question: "When deleting a node with two children, what replaces it?",
          options: ["Left child", "Right child", "Inorder successor", "Parent node"],
          answerIndex: 2,
          explanation: "The inorder successor (smallest value in right subtree) maintains BST ordering.",
        },
      ],
    },
    {
      title: "AVL Trees (Self-Balancing BST)",
      description: "Learn about balanced binary search trees and rotation operations.",
      difficulty: "Hard",
      category: "Trees",
      planet: planetBySlug.get("dsa")._id,
      content:
        "AVL trees maintain balance by ensuring height difference between subtrees is at most 1. Uses rotations:\\n- Left rotation\\n- Right rotation\\n- Left-right rotation\\n- Right-left rotation\\n\\nGuarantees O(log n) operations.",
      code:
        "class AVLNode {\n" +
        "  constructor(val) {\n" +
        "    this.val = val;\n" +
        "    this.left = null;\n" +
        "    this.right = null;\n" +
        "    this.height = 1;\n" +
        "  }\n" +
        "}\n" +
        "function getHeight(node) { return node ? node.height : 0; }\n" +
        "function getBalance(node) {\n" +
        "  return node ? getHeight(node.left) - getHeight(node.right) : 0;\n" +
        "}\n" +
        "function rightRotate(y) {\n" +
        "  const x = y.left;\n" +
        "  const T2 = x.right;\n" +
        "  x.right = y;\n" +
        "  y.left = T2;\n" +
        "  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;\n" +
        "  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;\n" +
        "  return x;\n" +
        "}",
      visualization: { type: "tree", config: { algorithm: "avl_balance" } },
      quiz: [
        {
          question: "What is the maximum height difference allowed in AVL trees?",
          options: ["0", "1", "2", "log n"],
          answerIndex: 1,
          explanation: "AVL trees maintain |height(left) - height(right)| ≤ 1 for every node.",
        },
      ],
    },
    {
      title: "Binary Tree Traversals",
      description: "Master inorder, preorder, postorder, and level-order traversals.",
      difficulty: "Medium",
      category: "Trees",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Tree traversals visit each node exactly once:\\n- Inorder: Left → Root → Right\\n- Preorder: Root → Left → Right\\n- Postorder: Left → Right → Root\\n- Level-order: BFS using queue\\n\\nEach has different use cases and time complexity O(n).",
      code:
        "function inorder(root, result = []) {\n" +
        "  if (root) {\n" +
        "    inorder(root.left, result);\n" +
        "    result.push(root.val);\n" +
        "    inorder(root.right, result);\n" +
        "  }\n" +
        "  return result;\n" +
        "}\n" +
        "function preorder(root, result = []) {\n" +
        "  if (root) {\n" +
        "    result.push(root.val);\n" +
        "    preorder(root.left, result);\n" +
        "    preorder(root.right, result);\n" +
        "  }\n" +
        "  return result;\n" +
        "}\n" +
        "function levelOrder(root) {\n" +
        "  if (!root) return [];\n" +
        "  const result = [];\n" +
        "  const queue = [root];\n" +
        "  while (queue.length) {\n" +
        "    const level = [];\n" +
        "    const size = queue.length;\n" +
        "    for (let i = 0; i < size; i++) {\n" +
        "      const node = queue.shift();\n" +
        "      level.push(node.val);\n" +
        "      if (node.left) queue.push(node.left);\n" +
        "      if (node.right) queue.push(node.right);\n" +
        "    }\n" +
        "    result.push(level);\n" +
        "  }\n" +
        "  return result;\n" +
        "}",
      visualization: { type: "tree", config: { algorithm: "traversals" } },
      quiz: [
        {
          question: "Which traversal gives nodes in sorted order for BST?",
          options: ["Preorder", "Inorder", "Postorder", "Level-order"],
          answerIndex: 1,
          explanation: "Inorder traversal visits BST nodes in ascending sorted order.",
        },
      ],
    },

    // DSA - Graph traversal (expanded)
    {
      title: "Breadth-First Search (BFS)",
      description: "Explore layer by layer using a queue; highlight visitation order.",
      difficulty: "Medium",
      category: "Graph Traversal",
      planet: planetBySlug.get("dsa")._id,
      content:
        "BFS explores nodes in increasing order of distance from the start node. It uses a queue.\\n\\nAlgorithm:\\n1) Enqueue start\\n2) While queue not empty: dequeue, visit, enqueue unvisited neighbors",
      code:
        "function bfs(graph, start) {\n" +
        "  const visited = new Set([start]);\n" +
        "  const queue = [start];\n" +
        "  const order = [];\n" +
        "  while (queue.length) {\n" +
        "    const node = queue.shift();\n" +
        "    order.push(node);\n" +
        "    for (const nei of graph[node] || []) {\n" +
        "      if (!visited.has(nei)) {\n" +
        "        visited.add(nei);\n" +
        "        queue.push(nei);\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return order;\n" +
        "}",
      visualization: { type: "graph", config: { algorithm: "bfs" } },
      quiz: [
        {
          question: "BFS uses which data structure?",
          options: ["Stack (LIFO)", "Queue (FIFO)", "Heap", "Hash map only"],
          answerIndex: 1,
          explanation: "BFS is implemented with a queue to process nodes in FIFO order.",
        },
      ],
    },
    {
      title: "Depth-First Search (DFS)",
      description: "Explore as far as possible before backtracking (stack/recursion).",
      difficulty: "Medium",
      category: "Graph Traversal",
      planet: planetBySlug.get("dsa")._id,
      content:
        "DFS explores one path deeply, then backtracks. It can be implemented with recursion or an explicit stack.\\n\\nAlgorithm (recursive): visit node, mark visited, then DFS neighbors.",
      code:
        "function dfs(graph, start) {\n" +
        "  const visited = new Set();\n" +
        "  const order = [];\n" +
        "  function walk(node) {\n" +
        "    visited.add(node);\n" +
        "    order.push(node);\n" +
        "    for (const nei of graph[node] || []) {\n" +
        "      if (!visited.has(nei)) walk(nei);\n" +
        "    }\n" +
        "  }\n" +
        "  walk(start);\n" +
        "  return order;\n" +
        "}",
      visualization: { type: "graph", config: { algorithm: "dfs" } },
      quiz: [
        {
          question: "DFS can be implemented using recursion; what does recursion primarily provide here?",
          options: ["Parallel execution", "Call stack for backtracking", "Automatic sorting", "Queue behavior"],
          answerIndex: 1,
          explanation: "Recursion uses the call stack to backtrack after exploring neighbors.",
        },
      ],
    },
    {
      title: "Dijkstra's Shortest Path Algorithm",
      description: "Find shortest paths from source to all nodes in weighted graphs.",
      difficulty: "Hard",
      category: "Graph Algorithms",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Dijkstra's algorithm finds shortest paths in graphs with non-negative weights. Uses priority queue to always expand closest unvisited node.\\n\\nTime: O((V+E) log V) with binary heap\\nRequires non-negative edge weights.",
      code:
        "function dijkstra(graph, start) {\n" +
        "  const distances = {};\n" +
        "  const pq = new PriorityQueue();\n" +
        "  \n" +
        "  // Initialize distances\n" +
        "  for (const node in graph) {\n" +
        "    distances[node] = Infinity;\n" +
        "  }\n" +
        "  distances[start] = 0;\n" +
        "  pq.enqueue(start, 0);\n" +
        "  \n" +
        "  while (!pq.isEmpty()) {\n" +
        "    const { node, priority: dist } = pq.dequeue();\n" +
        "    \n" +
        "    for (const [neighbor, weight] of graph[node]) {\n" +
        "      const newDist = dist + weight;\n" +
        "      if (newDist < distances[neighbor]) {\n" +
        "        distances[neighbor] = newDist;\n" +
        "        pq.enqueue(neighbor, newDist);\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return distances;\n" +
        "}",
      visualization: { type: "graph", config: { algorithm: "dijkstra" } },
      quiz: [
        {
          question: "What condition must edge weights satisfy for Dijkstra's algorithm?",
          options: ["Must be negative", "Must be positive", "Can be any value", "Must be integers"],
          answerIndex: 1,
          explanation: "Dijkstra's algorithm requires non-negative edge weights to work correctly.",
        },
      ],
    },

    // DSA - Dynamic Programming
    {
      title: "Fibonacci with Memoization",
      description: "Learn memoization to optimize recursive solutions with overlapping subproblems.",
      difficulty: "Easy",
      category: "Dynamic Programming",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Memoization stores results of expensive function calls and returns cached results for same inputs.\\n\\nTransforms O(2^n) recursive Fibonacci to O(n) time complexity.",
      code:
        "const memo = {};\n" +
        "function fib(n) {\n" +
        "  if (n <= 1) return n;\n" +
        "  if (memo[n]) return memo[n];\n" +
        "  return memo[n] = fib(n - 1) + fib(n - 2);\n" +
        "}\n" +
        "// Bottom-up approach\n" +
        "function fibIterative(n) {\n" +
        "  if (n <= 1) return n;\n" +
        "  let prev = 0, curr = 1;\n" +
        "  for (let i = 2; i <= n; i++) {\n" +
        "    const next = prev + curr;\n" +
        "    prev = curr;\n" +
        "    curr = next;\n" +
        "  }\n" +
        "  return curr;\n" +
        "}",
      visualization: { type: "dp", config: { algorithm: "fibonacci" } },
      quiz: [
        {
          question: "What does memoization primarily optimize?",
          options: ["Space usage", "Overlapping subproblems", "Code length", "Function calls"],
          answerIndex: 1,
          explanation: "Memoization caches results for overlapping subproblems to avoid redundant computation.",
        },
      ],
    },
    {
      title: "0/1 Knapsack Problem",
      description: "Classic DP problem: maximize value with weight constraint.",
      difficulty: "Medium",
      category: "Dynamic Programming",
      planet: planetBySlug.get("dsa")._id,
      content:
        "Given items with weights and values, select subset that maximizes total value without exceeding capacity.\\n\\nDP table: dp[i][w] = max value using first i items with capacity w\\nTime: O(nW) where W is capacity.",
      code:
        "function knapsack(weights, values, capacity) {\n" +
        "  const n = weights.length;\n" +
        "  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));\n" +
        "  \n" +
        "  for (let i = 1; i <= n; i++) {\n" +
        "    for (let w = 0; w <= capacity; w++) {\n" +
        "      if (weights[i-1] <= w) {\n" +
        "        dp[i][w] = Math.max(\n" +
        "          dp[i-1][w], // Don't take item\n" +
        "          dp[i-1][w - weights[i-1]] + values[i-1] // Take item\n" +
        "        );\n" +
        "      } else {\n" +
        "        dp[i][w] = dp[i-1][w];\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return dp[n][capacity];\n" +
        "}",
      visualization: { type: "dp", config: { algorithm: "knapsack" } },
      quiz: [
        {
          question: "In 0/1 knapsack, each item can be used how many times?",
          options: ["0 or 1", "Multiple times", "Never", "Always"],
          answerIndex: 0,
          explanation: "0/1 knapsack allows each item to be used either 0 times or 1 time.",
        },
      ],
    },

    // DSA - Stack/Queue (expanded)
    {
      title: "Stack & Queue (Operational Intuition)",
      description: "See how push/pop (stack) and enqueue/dequeue (queue) mutate internal state.",
      difficulty: "Easy",
      category: "Data Structures",
      planet: planetBySlug.get("dsa")._id,
      content:
        "A stack is Last-In-First-Out (LIFO). A queue is First-In-First-Out (FIFO).\\n\\nThis topic focuses on step-by-step operations and how the structure changes after each action.",
      code:
        "class Stack {\n" +
        "  constructor() { this.items = []; }\n" +
        "  push(x) { this.items.push(x); }\n" +
        "  pop() { return this.items.pop(); }\n" +
        "  peek() { return this.items[this.items.length - 1]; }\n" +
        "  isEmpty() { return this.items.length === 0; }\n" +
        "}\n" +
        "class Queue {\n" +
        "  constructor() { this.items = []; this.head = 0; }\n" +
        "  enqueue(x) { this.items.push(x); }\n" +
        "  dequeue() { if (this.head >= this.items.length) return undefined; const v = this.items[this.head++]; return v; }\n" +
        "  front() { return this.items[this.head]; }\n" +
        "  isEmpty() { return this.head >= this.items.length; }\n" +
        "}",
      visualization: { type: "stack_queue", config: { mode: "both" } },
      quiz: [
        {
          question: "Which structure is LIFO?",
          options: ["Stack", "Queue", "Binary tree", "Graph"],
          answerIndex: 0,
          explanation: "Stacks are LIFO (Last-In-First-Out).",
        },
      ],
    },
    {
      title: "Valid Parentheses (Stack Application)",
      description: "Use stack to check balanced brackets and parentheses.",
      difficulty: "Easy",
      category: "Data Structures",
      planet: planetBySlug.get("dsa")._id,
      content:
        "For balanced parentheses, each opening bracket must have matching closing bracket in correct order.\\n\\nUse stack: push opening brackets, pop and check when encountering closing brackets.",
      code:
        "function isValid(s) {\n" +
        "  const stack = [];\n" +
        "  const pairs = { ')': '(', '}': '{', ']': '[' };\n" +
        "  \n" +
        "  for (const char of s) {\n" +
        "    if (char in pairs) {\n" +
        "      if (stack.pop() !== pairs[char]) return false;\n" +
        "    } else {\n" +
        "      stack.push(char);\n" +
        "    }\n" +
        "  }\n" +
        "  return stack.length === 0;\n" +
        "}",
      visualization: { type: "stack_queue", config: { algorithm: "parentheses" } },
      quiz: [
        {
          question: "What should the stack contain at the end for valid parentheses?",
          options: ["All opening brackets", "All closing brackets", "Nothing", "Mixed brackets"],
          answerIndex: 2,
          explanation: "A valid string should have an empty stack after processing all characters.",
        },
      ],
    },

    // Frontend - HTML/CSS/JS/React (expanded)
    {
      title: "HTML Semantics for Accessible UIs",
      description: "Learn semantic tags and how they improve accessibility and SEO.",
      difficulty: "Easy",
      category: "HTML",
      planet: planetBySlug.get("frontend")._id,
      content:
        "Use semantic HTML to help screen readers and search engines: `header`, `nav`, `main`, `section`, `article`, and `footer`.\\n\\nGood semantics reduce the need for extra ARIA and make layouts understandable.",
      code: "// Example\n// Use <main> for primary content, <nav> for navigation links.",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which element best represents the main content of the page?",
          options: ["header", "nav", "main", "footer"],
          answerIndex: 2,
          explanation: "`main` represents the primary content unique to a document.",
        },
      ],
    },
    {
      title: "HTML Forms & Input Validation",
      description: "Master form elements, input types, and client-side validation.",
      difficulty: "Easy",
      category: "HTML",
      planet: planetBySlug.get("frontend")._id,
      content:
        "HTML5 provides many input types: text, email, password, number, date, etc.\\n\\nUse `required`, `pattern`, `min`, `max` for validation. Combine with JavaScript for custom validation.",
      code: "<form>\n  <input type=\"email\" required pattern=\"[^@]+@[^@]+\\.[^@]+\" />\n  <input type=\"password\" minlength=\"8\" required />\n  <input type=\"number\" min=\"0\" max=\"100\" />\n  <button type=\"submit\">Submit</button>\n</form>",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which attribute makes a field mandatory?",
          options: ["validate", "mandatory", "required", "needed"],
          answerIndex: 2,
          explanation: "The `required` attribute makes a form field mandatory for submission.",
        },
      ],
    },
    {
      title: "CSS Flexbox: Layout Mechanics",
      description: "Understand the main-axis/cross-axis and how items are distributed.",
      difficulty: "Medium",
      category: "CSS",
      planet: planetBySlug.get("frontend")._id,
      content:
        "Flexbox is ideal for 1D layouts. Learn `flex-direction`, `justify-content`, `align-items`, and `gap`.\\n\\nUse `flex-wrap` when items need to flow onto multiple lines.",
      code: ".row { display:flex; gap:12px; justify-content:space-between; align-items:center; }",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which property controls the distribution along the main axis?",
          options: ["justify-content", "align-items", "gap", "order"],
          answerIndex: 0,
          explanation: "`justify-content` aligns items along the main axis.",
        },
      ],
    },
    {
      title: "CSS Grid: 2D Layout System",
      description: "Create complex 2D layouts with grid-template and grid placement properties.",
      difficulty: "Medium",
      category: "CSS",
      planet: planetBySlug.get("frontend")._id,
      content:
        "CSS Grid enables 2D layouts with rows and columns. Use `grid-template-columns`, `grid-template-rows`, and `grid-area` for precise control.\\n\\nPerfect for complex layouts that flexbox can't handle easily.",
      code: ".grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  grid-template-rows: auto 1fr auto;\n  gap: 16px;\n}\n\n.header { grid-column: 1 / -1; }\n.main { grid-column: 2; grid-row: 2; }\n.sidebar { grid-column: 1; grid-row: 2; }",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "CSS Grid is best for what type of layouts?",
          options: ["1D horizontal", "1D vertical", "2D complex", "Simple stacks"],
          answerIndex: 2,
          explanation: "CSS Grid excels at 2D layouts with both rows and columns.",
        },
      ],
    },
    {
      title: "CSS Responsive Design",
      description: "Learn media queries, fluid layouts, and mobile-first design principles.",
      difficulty: "Medium",
      category: "CSS",
      planet: planetBySlug.get("frontend")._id,
      content:
        "Responsive design adapts to different screen sizes. Use media queries, relative units (%, em, rem, vw), and flexible images.\\n\\nMobile-first: design for small screens first, then enhance for larger screens.",
      code: "@media (max-width: 768px) {\n  .container { padding: 16px; }\n  .grid { grid-template-columns: 1fr; }\n}\n\n@media (min-width: 769px) {\n  .container { padding: 32px; }\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "What does mobile-first responsive design mean?",
          options: ["Design mobile last", "Design mobile first", "Ignore mobile", "Mobile only"],
          answerIndex: 1,
          explanation: "Mobile-first means starting with mobile design and progressively enhancing for larger screens.",
        },
      ],
    },
    {
      title: "JavaScript ES6+ Features",
      description: "Master modern JavaScript: arrow functions, destructuring, promises, async/await.",
      difficulty: "Medium",
      category: "JavaScript",
      planet: planetBySlug.get("frontend")._id,
      content:
        "ES6+ brings powerful features: const/let, arrow functions, template literals, destructuring, spread/rest operators, promises, async/await, and modules.\\n\\nThese features make code more readable and maintainable.",
      code: "// Arrow functions\nconst add = (a, b) => a + b;\n\n// Destructuring\nconst { name, age } = person;\nconst [first, ...rest] = array;\n\n// Async/await\nconst fetchData = async () => {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n};",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which keyword declares block-scoped variables?",
          options: ["var", "let", "const", "Both let and const"],
          answerIndex: 3,
          explanation: "Both `let` and `const` declare block-scoped variables, unlike `var`.",
        },
      ],
    },
    {
      title: "DOM Manipulation & Events",
      description: "Learn to select elements, modify content, and handle user interactions.",
      difficulty: "Easy",
      category: "JavaScript",
      planet: planetBySlug.get("frontend")._id,
      content:
        "DOM manipulation involves selecting elements with `querySelector`, modifying content with `textContent`/`innerHTML`, and handling events with `addEventListener`.\\n\\nUnderstand event bubbling, delegation, and preventing default behaviors.",
      code: "// Selecting elements\nconst button = document.querySelector('#myButton');\nconst container = document.querySelector('.container');\n\n// Event handling\nbutton.addEventListener('click', (event) => {\n  event.preventDefault();\n  container.innerHTML = '<p>Button clicked!</p>';\n});\n\n// Event delegation\ncontainer.addEventListener('click', (event) => {\n  if (event.target.matches('.item')) {\n    console.log('Item clicked:', event.target.textContent);\n  }\n});",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which method selects the first matching element?",
          options: ["querySelectorAll", "querySelector", "getElementById", "getElementsByClassName"],
          answerIndex: 1,
          explanation: "`querySelector` returns the first element matching the CSS selector.",
        },
      ],
    },
    {
      title: "React Hooks Fundamentals",
      description: "Master useState, useEffect, useContext, and custom hooks.",
      difficulty: "Medium",
      category: "React",
      planet: planetBySlug.get("frontend")._id,
      content:
        "React Hooks allow state and lifecycle in functional components. `useState` for state, `useEffect` for side effects, `useContext` for context consumption.\\n\\nRules: only call hooks at top level, never in loops/conditions.",
      code: "import { useState, useEffect } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const [name, setName] = useState('');\n  \n  useEffect(() => {\n    document.title = `Count: ${count}`;\n    return () => {\n      // Cleanup function\n    };\n  }, [count]); // Only re-run when count changes\n  \n  return (\n    <div>\n      <input value={name} onChange={e => setName(e.target.value)} />\n      <button onClick={() => setCount(count + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  );\n}",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "When does useEffect run by default?",
          options: ["Only on mount", "On every render", "On unmount", "Never"],
          answerIndex: 1,
          explanation: "useEffect runs after every render by default unless a dependency array is provided.",
        },
      ],
    },
    {
      title: "React Component Patterns",
      description: "Learn controlled components, compound components, and render props.",
      difficulty: "Medium",
      category: "React",
      planet: planetBySlug.get("frontend")._id,
      content:
        "Effective React patterns: controlled vs uncontrolled components, lifting state up, compound components with context, render props for flexible APIs.\\n\\nChoose patterns based on component complexity and reusability needs.",
      code: "// Controlled Component\nfunction ControlledInput({ value, onChange }) {\n  return <input value={value} onChange={onChange} />;\n}\n\n// Compound Component\nconst Tabs = ({ children }) => {\n  const [activeTab, setActiveTab] = useState(0);\n  return (\n    <div>\n      {React.Children.map(children, (child, index) => \n        React.cloneElement(child, { \n          isActive: index === activeTab,\n          onClick: () => setActiveTab(index)\n        })\n      )}\n    </div>\n  );\n};",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "What makes a component 'controlled'?",
          options: ["Internal state", "External state control", "No props", "Only functions"],
          answerIndex: 1,
          explanation: "Controlled components have their state controlled by parent components via props.",
        },
      ],
    },

    // Backend - Node/Express & API flow (expanded)
    {
      title: "Express Request Lifecycle",
      description: "Understand middleware order: parsing, auth, routes, and error handling.",
      difficulty: "Medium",
      category: "Express",
      planet: planetBySlug.get("backend")._id,
      content:
        "An Express request passes through middleware in the order they are registered.\\n\\nTypical pipeline: JSON parsing -> auth -> route handlers -> error middleware.",
      code: "app.use(express.json());\napp.use(authMiddleware);\napp.use('/api', routes);\napp.use(errorHandler);",
      visualization: { type: "api_flow", config: { nodes: ["Client", "Express", "MongoDB", "Response"] } },
      quiz: [
        {
          question: "Where should you put error handling middleware in Express?",
          options: ["Before routes", "After all routes", "Never", "Anywhere; it will always work"],
          answerIndex: 1,
          explanation: "Error middleware should be registered after routes to catch errors from them.",
        },
      ],
    },
    {
      title: "REST API Design Principles",
      description: "Learn RESTful conventions: resources, HTTP methods, status codes, and HATEOAS.",
      difficulty: "Medium",
      category: "API Design",
      planet: planetBySlug.get("backend")._id,
      content:
        "REST APIs use HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).\\n\\nUse proper status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.\\n\\nDesign resource-based URLs and use consistent naming.",
      code: "// RESTful routes\nGET    /api/users          // List users\nPOST   /api/users          // Create user\nGET    /api/users/:id      // Get specific user\nPUT    /api/users/:id      // Update user\nDELETE /api/users/:id      // Delete user\n\n// Status codes\nres.status(201).json({ user }); // Created\nres.status(400).json({ error: 'Invalid input' }); // Bad Request",
      visualization: { type: "api_flow", config: { nodes: ["Client", "REST API", "Database", "Response"] } },
      quiz: [
        {
          question: "Which HTTP method is used to create resources?",
          options: ["GET", "POST", "PUT", "DELETE"],
          answerIndex: 1,
          explanation: "POST is used to create new resources on the server.",
        },
      ],
    },
    {
      title: "JWT Authentication & Authorization",
      description: "Implement token-based auth with access/refresh tokens and middleware.",
      difficulty: "Medium",
      category: "Authentication",
      planet: planetBySlug.get("backend")._id,
      content:
        "JWT authentication uses access tokens for API access and refresh tokens for getting new access tokens.\\n\\nStore refresh tokens securely (httpOnly cookies), verify access tokens in middleware.\\n\\nHandle token expiration and refresh flows properly.",
      code: "// JWT middleware\nconst authenticateToken = (req, res, next) => {\n  const authHeader = req.headers['authorization'];\n  const token = authHeader && authHeader.split(' ')[1];\n  \n  if (!token) return res.sendStatus(401);\n  \n  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n};\n\n// Generate tokens\nconst generateTokens = (user) => {\n  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });\n  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });\n  return { accessToken, refreshToken };\n};",
      visualization: { type: "api_flow", config: { nodes: ["Login", "JWT", "Protected Route", "Response"] } },
      quiz: [
        {
          question: "Where should refresh tokens be stored?",
          options: ["Local storage", "Session storage", "HttpOnly cookies", "Plain cookies"],
          answerIndex: 2,
          explanation: "HttpOnly cookies prevent JavaScript access, protecting against XSS attacks.",
        },
      ],
    },
    {
      title: "Input Validation & Sanitization",
      description: "Use libraries like Joi/Zod for validation and prevent injection attacks.",
      difficulty: "Easy",
      category: "Security",
      planet: planetBySlug.get("backend")._id,
      content:
        "Validate and sanitize all user inputs. Use schema validation libraries to define expected data shapes.\\n\\nPrevent SQL injection, XSS, and other attacks by validating input types, lengths, and formats.\\n\\nReturn meaningful error messages for validation failures.",
      code: "const Joi = require('joi');\n\nconst userSchema = Joi.object({\n  email: Joi.string().email().required(),\n  password: Joi.string().min(8).max(128).required(),\n  age: Joi.number().integer().min(13).max(120)\n});\n\napp.post('/api/users', (req, res) => {\n  const { error, value } = userSchema.validate(req.body);\n  if (error) {\n    return res.status(400).json({ \n      error: error.details[0].message \n    });\n  }\n  // Proceed with validated data\n  createUser(value);\n});",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "What is the primary purpose of input validation?",
          options: ["Performance", "Security", "UI design", "Database optimization"],
          answerIndex: 1,
          explanation: "Input validation prevents malicious data from compromising application security.",
        },
      ],
    },
    {
      title: "Database Connection & ORM Basics",
      description: "Learn to connect to databases and perform basic CRUD operations.",
      difficulty: "Easy",
      category: "Database",
      planet: planetBySlug.get("backend")._id,
      content:
        "Connect to databases using connection strings and environment variables. Use ORMs like Mongoose for MongoDB or Prisma for SQL databases.\\n\\nImplement proper connection pooling, error handling, and graceful shutdowns.",
      code: "// MongoDB connection with Mongoose\nconst mongoose = require('mongoose');\n\nmongoose.connect(process.env.MONGODB_URI, {\n  useNewUrlParser: true,\n  useUnifiedTopology: true,\n}).then(() => {\n  console.log('Connected to MongoDB');\n}).catch(err => {\n  console.error('Connection error:', err);\n});\n\n// Graceful shutdown\nprocess.on('SIGINT', async () => {\n  await mongoose.connection.close();\n  process.exit(0);\n});",
      visualization: { type: "api_flow", config: { nodes: ["App", "Database", "Connection", "Query"] } },
      quiz: [
        {
          question: "What should you do before app shutdown?",
          options: ["Open connections", "Close connections", "Create connections", "Ignore connections"],
          answerIndex: 1,
          explanation: "Properly close database connections during app shutdown to prevent resource leaks.",
        },
      ],
    },

    // Database - MongoDB (expanded)
    {
      title: "MongoDB Indexing Fundamentals",
      description: "Learn indexes, explain plans, and how to keep queries fast on Atlas.",
      difficulty: "Medium",
      category: "MongoDB",
      planet: planetBySlug.get("database")._id,
      content:
        "Indexes speed up reads but add write overhead. Use indexes for filter/sort fields you query frequently.\\n\\nOn Atlas, prefer compound indexes that match your query shape.",
      code: "db.collection.createIndex({ email: 1 }, { unique: true });",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Indexes primarily improve which operation?",
          options: ["Reads (queries)", "Storage only", "Network latency", "CPU frequency"],
          answerIndex: 0,
          explanation: "Indexes accelerate lookups and ordered scans at query time.",
        },
      ],
    },
    {
      title: "MongoDB Schema Design",
      description: "Learn embedding vs referencing, data modeling patterns, and denormalization.",
      difficulty: "Medium",
      category: "MongoDB",
      planet: planetBySlug.get("database")._id,
      content:
        "MongoDB schema design involves trade-offs between embedding (faster reads, data duplication) and referencing (normalized, slower joins).\\n\\nConsider read/write patterns, data access patterns, and atomicity requirements.",
      code: "// Embedded schema (good for 1:1 or 1:few)\nconst userSchema = new Schema({\n  name: String,\n  address: {\n    street: String,\n    city: String,\n    zip: String\n  }\n});\n\n// Referenced schema (good for 1:many)\nconst postSchema = new Schema({\n  title: String,\n  author: { type: Schema.Types.ObjectId, ref: 'User' },\n  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]\n});",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "When should you embed documents in MongoDB?",
          options: ["Always", "For 1:1 relationships", "For 1:many with few items", "Never"],
          answerIndex: 2,
          explanation: "Embed when relationships are 1:1 or 1:few, and you need atomic operations or fast reads.",
        },
      ],
    },
    {
      title: "MongoDB Aggregation Pipeline",
      description: "Master $match, $group, $project, $sort, and other aggregation stages.",
      difficulty: "Hard",
      category: "MongoDB",
      planet: planetBySlug.get("database")._id,
      content:
        "Aggregation pipeline processes documents through stages: $match (filter), $group (aggregate), $project (reshape), $sort (order), $limit (restrict).\\n\\nUse for complex queries, reporting, and data transformations.",
      code: "db.orders.aggregate([\n  // Stage 1: Filter\n  { $match: { status: 'completed', total: { $gt: 100 } } },\n  \n  // Stage 2: Group by customer\n  { $group: { \n    _id: '$customerId',\n    totalSpent: { $sum: '$total' },\n    orderCount: { $sum: 1 }\n  }},\n  \n  // Stage 3: Sort by total spent\n  { $sort: { totalSpent: -1 } },\n  \n  // Stage 4: Limit results\n  { $limit: 10 }\n]);",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "Which stage filters documents in aggregation?",
          options: ["$group", "$match", "$project", "$sort"],
          answerIndex: 1,
          explanation: "$match filters documents at the beginning of the pipeline for efficiency.",
        },
      ],
    },
    {
      title: "SQL vs NoSQL Comparison",
      description: "Understand when to use relational databases vs document databases.",
      difficulty: "Medium",
      category: "Database Design",
      planet: planetBySlug.get("database")._id,
      content:
        "SQL databases excel at complex queries, transactions, and structured data. NoSQL databases handle scale, flexible schemas, and hierarchical data.\\n\\nChoose based on data relationships, query patterns, and scalability needs.",
      code: "// SQL: Strict schema, complex relationships\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);\n\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id),\n  title VARCHAR(255) NOT NULL,\n  content TEXT\n);\n\n// NoSQL: Flexible schema, nested data\n{\n  _id: ObjectId(),\n  name: 'John Doe',\n  email: 'john@example.com',\n  posts: [\n    { title: 'My Post', content: 'Content here', createdAt: Date() }\n  ]\n}",
      visualization: { type: "none", config: {} },
      quiz: [
        {
          question: "SQL databases are best for which scenario?",
          options: ["Flexible schemas", "Complex relationships", "High write loads", "Unstructured data"],
          answerIndex: 1,
          explanation: "SQL excels at complex relationships and ACID transactions with structured data.",
        },
      ],
    },
  ];

  // eslint-disable-next-line no-console
  console.log(`Seeding ${topics.length} topics...`);
  await Topic.insertMany(topics);

  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log("Seed completed.");
}