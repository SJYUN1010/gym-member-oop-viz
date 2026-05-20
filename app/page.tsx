"use client";

import { useState, useMemo, useRef, useEffect, useLayoutEffect, forwardRef } from "react";
import { GymMember } from "@/lib/gymMember";
import { PTMember } from "@/lib/ptMember";
import { createMembers } from "@/lib/instances";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

type LogEntry = {
  id: number;
  memberName: string;
  className: string;
  methodName: string;
  result: string[];
  isPT: boolean;
};

type MethodInfo = {
  definedIn: string;
  overriddenIn: string[];
  description: string;
};

const METHOD_INFO: { [key: string]: MethodInfo } = {
  workOut: {
    definedIn: "GymMember",
    overriddenIn: ["StandardMember", "PTMember"],
    description: "운동을 수행. 서브클래스마다 다른 스타일로 오버라이딩됨.",
  },
  checkStatus: {
    definedIn: "GymMember",
    overriddenIn: ["PTMember"],
    description: "현재 상태를 출력. PTMember는 트레이너 정보까지 추가.",
  },
  renew: {
    definedIn: "GymMember",
    overriddenIn: [],
    description: "이용권을 days만큼 연장. 모든 서브클래스가 상속해서 사용.",
  },
};

type Point = { x: number; y: number };
type Line = {
  from: Point;
  to: Point;
  kind: "inherit" | "instance";
  active: boolean;
};

