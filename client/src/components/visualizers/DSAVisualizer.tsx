import { useEffect, useMemo, useRef, useState } from "react";
import type { TopicDTO } from "../../stores/universeStore";

type DSAVisFrame = {
  stepIndex: number;
  label: string;
};

function usePlayback(frames: DSAVisFrame[], speedMs: number) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (!frames.length) return;
    if (index >= frames.length - 1) {
      setPlaying(false);
      return;
    }

    tRef.current = window.setTimeout(() => {
      setIndex((i) => Math.min(frames.length - 1, i + 1));
    }, speedMs);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = null;
    };
  }, [playing, index, frames.length, speedMs]);

  useEffect(() => {
    // Reset playback when frames change.
    setIndex(0);
    setPlaying(false);
  }, [frames]);

  return {
    playing,
    setPlaying,
    index,
    setIndex,
    canPrev: index > 0,
    canNext: index < frames.length - 1,
  };
}

function SortingVisualizer({ algorithm, onProgressChange }: { algorithm: "bubble" | "merge" | "quick"; onProgressChange: (i: number) => void }) {
  const initial = useMemo(() => [5, 1, 4, 2, 8, 6, 3, 7], []);
  const [array, setArray] = useState(initial);

  const frames = useMemo(() => {
    const arr = array.slice();
    const out: Array<DSAVisFrame & { values: number[]; highlight: number[] }> = [];

    const pushFrame = (label: string, highlight: number[] = []) => {
      out.push({
        stepIndex: out.length,
        label,
        values: arr.slice(),
        highlight,
      });
    };

    pushFrame("Start", []);

    if (algorithm === "bubble") {
      const a = arr;
      for (let i = 0; i < a.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < a.length - 1 - i; j++) {
          pushFrame(`Compare ${a[j]} and ${a[j + 1]}`, [j, j + 1]);
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swapped = true;
            pushFrame("Swap", [j, j + 1]);
          }
        }
        if (!swapped) break;
      }
      pushFrame("Sorted", []);
    }

    if (algorithm === "merge") {
      const a = arr;
      const n = a.length;
      const mergeSort = (l: number, r: number) => {
        if (r - l <= 1) return;
        const m = Math.floor((l + r) / 2);
        mergeSort(l, m);
        mergeSort(m, r);

        // Merge a[l..m-1] and a[m..r-1] into temp, writing back into a.
        const left = a.slice(l, m);
        const right = a.slice(m, r);
        let i = 0;
        let j = 0;
        let k = l;

        while (i < left.length && j < right.length) {
          const leftIdx = l + i;
          const rightIdx = m + j;
          pushFrame(`Compare ${left[i]} and ${right[j]}`, [leftIdx, rightIdx]);
          if (left[i] <= right[j]) {
            a[k] = left[i];
            pushFrame(`Write ${left[i]} to position ${k}`, [k, leftIdx]);
            i++;
          } else {
            a[k] = right[j];
            pushFrame(`Write ${right[j]} to position ${k}`, [k, rightIdx]);
            j++;
          }
          k++;
        }
        while (i < left.length) {
          a[k] = left[i];
          pushFrame(`Write ${left[i]} to position ${k}`, [k, l + i]);
          i++;
          k++;
        }
        while (j < right.length) {
          a[k] = right[j];
          pushFrame(`Write ${right[j]} to position ${k}`, [k, m + j]);
          j++;
          k++;
        }
      };

      mergeSort(0, n);
      pushFrame("Sorted", []);
    }

    if (algorithm === "quick") {
      const a = arr;

      const quickSort = (l: number, h: number) => {
        if (l >= h) return;

        const pivot = a[h];
        let i = l;
        for (let j = l; j < h; j++) {
          pushFrame(`Compare ${a[j]} with pivot ${pivot}`, [j, h]);
          if (a[j] <= pivot) {
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              pushFrame(`Swap indices ${i} and ${j}`, [i, j]);
            }
            i++;
          }
        }
        if (i !== h) {
          [a[i], a[h]] = [a[h], a[i]];
          pushFrame(`Place pivot at index ${i}`, [i, h]);
        } else {
          pushFrame(`Pivot stays at index ${h}`, [h]);
        }

        quickSort(l, i - 1);
        quickSort(i + 1, h);
      };

      quickSort(0, a.length - 1);
      pushFrame("Sorted", []);
    }

    return out;
  }, [algorithm, array]);

  const [speed, setSpeed] = useState(350);
  const playback = usePlayback(frames, speed);

  useEffect(() => {
    onProgressChange(playback.index);
  }, [playback.index, onProgressChange]);

  const frame = frames[playback.index];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold text-sm">Sorting: {algorithm.toUpperCase()}</div>
          <div className="text-white/60 text-xs mt-1">{frame?.label}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs"
            onClick={() => {
              // Shuffle while keeping values small enough for bars.
              const next = array.slice().sort(() => Math.random() - 0.5);
              setArray(next);
            }}
          >
            New Array
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-xs"
            onClick={() => playback.setPlaying(!playback.playing)}
            disabled={!frames.length}
          >
            {playback.playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => playback.canPrev && playback.setIndex(playback.index - 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => playback.canNext && playback.setIndex(playback.index + 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canNext}
        >
          Next
        </button>

        <div className="flex-1" />

        <div className="text-white/60 text-xs whitespace-nowrap">Speed</div>
        <input
          type="range"
          min={120}
          max={800}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-44"
        />
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-2 h-52">
          {frame.values.map((v, idx) => {
            const isHi = frame.highlight.includes(idx);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-xl"
                  style={{
                    height: `${(v / 10) * 100}%`,
                    background: isHi ? "rgba(170, 59, 255, 0.95)" : "rgba(255,255,255,0.12)",
                    boxShadow: isHi ? "0 0 18px rgba(170, 59, 255, 0.35)" : "none",
                    transition: "background 120ms ease",
                  }}
                />
                <div className="mt-1 text-[10px] text-white/50">{v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GraphVisualizer({ algorithm, onProgressChange }: { algorithm: "bfs" | "dfs"; onProgressChange: (i: number) => void }) {
  const nodes = useMemo(
    () => [
      { id: "A", x: 60, y: 40 },
      { id: "B", x: 20, y: 120 },
      { id: "C", x: 100, y: 120 },
      { id: "D", x: 60, y: 200 },
      { id: "E", x: 10, y: 260 },
      { id: "F", x: 130, y: 260 },
    ],
    []
  );
  const edges = useMemo(
    () => [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["B", "E"],
      ["D", "E"],
      ["C", "F"],
      ["D", "F"],
    ],
    []
  );
  const adjacency = useMemo(() => {
    const map = new Map<string, string[]>();
    const add = (u: string, v: string) => {
      if (!map.has(u)) map.set(u, []);
      map.get(u)!.push(v);
    };
    for (const [u, v] of edges) {
      add(u, v);
      add(v, u);
    }
    for (const k of map.keys()) map.set(k, (map.get(k) || []).slice().sort());
    return map;
  }, [edges]);

  const [start, setStart] = useState("A");
  const frames = useMemo(() => {
    type GFrame = DSAVisFrame & { visited: Set<string>; current: string | null; queue: string[]; stack: string[] };
    const out: GFrame[] = [];

    const visit = (visited: Set<string>, current: string | null, queue: string[], stack: string[], label: string) => {
      out.push({
        stepIndex: out.length,
        label,
        visited: new Set(visited),
        current,
        queue: [...queue],
        stack: [...stack],
      });
    };

    const visited = new Set<string>();
    if (!adjacency.has(start)) return out;

    if (algorithm === "bfs") {
      const queue: string[] = [start];
      visited.add(start);
      visit(visited, null, queue, [], `Initialize BFS from ${start}`);
      while (queue.length) {
        const node = queue.shift()!;
        visit(visited, node, queue, [], `Dequeue ${node}`);
        for (const nei of adjacency.get(node) || []) {
          if (!visited.has(nei)) {
            visited.add(nei);
            queue.push(nei);
            visit(visited, nei, queue, [], `Discover ${nei} via ${node}`);
          }
        }
      }
      visit(visited, null, [], [], "BFS complete");
    } else {
      // DFS iterative using stack
      const stack: string[] = [start];
      visited.add(start);
      visit(visited, null, [], stack, `Initialize DFS from ${start}`);
      while (stack.length) {
        const node = stack.pop()!;
        visit(visited, node, [], stack, `Pop ${node}`);
        const neighbors = adjacency.get(node) || [];
        // Push in reverse to get natural sorted order.
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const nei = neighbors[i];
          if (!visited.has(nei)) {
            visited.add(nei);
            stack.push(nei);
            visit(visited, nei, [], stack, `Push ${nei} from ${node}`);
          }
        }
      }
      visit(visited, null, [], [], "DFS complete");
    }

    return out;
  }, [algorithm, adjacency, start]);

  const [speed, setSpeed] = useState(320);
  const playback = usePlayback(frames, speed);

  useEffect(() => {
    onProgressChange(playback.index);
  }, [playback.index, onProgressChange]);

  const frame = frames[playback.index];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold text-sm">Graph: {algorithm.toUpperCase()}</div>
          <div className="text-white/60 text-xs mt-1">{frame?.label}</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 rounded-xl bg-bg-1 border border-white/10 text-white/80 outline-none"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-xs"
            onClick={() => playback.setPlaying(!playback.playing)}
            disabled={!frames.length}
          >
            {playback.playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => playback.canPrev && playback.setIndex(playback.index - 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => playback.canNext && playback.setIndex(playback.index + 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canNext}
        >
          Next
        </button>

        <div className="flex-1" />

        <div className="text-white/60 text-xs whitespace-nowrap">Speed</div>
        <input type="range" min={120} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-44" />
      </div>

      <div className="mt-4 flex items-start gap-3">
        <svg viewBox="0 0 160 300" width="100%" className="rounded-2xl border border-white/10 bg-black/10">
          {/* edges */}
          {edges.map(([u, v]) => {
            const nu = nodes.find((n) => n.id === u)!;
            const nv = nodes.find((n) => n.id === v)!;
            const visitedBoth = frame.visited.has(u) && frame.visited.has(v);
            const isCurrentEdge =
              frame.current && (u === frame.current || v === frame.current) && frame.visited.has(frame.current);
            return (
              <line
                key={`${u}-${v}`}
                x1={nu.x}
                y1={nu.y}
                x2={nv.x}
                y2={nv.y}
                stroke={isCurrentEdge ? "rgba(170, 59, 255, 0.9)" : visitedBoth ? "rgba(34,197,94,0.8)" : "rgba(255,255,255,0.16)"}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const isVisited = frame.visited.has(n.id);
            const isCurrent = frame.current === n.id;
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={12} fill={isCurrent ? "rgba(170,59,255,0.95)" : isVisited ? "rgba(34,197,94,0.75)" : "rgba(255,255,255,0.12)"} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isCurrent || isVisited ? "#fff" : "rgba(255,255,255,0.75)"} fontSize={12} fontFamily="monospace">
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="w-[220px] shrink-0">
          <div className="text-white/70 text-xs uppercase tracking-widest">State</div>
          <div className="mt-3 text-white/80 text-sm">
            <div>
              Current: <span className="text-white">{frame.current ?? "—"}</span>
            </div>
            <div className="mt-2">
              Visited: <span className="text-white">{Array.from(frame.visited).join(", ") || "—"}</span>
            </div>
            {algorithm === "bfs" ? (
              <div className="mt-2">
                Queue: <span className="text-white">{frame.queue.join(", ") || "—"}</span>
              </div>
            ) : (
              <div className="mt-2">
                Stack: <span className="text-white">{frame.stack.join(", ") || "—"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StackQueueVisualizer({ mode, onProgressChange }: { mode: "stack" | "queue" | "both"; onProgressChange: (i: number) => void }) {
  const values = useMemo(() => [3, 1, 4, 2, 5], []);

  type OpFrame = DSAVisFrame & { step: string; stack: number[]; queue: number[] };
  const frames = useMemo(() => {
    const out: OpFrame[] = [];

    const pushFrame = (step: string, stack: number[], queue: number[]) => {
      out.push({
        stepIndex: out.length,
        label: step,
        step,
        stack: [...stack],
        queue: [...queue],
      });
    };

    if (mode === "stack") {
      const stack: number[] = [];
      type PushPopOp = { t: "push"; v: number } | { t: "pop"; v: number };
      const ops: PushPopOp[] = [
        ...values.map((v) => ({ t: "push" as const, v })),
        ...values.slice().reverse().map((v) => ({ t: "pop" as const, v })),
      ];
      pushFrame("Initialize", stack, []);
      for (const op of ops) {
        if (op.t === "push") {
          stack.push(op.v);
          pushFrame(`Push ${op.v}`, stack, []);
        } else {
          stack.pop();
          pushFrame("Pop", stack, []);
        }
      }
    } else if (mode === "queue") {
      const queue: number[] = [];
      type EnqDeqOp = { t: "enqueue"; v: number } | { t: "dequeue" };
      const ops: EnqDeqOp[] = [
        ...values.map((v) => ({ t: "enqueue" as const, v })),
        ...values.map(() => ({ t: "dequeue" as const })),
      ];
      pushFrame("Initialize", [], queue);
      for (const op of ops) {
        if (op.t === "enqueue") {
          queue.push(op.v);
          pushFrame(`Enqueue ${op.v}`, [], queue);
        } else {
          queue.shift();
          pushFrame("Dequeue", [], queue);
        }
      }
    } else {
      const stack: number[] = [];
      const queue: number[] = [];
      pushFrame("Initialize", stack, queue);
      for (const v of values) {
        stack.push(v);
        queue.push(v);
        pushFrame(`Push/Enqueue ${v}`, stack, queue);
      }
      for (let i = 0; i < values.length; i++) {
        stack.pop();
        queue.shift();
        pushFrame(`Pop/Dequeue step ${i + 1}`, stack, queue);
      }
    }
    return out;
  }, [mode, values]);

  const [speed, setSpeed] = useState(320);
  const playback = usePlayback(frames, speed);

  useEffect(() => {
    onProgressChange(playback.index);
  }, [playback.index, onProgressChange]);

  const frame = frames[playback.index];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold text-sm">Stack & Queue</div>
          <div className="text-white/60 text-xs mt-1">{frame?.label}</div>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-xs"
          onClick={() => playback.setPlaying(!playback.playing)}
          disabled={!frames.length}
        >
          {playback.playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => playback.canPrev && playback.setIndex(playback.index - 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => playback.canNext && playback.setIndex(playback.index + 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canNext}
        >
          Next
        </button>

        <div className="flex-1" />

        <div className="text-white/60 text-xs whitespace-nowrap">Speed</div>
        <input type="range" min={120} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-44" />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(mode === "stack" || mode === "both") && (
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <div className="text-white/70 text-xs uppercase tracking-widest">Stack (LIFO)</div>
            <div className="mt-3 flex flex-col gap-2 items-center justify-end min-h-[160px]">
              {frame.stack.length ? (
                frame.stack
                  .slice()
                  .reverse()
                  .map((v, idx) => (
                    <div key={idx} className="w-3/4 rounded-xl bg-neon/20 border border-neon/40 text-white/90 text-center py-2 text-sm">
                      {v}
                    </div>
                  ))
              ) : (
                <div className="text-white/50 text-sm">Empty</div>
              )}
            </div>
          </div>
        )}

        {(mode === "queue" || mode === "both") && (
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <div className="text-white/70 text-xs uppercase tracking-widest">Queue (FIFO)</div>
            <div className="mt-3 flex flex-col gap-2 items-center justify-start min-h-[160px]">
              {frame.queue.length ? (
                frame.queue.map((v, idx) => (
                  <div
                    key={idx}
                    className="w-3/4 rounded-xl bg-neon-2/10 border border-neon-2/30 text-white/90 text-center py-2 text-sm relative"
                  >
                    {v}
                    {idx === 0 ? (
                      <div className="absolute -top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-neon-2/20 border border-neon-2/30 text-neon-2">
                        Front
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-sm">Empty</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type BSTNode = { val: number; left: BSTNode | null; right: BSTNode | null };
type TreeFrame = DSAVisFrame & { root: BSTNode | null; highlightVal: number | null; label: string };

function layoutTree(root: BSTNode | null) {
  // Compute x positions via inorder traversal.
  const nodes: Array<{ val: number; x: number; y: number; depth: number }> = [];
  let xCounter = 0;
  const walk = (node: BSTNode | null, depth: number) => {
    if (!node) return;
    walk(node.left, depth + 1);
    nodes.push({ val: node.val, x: xCounter++, y: depth, depth });
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  // Normalize x to pixel coordinates.
  const minX = 0;
  const maxX = Math.max(1, xCounter - 1);
  const width = 420;
  const heightStep = 65;
  return nodes.map((n) => ({
    ...n,
    x: 40 + (n.x - minX) * ((width - 80) / (maxX - minX || 1)),
    y: 30 + n.depth * heightStep,
  }));
}

function BSTVisualizer({ onProgressChange }: { onProgressChange: (i: number) => void }) {
  const values = useMemo(() => [50, 30, 70, 20, 40, 60, 80], []);
  const frames = useMemo((): TreeFrame[] => {
    const out: TreeFrame[] = [];

    const cloneRoot = (node: BSTNode | null): BSTNode | null => {
      if (!node) return null;
      return { val: node.val, left: cloneRoot(node.left), right: cloneRoot(node.right) };
    };

    let root: BSTNode | null = null;

    const push = (label: string, highlightVal: number | null) => {
      out.push({
        stepIndex: out.length,
        label,
        highlightVal,
        root: cloneRoot(root),
      });
    };

    push("Initialize empty BST", null);

    const insert = (val: number) => {
      if (!root) {
        root = { val, left: null, right: null };
        push(`Insert ${val} as root`, val);
        return;
      }

      let current: BSTNode | null = root;
      while (current) {
        push(`Compare ${val} with ${current.val}`, current.val);
        if (val < current.val) {
          if (!current.left) {
            current.left = { val, left: null, right: null };
            push(`Insert ${val} to the left of ${current.val}`, val);
            break;
          }
          current = current.left;
        } else {
          if (!current.right) {
            current.right = { val, left: null, right: null };
            push(`Insert ${val} to the right of ${current.val}`, val);
            break;
          }
          current = current.right;
        }
      }
    };

    for (const v of values) insert(v);
    push("BST built", null);
    return out;
  }, [values]);

  const [speed, setSpeed] = useState(360);
  const playback = usePlayback(frames, speed);

  useEffect(() => {
    onProgressChange(playback.index);
  }, [playback.index, onProgressChange]);

  const frame = frames[playback.index];

  const layout = useMemo(() => layoutTree(frame.root), [frame.root]);
  const posByVal = new Map(layout.map((n) => [n.val, n]));

  const edges = useMemo(() => {
    const out: Array<{ from: number; to: number }> = [];
    const walk = (node: BSTNode | null) => {
      if (!node) return;
      if (node.left) out.push({ from: node.val, to: node.left.val });
      if (node.right) out.push({ from: node.val, to: node.right.val });
      walk(node.left);
      walk(node.right);
    };
    walk(frame.root);
    return out;
  }, [frame.root]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold text-sm">BST Insertion (Step-by-Step)</div>
          <div className="text-white/60 text-xs mt-1">{frame?.label}</div>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-xs"
          onClick={() => playback.setPlaying(!playback.playing)}
          disabled={!frames.length}
        >
          {playback.playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => playback.canPrev && playback.setIndex(playback.index - 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => playback.canNext && playback.setIndex(playback.index + 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canNext}
        >
          Next
        </button>

        <div className="flex-1" />

        <div className="text-white/60 text-xs whitespace-nowrap">Speed</div>
        <input type="range" min={120} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-44" />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
        <svg viewBox="0 0 460 420" width="100%" className="block">
          {/* edges */}
          {edges.map((e, idx) => {
            const from = posByVal.get(e.from);
            const to = posByVal.get(e.to);
            if (!from || !to) return null;
            const isHi = frame.highlightVal !== null && (e.from === frame.highlightVal || e.to === frame.highlightVal);
            return (
              <line
                key={idx}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHi ? "rgba(170, 59, 255, 0.9)" : "rgba(255,255,255,0.18)"}
                strokeWidth={2}
              />
            );
          })}

          {/* nodes */}
          {layout.map((n) => {
            const isHi = frame.highlightVal === n.val;
            return (
              <g key={n.val}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={18}
                  fill={isHi ? "rgba(170,59,255,0.95)" : "rgba(255,255,255,0.12)"}
                  stroke={isHi ? "rgba(170,59,255,0.65)" : "rgba(255,255,255,0.14)"}
                  strokeWidth={1}
                />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#fff" fontSize={12} fontFamily="monospace">
                  {n.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ApiFlowVisualizer({
  nodes,
  onProgressChange,
}: {
  nodes: string[];
  onProgressChange: (i: number) => void;
}) {
  const safeNodes = nodes.length ? nodes : ["Client", "Express", "MongoDB", "Response"];

  const frames = useMemo(() => {
    type F = DSAVisFrame & { activeIndex: number };
    const out: F[] = [];
    out.push({ stepIndex: 0, label: "Ready", activeIndex: -1 });
    for (let i = 0; i < safeNodes.length; i++) {
      out.push({
        stepIndex: out.length,
        label:
          i === 0
            ? `Client sends request`
            : i === safeNodes.length - 1
            ? `Response returns`
            : `${safeNodes[i]} processes…`,
        activeIndex: i,
      });
    }
    out.push({ stepIndex: out.length, label: "Done", activeIndex: safeNodes.length - 1 });
    return out;
  }, [safeNodes]);

  const [speed, setSpeed] = useState(420);
  const playback = usePlayback(frames, speed);

  useEffect(() => {
    onProgressChange(playback.index);
  }, [playback.index, onProgressChange]);

  const frame = frames[playback.index];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold text-sm">API Flow Visualization</div>
          <div className="text-white/60 text-xs mt-1">{frame?.label}</div>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-xs"
          onClick={() => playback.setPlaying(!playback.playing)}
          disabled={!frames.length}
        >
          {playback.playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {safeNodes.map((n, idx) => {
          const active = frame.activeIndex === idx;
          const completed = frame.activeIndex > idx;
          return (
            <div key={n} className="flex items-center gap-3">
              <div
                className="w-[140px] rounded-2xl border text-center px-2 py-3 bg-black/10"
                style={{
                  borderColor: active ? "rgba(170,59,255,0.7)" : completed ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.10)",
                  boxShadow: active ? "0 0 20px rgba(170,59,255,0.35)" : "none",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.85)",
                }}
              >
                <div className="text-xs text-white/60 uppercase tracking-widest">{active ? "Active" : completed ? "Done" : "Node"}</div>
                <div className="text-sm font-semibold mt-1">{n}</div>
              </div>
              {idx < safeNodes.length - 1 ? (
                <div className="w-10 h-[2px] bg-white/10 relative">
                  <div
                    className="absolute top-[-6px] right-0 text-[10px] text-white/40"
                    style={{ opacity: completed && frame.activeIndex >= idx + 1 ? 1 : 0 }}
                  >
                    →
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => playback.canPrev && playback.setIndex(playback.index - 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => playback.canNext && playback.setIndex(playback.index + 1)}
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-xs disabled:opacity-40"
          disabled={!playback.canNext}
        >
          Next
        </button>

        <div className="flex-1" />

        <div className="text-white/60 text-xs whitespace-nowrap">Speed</div>
        <input type="range" min={180} max={900} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-44" />
      </div>
    </div>
  );
}

export default function DSAVisualizer({ topic, onProgressChange }: { topic: TopicDTO; onProgressChange: (lastStepIndex: number) => void }) {
  const type = topic.visualization?.type;
  const config = topic.visualization?.config || {};

  if (!type || type === "none") {
    return (
      <div className="text-white/70 text-sm rounded-2xl border border-white/10 bg-black/10 p-4">
        No visualization available for this topic.
      </div>
    );
  }

  if (type === "sorting") {
    const algorithm = (config.algorithm || "bubble") as "bubble" | "merge" | "quick";
    return <SortingVisualizer algorithm={algorithm} onProgressChange={onProgressChange} />;
  }

  if (type === "graph") {
    const algorithm = (config.algorithm || "bfs") as "bfs" | "dfs";
    return <GraphVisualizer algorithm={algorithm} onProgressChange={onProgressChange} />;
  }

  if (type === "stack_queue") {
    const modeRaw = (config.mode || "both") as "stack" | "queue" | "both";
    return <StackQueueVisualizer mode={modeRaw} onProgressChange={onProgressChange} />;
  }

  if (type === "tree") {
    // Currently supports BST insertion only.
    return <BSTVisualizer onProgressChange={onProgressChange} />;
  }

  if (type === "api_flow") {
    const nodes = Array.isArray(config.nodes) ? (config.nodes as string[]) : [];
    return <ApiFlowVisualizer nodes={nodes} onProgressChange={onProgressChange} />;
  }

  return (
    <div className="text-white/70 text-sm rounded-2xl border border-white/10 bg-black/10 p-4">
      Visualization type `{type}` not implemented yet.
    </div>
  );
}

