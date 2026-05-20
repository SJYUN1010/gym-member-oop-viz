"use client";

import { useState, useMemo, useRef } from "react";
import { GymMember } from "@/lib/gymMember";
import { PTMember } from "@/lib/ptMember";
import { createMembers } from "@/lib/instances";

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

export default function Home() {
  const [members, setMembers] = useState<GymMember[]>(() => createMembers());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const [highlightedMethod, setHighlightedMethod] = useState<string | null>(null);
  const [highlightedClass, setHighlightedClass] = useState<string | null>(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [hoveredLogId, setHoveredLogId] = useState<number | null>(null);

  const callMethod = (
    member: GymMember,
    methodName: "workOut" | "checkStatus" | "renew"
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
  };

  const runFullDemo = async () => {     // ← 이거 빠진 거
    for (const m of members) {
      callMethod(m, "workOut");
      await new Promise((r) => setTimeout(r, 400));
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 font-mono">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
          Gym Member Management System
        </h1>
        <p className="text-center text-slate-400 text-sm">
          ADT → Base Class → Instances · Polymorphism Visualizer
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={runFullDemo}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-sm font-bold transition shadow-lg shadow-indigo-500/30"
          >
            ▶ Run Full Demo
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-md border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-sm transition"
          >
            ↻ Reset
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <ClassBox
            tag="⟪ Abstract ⟫ ADT Class"
            name="MemberADT"
            color="indigo"
            isHighlighted={false}
          >
            <div className="text-slate-400 italic">+ name · type · days · todayPart</div>
            <div className="space-y-0.5">
              {(["workOut", "checkStatus", "renew"] as const).map((method) => (
                <button
                  key={method}
                  onMouseEnter={() => setHighlightedMethod(method)}
                  onMouseLeave={() => setHighlightedMethod(null)}
                  className={`block w-full text-left italic transition px-2 py-0.5 rounded ${
                    highlightedMethod === method
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  + {method}()
                </button>
              ))}
            </div>
            {highlightedMethod && (
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-indigo-300">
                {METHOD_INFO[highlightedMethod].description}
                <br />
                <span className="text-slate-500">
                  Overridden in:{" "}
                  {METHOD_INFO[highlightedMethod].overriddenIn.length === 0
                    ? "(없음 - 그대로 상속)"
                    : METHOD_INFO[highlightedMethod].overriddenIn.join(", ")}
                </span>
              </div>
            )}
          </ClassBox>

          <ArrowConnector label="extends" />

          <ClassBox
            tag="Base Class · Implementation"
            name="GymMember"
            color="sky"
            isHighlighted={highlightedClass === "GymMember"}
          >
            <div className="text-slate-400">
              - _name · _days · _type · _todayPart
            </div>
            <div className="space-y-0.5">
              {(["workOut", "checkStatus", "renew"] as const).map((method) => (
                <div
                  key={method}
                  className={`px-2 py-0.5 rounded transition ${
                    highlightedMethod === method
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-slate-300"
                  }`}
                >
                  + {method}(){method === "renew" && " = 30"}
                </div>
              ))}
            </div>
          </ClassBox>

          <ArrowConnector label="extends" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ClassBox
              tag="Subclass"
              name="StandardMember"
              color="emerald"
              isHighlighted={activeHighlightClasses.has("StandardMember")}
              onHover={(hovering) =>
                setHighlightedClass(hovering ? "StandardMember" : null)
              }
            >
              <div
                className={`px-2 py-0.5 rounded ${
                  highlightedMethod === "workOut"
                    ? "bg-emerald-500/30 text-emerald-200"
                    : "text-slate-300"
                }`}
              >
                + workOut(){" "}
                <span className="text-emerald-400 text-xs">⟪override⟫</span>
              </div>
            </ClassBox>
            <ClassBox
              tag="Subclass"
              name="PTMember"
              color="orange"
              isHighlighted={activeHighlightClasses.has("PTMember")}
              onHover={(hovering) =>
                setHighlightedClass(hovering ? "PTMember" : null)
              }
            >
              <div className="text-slate-400">- _trainer</div>
              <div
                className={`px-2 py-0.5 rounded ${
                  highlightedMethod === "workOut"
                    ? "bg-orange-500/30 text-orange-200"
                    : "text-slate-300"
                }`}
              >
                + workOut(){" "}
                <span className="text-orange-400 text-xs">⟪override⟫</span>
              </div>
              <div
                className={`px-2 py-0.5 rounded ${
                  highlightedMethod === "checkStatus"
                    ? "bg-orange-500/30 text-orange-200"
                    : "text-slate-300"
                }`}
              >
                + checkStatus(){" "}
                <span className="text-orange-400 text-xs">⟪override⟫</span>
              </div>
            </ClassBox>
          </div>

          <ArrowConnector label="instance-of" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {members.map((m, idx) => {
              const isPT = m instanceof PTMember;
              const className = isPT ? "PTMember" : "StandardMember";
              const isHighlightedFromLog = highlightedCardIdxFromLog === idx;
              const isClassHighlighted = activeHighlightClasses.has(className);

              const borderColor = isPT ? "border-orange-500" : "border-emerald-500";
              const bgColor = isPT ? "bg-orange-950/30" : "bg-emerald-950/30";
              const glow =
                isHighlightedFromLog || isClassHighlighted
                  ? isPT
                    ? "shadow-lg shadow-orange-500/50 scale-[1.02]"
                    : "shadow-lg shadow-emerald-500/50 scale-[1.02]"
                  : "";
              const btnColor = isPT
                ? "bg-orange-600 hover:bg-orange-500"
                : "bg-emerald-600 hover:bg-emerald-500";

              return (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    setHoveredCardIdx(idx);
                    setHighlightedClass(className);
                  }}
                  onMouseLeave={() => {
                    setHoveredCardIdx(null);
                    setHighlightedClass(null);
                  }}
                  className={`border-2 ${borderColor} ${bgColor} ${glow} rounded-lg p-3 transition-all duration-200`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl">{isPT ? "🔥" : "🏃"}</div>
                    <div>
                      <div className="font-bold text-slate-100">{m.name}</div>
                      <div
                        className={`text-xs ${
                          isPT ? "text-orange-400" : "text-emerald-400"
                        }`}
                      >
                        {className}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs space-y-0.5 mb-2 text-slate-300">
                    <div>
                      part:{" "}
                      <span className="text-slate-100 font-bold">
                        {m.todayPart}
                      </span>
                    </div>
                    <div>
                      days:{" "}
                      <span className="text-slate-100 font-bold text-base">
                        {m.days}
                      </span>
                    </div>
                    {isPT && (
                      <div>
                        trainer:{" "}
                        <span className="text-orange-300 font-bold">
                          {(m as PTMember).trainer}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["workOut", "checkStatus", "renew"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => callMethod(m, method)}
                        className={`text-[10px] text-white rounded py-1 ${btnColor} transition font-semibold`}
                      >
                        {method === "workOut" ? "workOut" : method === "checkStatus" ? "status" : "renew"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-4 border border-slate-700 rounded-lg bg-slate-900 p-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
              <h2 className="font-bold text-slate-100">
                <span className="text-emerald-400">{">"}</span> Output Log
              </h2>
              <span className="text-xs text-slate-500">{logs.length} calls</span>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {logs.length === 0 && (
                <div className="text-xs text-slate-500 italic">
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
                  className={`text-xs border-l-2 pl-2 py-1 rounded-sm transition cursor-default ${
                    log.isPT
                      ? "border-orange-500 bg-orange-950/30 hover:bg-orange-950/60"
                      : "border-emerald-500 bg-emerald-950/30 hover:bg-emerald-950/60"
                  }`}
                >
                  <div className="font-semibold text-slate-200">
                    <span
                      className={log.isPT ? "text-orange-400" : "text-emerald-400"}
                    >
                      {log.className}
                    </span>
                    <span className="text-slate-500">·</span>{" "}
                    {log.memberName}.{log.methodName}()
                  </div>
                  {log.result.map((line, i) => (
                    <div key={i} className="text-slate-300 mt-0.5">
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        2026 자료구조 과제 2 · OOP Polymorphism Visualizer
      </footer>
    </main>
  );
}

type ClassBoxProps = {
  tag: string;
  name: string;
  color: "indigo" | "sky" | "emerald" | "orange";
  isHighlighted: boolean;
  children: React.ReactNode;
  onHover?: (hovering: boolean) => void;
};

function ClassBox(props: ClassBoxProps) {
  const { tag, name, color, isHighlighted, children, onHover } = props;
  const colorMap = {
    indigo: {
      border: "border-indigo-500",
      bg: "bg-indigo-950/30",
      tag: "text-indigo-400",
      glow: "shadow-indigo-500/40",
      borderStyle: "border-dashed",
    },
    sky: {
      border: "border-sky-500",
      bg: "bg-sky-950/30",
      tag: "text-sky-400",
      glow: "shadow-sky-500/40",
      borderStyle: "border-solid",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-950/30",
      tag: "text-emerald-400",
      glow: "shadow-emerald-500/40",
      borderStyle: "border-solid",
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-950/30",
      tag: "text-orange-400",
      glow: "shadow-orange-500/40",
      borderStyle: "border-solid",
    },
  };
  const c = colorMap[color];
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`border-2 ${c.borderStyle} ${c.border} ${c.bg} rounded-lg p-4 transition-all duration-200 ${
        isHighlighted ? `shadow-lg ${c.glow} scale-[1.01]` : ""
      }`}
    >
      <div className={`text-[10px] uppercase tracking-widest ${c.tag} font-bold mb-1`}>
        {tag}
      </div>
      <div className="text-xl font-bold text-slate-100 mb-2">{name}</div>
      <div className="text-xs space-y-0.5">{children}</div>
    </div>
  );
}

function ArrowConnector({ label }: { label: string }) {
  return (
    <div className="flex justify-center items-center gap-2 py-1">
      <div className="text-slate-600 text-xs">△</div>
      <div className="text-slate-500 text-[10px] uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}