export default function Home() {
  const [members, setMembers] = useState<GymMember[]>(() => createMembers());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const [highlightedMethod, setHighlightedMethod] = useState<string | null>(null);
  const [highlightedClass, setHighlightedClass] = useState<string | null>(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [hoveredLogId, setHoveredLogId] = useState<number | null>(null);
  const [pulsedCardIdx, setPulsedCardIdx] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);
  const adtRef = useRef<HTMLDivElement>(null);
  const gymMemberRef = useRef<HTMLDivElement>(null);
  const standardRef = useRef<HTMLDivElement>(null);
  const ptRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [lines, setLines] = useState<Line[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const recomputeLines = () => {
    const container = diagramRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const getRect = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        topCenter: { x: r.left + r.width / 2 - cRect.left, y: r.top - cRect.top },
        bottomCenter: {
          x: r.left + r.width / 2 - cRect.left,
          y: r.bottom - cRect.top,
        },
        leftCenter: { x: r.left - cRect.left, y: r.top + r.height / 2 - cRect.top },
        rightCenter: {
          x: r.right - cRect.left,
          y: r.top + r.height / 2 - cRect.top,
        },
        center: {
          x: r.left + r.width / 2 - cRect.left,
          y: r.top + r.height / 2 - cRect.top,
        },
        leftEdge: r.left - cRect.left,
        rightEdge: r.right - cRect.left,
        topEdge: r.top - cRect.top,
        bottomEdge: r.bottom - cRect.top,
      };
    };

    const adt = getRect(adtRef.current);
    const gym = getRect(gymMemberRef.current);
    const std = getRect(standardRef.current);
    const pt = getRect(ptRef.current);

    if (!adt || !gym || !std || !pt) return;

    const newLines: Line[] = [];

    newLines.push({
      from: gym.topCenter,
      to: adt.bottomCenter,
      kind: "inherit",
      active: highlightedClass === "GymMember",
    });
    newLines.push({
      from: std.topCenter,
      to: gym.bottomCenter,
      kind: "inherit",
      active:
        highlightedClass === "StandardMember" ||
        (highlightedMethod !== null &&
          METHOD_INFO[highlightedMethod].overriddenIn.includes("StandardMember")),
    });
    newLines.push({
      from: pt.topCenter,
      to: gym.bottomCenter,
      kind: "inherit",
      active:
        highlightedClass === "PTMember" ||
        (highlightedMethod !== null &&
          METHOD_INFO[highlightedMethod].overriddenIn.includes("PTMember")),
    });

    // instance-of: 카드 → 부모 박스의 "가까운 쪽" 밑면으로
    members.forEach((m, idx) => {
      const cardEl = cardRefs.current[idx];
      const cardRect = getRect(cardEl);
      if (!cardRect) return;
      const isPT = m instanceof PTMember;
      const parent = isPT ? pt : std;
      // 부모 박스 밑면에서 카드와 가까운 x 좌표 선택
      const targetX = Math.max(
        parent.leftEdge + 20,
        Math.min(cardRect.topCenter.x, parent.rightEdge - 20)
      );
      newLines.push({
        from: cardRect.topCenter,
        to: { x: targetX, y: parent.bottomEdge },
        kind: "instance",
        active:
          hoveredCardIdx === idx ||
          (hoveredLogId !== null &&
            logs.find((l) => l.id === hoveredLogId)?.memberName === m.name),
      });
    });

    setLines(newLines);
    setSvgSize({
      width: container.scrollWidth,
      height: container.scrollHeight,
    });
  };

  useLayoutEffect(() => {
    recomputeLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, highlightedClass, highlightedMethod, hoveredCardIdx, hoveredLogId, logs]);

  useEffect(() => {
    const handler = () => recomputeLines();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    const ro = new ResizeObserver(handler);
    if (diagramRef.current) ro.observe(diagramRef.current);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callMethod = (
    member: GymMember,
    methodName: "workOut" | "checkStatus" | "renew",
    idx: number
  ) => {
    let result: string[] = [];
    if (methodName === "workOut") result = [member.workOut()];
    else if (methodName === "checkStatus") result = member.checkStatus();
    else if (methodName === "renew") {
      result = [member.renew()];
      setMembers((prev) => [...prev]);
    }
    const className = member instanceof PTMember ? "PTMember" : "StandardMember";
    const newId = logIdRef.current++;
    setLogs((prev) => [
      {
        id: newId,
        memberName: member.name,
        className,
        methodName,
        result,
        isPT: member instanceof PTMember,
      },
      ...prev,
    ]);
    // 펄스 효과 트리거
    setPulsedCardIdx(idx);
    setTimeout(() => setPulsedCardIdx(null), 600);
  };

  const runFullDemo = async () => {
    for (let i = 0; i < members.length; i++) {
      callMethod(members[i], "workOut", i);
      await new Promise((r) => setTimeout(r, 450));
    }
  };

  const resetAll = () => {
    setMembers(createMembers());
    setLogs([]);
    logIdRef.current = 0;
    setHighlightedMethod(null);
    setHighlightedClass(null);
    setHoveredCardIdx(null);
    setHoveredLogId(null);
    setPulsedCardIdx(null);
  };

  const activeHighlightClasses = useMemo(() => {
    const s = new Set<string>();
    if (highlightedMethod) {
      METHOD_INFO[highlightedMethod].overriddenIn.forEach((c) => s.add(c));
    }
    if (highlightedClass) s.add(highlightedClass);
    return s;
  }, [highlightedMethod, highlightedClass]);

  const highlightedCardIdxFromLog = useMemo(() => {
    if (hoveredLogId === null) return null;
    const log = logs.find((l) => l.id === hoveredLogId);
    if (!log) return null;
    return members.findIndex((m) => m.name === log.memberName);
  }, [hoveredLogId, logs, members]);

  // 테마 색상
  const t = darkMode
    ? {
        main: "bg-slate-950 text-slate-200",
        sub: "text-slate-400",
        cardBorderL: "border-slate-700",
        cardBg: "bg-slate-900",
      }
    : {
        main: "bg-slate-50 text-slate-800",
        sub: "text-slate-500",
        cardBorderL: "border-slate-300",
        cardBg: "bg-white",
      };

  return (
    <main className={`min-h-screen ${t.main} p-6 font-mono transition-colors duration-300`}>
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-24" />
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Gym Member Management System
          </h1>
          <div className="w-24 flex justify-end gap-2">
            <button
              onClick={() => setShowHelp((s) => !s)}
              className={`px-2 py-1 text-xs rounded border ${
                darkMode
                  ? "border-slate-700 hover:border-slate-500"
                  : "border-slate-300 hover:border-slate-500"
              }`}
              title="도움말"
            >
              ?
            </button>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`px-2 py-1 text-xs rounded border ${
                darkMode
                  ? "border-slate-700 hover:border-slate-500"
                  : "border-slate-300 hover:border-slate-500"
              }`}
              title="테마 전환"
            >
              {darkMode ? "☀" : "☾"}
            </button>
          </div>
        </div>
        <p className={`text-center ${t.sub} text-sm`}>
          ADT → Base Class → Instances · Polymorphism Visualizer
        </p>

        {showHelp && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              darkMode
                ? "border-slate-700 bg-slate-900/60"
                : "border-slate-300 bg-white"
            } text-xs space-y-1.5 max-w-3xl mx-auto slide-in-down`}
          >
            <div className="font-bold text-base mb-2">
              <span className="text-indigo-400">?</span> How it works
            </div>
            <div>
              <span className="text-indigo-400">·</span> ADT 박스의{" "}
              <span className="italic">메서드명</span> hover → 그 메서드를
              오버라이딩한 서브클래스가 빛납니다.
            </div>
            <div>
              <span className="text-emerald-400">·</span> 카드 hover → 부모
              클래스 + 연결선이 강조됩니다.
            </div>
            <div>
              <span className="text-orange-400">·</span> 카드 버튼 클릭 → 해당
              인스턴스의 메서드를 호출합니다.{" "}
              <span className={t.sub}>같은 메서드, 다른 결과 = 다형성.</span>
            </div>
            <div>
              <span className="text-sky-400">·</span> <b>Run Full Demo</b> →
              5명의 workOut을 차례로 호출. 다형성이 한 화면에 펼쳐집니다.
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={runFullDemo}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-sm font-bold transition shadow-lg shadow-indigo-500/30"
          >
            ▶ Run Full Demo
          </button>
          <button
            onClick={resetAll}
            className={`px-4 py-2 rounded-md border ${
              darkMode
                ? "border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                : "border-slate-300 hover:border-slate-500 hover:bg-slate-100"
            } text-sm transition`}
          >
            ↻ Reset
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={diagramRef} className="lg:col-span-2 relative">
          <svg
            className="absolute inset-0 pointer-events-none z-0"
            width={svgSize.width}
            height={svgSize.height}
            style={{ overflow: "visible" }}
          >
            <defs>
              <marker
                id="inheritArrow"
                viewBox="0 0 12 12"
                refX="12"
                refY="6"
                markerWidth="14"
                markerHeight="14"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 12 6 L 0 12 z"
                  fill="none"
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  strokeWidth="1.5"
                />
              </marker>
              <marker
                id="inheritArrowActive"
                viewBox="0 0 12 12"
                refX="12"
                refY="6"
                markerWidth="14"
                markerHeight="14"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 12 6 L 0 12 z" fill="none" stroke="#a78bfa" strokeWidth="2" />
              </marker>
              <marker
                id="instanceArrow"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={darkMode ? "#475569" : "#94a3b8"} />
              </marker>
              <marker
                id="instanceArrowActive"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>

            {lines.map((line, i) => {
              if (line.kind === "inherit") {
                const stroke = line.active ? "#a78bfa" : darkMode ? "#64748b" : "#94a3b8";
                const sw = line.active ? 2 : 1.2;
                const marker = line.active ? "url(#inheritArrowActive)" : "url(#inheritArrow)";
                return (
                  <line
                    key={i}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke={stroke}
                    strokeWidth={sw}
                    markerEnd={marker}
                    className="transition-all duration-200"
                  />
                );
              } else {
                const stroke = line.active ? "#f59e0b" : darkMode ? "#475569" : "#94a3b8";
                const sw = line.active ? 2 : 1;
                const marker = line.active
                  ? "url(#instanceArrowActive)"
                  : "url(#instanceArrow)";
                return (
                  <line
                    key={i}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeDasharray="4 4"
                    markerEnd={marker}
                    className="transition-all duration-200"
                  />
                );
              }
            })}
          </svg>

          <div className="relative z-10 space-y-12">
            <div ref={adtRef}>
              <ClassBox
                tag="⟪ Abstract ⟫ ADT Class"
                name="MemberADT"
                color="indigo"
                isHighlighted={false}
                darkMode={darkMode}
              >
                <div className={`${darkMode ? "text-slate-400" : "text-slate-500"} italic`}>
                  + name · type · days · todayPart
                </div>
                <div className="space-y-0.5">
                  {(["workOut", "checkStatus", "renew"] as const).map((method) => (
                    <button
                      key={method}
                      onMouseEnter={() => setHighlightedMethod(method)}
                      onMouseLeave={() => setHighlightedMethod(null)}
                      className={`block w-full text-left italic transition px-2 py-0.5 rounded ${
                        highlightedMethod === method
                          ? "bg-indigo-500/20 text-indigo-300"
                          : darkMode
                          ? "text-slate-400 hover:bg-slate-800"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      + {method}()
                    </button>
                  ))}
                </div>
                {highlightedMethod && (
                  <div
                    className={`mt-2 pt-2 border-t ${
                      darkMode ? "border-slate-700" : "border-slate-300"
                    } text-xs text-indigo-${darkMode ? "300" : "600"}`}
                  >
                    {METHOD_INFO[highlightedMethod].description}
                    <br />
                    <span className={darkMode ? "text-slate-500" : "text-slate-400"}>
                      Overridden in:{" "}
                      {METHOD_INFO[highlightedMethod].overriddenIn.length === 0
                        ? "(없음 - 그대로 상속)"
                        : METHOD_INFO[highlightedMethod].overriddenIn.join(", ")}
                    </span>
                  </div>
                )}
              </ClassBox>
            </div>

            <div ref={gymMemberRef}>
              <ClassBox
                tag="Base Class · Implementation"
                name="GymMember"
                color="sky"
                isHighlighted={highlightedClass === "GymMember"}
                darkMode={darkMode}
              >
                <div className={darkMode ? "text-slate-400" : "text-slate-500"}>
                  - _name · _days · _type · _todayPart
                </div>
                <div className="space-y-0.5">
                  {(["workOut", "checkStatus", "renew"] as const).map((method) => (
                    <div
                      key={method}
                      className={`px-2 py-0.5 rounded transition ${
                        highlightedMethod === method
                          ? "bg-sky-500/20 text-sky-300"
                          : darkMode
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      + {method}(){method === "renew" && " = 30"}
                    </div>
                  ))}
                </div>
              </ClassBox>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div ref={standardRef} className="h-full">
                <ClassBox
                  tag="Subclass"
                  name="StandardMember"
                  color="emerald"
                  isHighlighted={activeHighlightClasses.has("StandardMember")}
                  darkMode={darkMode}
                  onHover={(hovering) =>
                    setHighlightedClass(hovering ? "StandardMember" : null)
                  }
                >
                  <div
                    className={`px-2 py-0.5 rounded ${
                      highlightedMethod === "workOut"
                        ? "bg-emerald-500/30 text-emerald-200"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    + workOut(){" "}
                    <span className="text-emerald-400 text-xs">⟪override⟫</span>
                  </div>
                </ClassBox>
              </div>
              <div ref={ptRef} className="h-full">
                <ClassBox
                  tag="Subclass"
                  name="PTMember"
                  color="orange"
                  isHighlighted={activeHighlightClasses.has("PTMember")}
                  darkMode={darkMode}
                  onHover={(hovering) =>
                    setHighlightedClass(hovering ? "PTMember" : null)
                  }
                >
                  <div className={darkMode ? "text-slate-400" : "text-slate-500"}>
                    - _trainer
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded ${
                      highlightedMethod === "workOut"
                        ? "bg-orange-500/30 text-orange-200"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    + workOut(){" "}
                    <span className="text-orange-400 text-xs">⟪override⟫</span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded ${
                      highlightedMethod === "checkStatus"
                        ? "bg-orange-500/30 text-orange-200"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    + checkStatus(){" "}
                    <span className="text-orange-400 text-xs">⟪override⟫</span>
                  </div>
                </ClassBox>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pt-4">
              {members.map((m, idx) => (
                <MemberCard
                  key={idx}
                  ref={(el: HTMLDivElement | null) => {
                    cardRefs.current[idx] = el;
                  }}
                  member={m}
                  isHighlightedFromLog={highlightedCardIdxFromLog === idx}
                  isClassHighlighted={activeHighlightClasses.has(
                    m instanceof PTMember ? "PTMember" : "StandardMember"
                  )}
                  isPulsed={pulsedCardIdx === idx}
                  darkMode={darkMode}
                  onHover={(hovering) => {
                    setHoveredCardIdx(hovering ? idx : null);
                    setHighlightedClass(
                      hovering
                        ? m instanceof PTMember
                          ? "PTMember"
                          : "StandardMember"
                        : null
                    );
                  }}
                  onCall={(method) => callMethod(m, method, idx)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div
            className={`sticky top-4 border ${
              darkMode ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"
            } rounded-lg p-4 max-h-[85vh] flex flex-col`}
          >
            <div
              className={`flex items-center justify-between mb-3 pb-2 border-b ${
                darkMode ? "border-slate-700" : "border-slate-300"
              }`}
            >
              <h2 className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                <span className="text-emerald-400">{">"}</span> Output Log
              </h2>
              <span className={`text-xs ${t.sub}`}>{logs.length} calls</span>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {logs.length === 0 && (
                <div className={`text-xs italic ${t.sub}`}>
                  카드의 버튼을 눌러 메서드를 호출해보세요.
                  <br />
                  또는 상단의 <span className="text-indigo-400">Run Full Demo</span>를
                  눌러 다형성을 확인하세요.
                </div>
              )}
              {logs.map((log) => (
                <div
                  key={log.id}
                  onMouseEnter={() => setHoveredLogId(log.id)}
                  onMouseLeave={() => setHoveredLogId(null)}
                  className={`slide-in-down text-xs border-l-2 pl-2 py-1 rounded-sm transition cursor-default ${
                    log.isPT
                      ? darkMode
                        ? "border-orange-500 bg-orange-950/30 hover:bg-orange-950/60"
                        : "border-orange-500 bg-orange-50 hover:bg-orange-100"
                      : darkMode
                      ? "border-emerald-500 bg-emerald-950/30 hover:bg-emerald-950/60"
                      : "border-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  <div className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                    <span
                      className={log.isPT ? "text-orange-500" : "text-emerald-600"}
                    >
                      {log.className}
                    </span>
                    <span className={t.sub}>·</span> {log.memberName}.{log.methodName}()
                  </div>
                  {log.result.map((line, i) => (
                    <div
                      key={i}
                      className={`${darkMode ? "text-slate-300" : "text-slate-700"} mt-0.5`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer
        className={`max-w-6xl mx-auto mt-12 pt-6 border-t ${
          darkMode ? "border-slate-800" : "border-slate-300"
        } text-center text-xs ${t.sub}`}
      >
        2026 자료구조 과제 2 · OOP Polymorphism Visualizer
        <br />
        <span className="text-[10px]">20231480 윤석주</span>
      </footer>
    </main>
  );
}

/* ─── 보조 컴포넌트 ─── */

type ClassBoxProps = {
  tag: string;
  name: string;
  color: "indigo" | "sky" | "emerald" | "orange";
  isHighlighted: boolean;
  children: React.ReactNode;
  onHover?: (hovering: boolean) => void;
  darkMode: boolean;
};

function ClassBox(props: ClassBoxProps) {
  const { tag, name, color, isHighlighted, children, onHover, darkMode } = props;
  const colorMap = {
    indigo: {
      border: "border-indigo-500",
      bg: darkMode ? "bg-indigo-950/30" : "bg-indigo-50",
      tag: "text-indigo-400",
      glow: "shadow-indigo-500/40",
      borderStyle: "border-dashed",
    },
    sky: {
      border: "border-sky-500",
      bg: darkMode ? "bg-sky-950/30" : "bg-sky-50",
      tag: "text-sky-400",
      glow: "shadow-sky-500/40",
      borderStyle: "border-solid",
    },
    emerald: {
      border: "border-emerald-500",
      bg: darkMode ? "bg-emerald-950/30" : "bg-emerald-50",
      tag: "text-emerald-500",
      glow: "shadow-emerald-500/40",
      borderStyle: "border-solid",
    },
    orange: {
      border: "border-orange-500",
      bg: darkMode ? "bg-orange-950/30" : "bg-orange-50",
      tag: "text-orange-500",
      glow: "shadow-orange-500/40",
      borderStyle: "border-solid",
    },
  };
  const c = colorMap[color];
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`h-full border-2 ${c.borderStyle} ${c.border} ${c.bg} rounded-lg p-4 transition-all duration-200 ${
        isHighlighted ? `shadow-lg ${c.glow} scale-[1.01]` : ""
      }`}
    >
      <div className={`text-[10px] uppercase tracking-widest ${c.tag} font-bold mb-1`}>
        {tag}
      </div>
      <div className={`text-xl font-bold mb-2 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
        {name}
      </div>
      <div className="text-xs space-y-0.5">{children}</div>
    </div>
  );
}

/* MemberCard — forwardRef로 카드 ref를 부모에서 잡을 수 있게 */


type MemberCardProps = {
  member: GymMember;
  isHighlightedFromLog: boolean;
  isClassHighlighted: boolean;
  isPulsed: boolean;
  darkMode: boolean;
  onHover: (hovering: boolean) => void;
  onCall: (method: "workOut" | "checkStatus" | "renew") => void;
};

const MemberCard = forwardRef<HTMLDivElement, MemberCardProps>(function MemberCard(
  props,
  ref
) {
  const {
    member,
    isHighlightedFromLog,
    isClassHighlighted,
    isPulsed,
    darkMode,
    onHover,
    onCall,
  } = props;
  const isPT = member instanceof PTMember;
  const className = isPT ? "PTMember" : "StandardMember";
  const animatedDays = useAnimatedNumber(member.days);

  const borderColor = isPT ? "border-orange-500" : "border-emerald-500";
  const bgColor = isPT
    ? darkMode
      ? "bg-orange-950/30"
      : "bg-orange-50"
    : darkMode
    ? "bg-emerald-950/30"
    : "bg-emerald-50";
  const glow =
    isHighlightedFromLog || isClassHighlighted
      ? isPT
        ? "shadow-lg shadow-orange-500/50 scale-[1.02]"
        : "shadow-lg shadow-emerald-500/50 scale-[1.02]"
      : "";
  const btnColor = isPT
    ? "bg-orange-600 hover:bg-orange-500"
    : "bg-emerald-600 hover:bg-emerald-500";

  // 펄스용 색상
  const pulseStyle: React.CSSProperties = isPulsed
    ? {
        color: isPT ? "rgba(251,146,60,0.8)" : "rgba(52,211,153,0.8)",
      }
    : {};

  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={pulseStyle}
      className={`border-2 ${borderColor} ${bgColor} ${glow} ${
        isPulsed ? "pulse-glow" : ""
      } rounded-lg p-3 transition-all duration-200`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-3xl">{isPT ? "🔥" : "🏃"}</div>
        <div>
          <div className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {member.name}
          </div>
          <div className={`text-xs ${isPT ? "text-orange-500" : "text-emerald-600"}`}>
            {className}
          </div>
        </div>
      </div>
      <div
        className={`text-xs space-y-0.5 mb-2 ${
          darkMode ? "text-slate-300" : "text-slate-700"
        }`}
      >
        <div>
          part:{" "}
          <span className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {member.todayPart}
          </span>
        </div>
        <div>
          days:{" "}
          <span
            className={`font-bold text-base ${
              darkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {animatedDays}
          </span>
        </div>
        {isPT && (
          <div>
            trainer:{" "}
            <span
              className={`font-bold ${
                darkMode ? "text-orange-300" : "text-orange-600"
              }`}
            >
              {(member as PTMember).trainer}
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {(["workOut", "checkStatus", "renew"] as const).map((method) => (
          <button
            key={method}
            onClick={() => onCall(method)}
            className={`text-[10px] text-white rounded py-1 ${btnColor} transition font-semibold`}
          >
            {method === "workOut"
              ? "workOut"
              : method === "checkStatus"
              ? "status"
              : "renew"}
          </button>
        ))}
      </div>
    </div>
  );
});