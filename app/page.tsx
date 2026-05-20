"use client";

import { useState } from "react";
import { GymMember } from "@/lib/gymMember";
import { PTMember } from "@/lib/ptMember";
import { createMembers } from "@/lib/instances";

type LogEntry = {
  id: number;
  memberName: string;
  methodName: string;
  result: string[];
  isPT: boolean;
};

export default function Home() {
  const [members, setMembers] = useState<GymMember[]>(() => createMembers());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logIdCounter, setLogIdCounter] = useState(0);

  // 메서드 호출 → 로그 추가, 상태 변경되면 리렌더 트리거
  const callMethod = (
    member: GymMember,
    methodName: "workOut" | "checkStatus" | "renew"
  ) => {
    let result: string[] = [];
    if (methodName === "workOut") {
      result = [member.workOut()];
    } else if (methodName === "checkStatus") {
      result = member.checkStatus();
    } else if (methodName === "renew") {
      result = [member.renew()];
      // renew는 내부 _days를 변경하므로 리렌더 트리거 필요
      setMembers([...members]);
    }
    setLogs((prev) => [
      {
        id: logIdCounter,
        memberName: member.name,
        methodName,
        result,
        isPT: member instanceof PTMember,
      },
      ...prev,
    ]);
    setLogIdCounter((c) => c + 1);
  };

  const resetAll = () => {
    setMembers(createMembers());
    setLogs([]);
    setLogIdCounter(0);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        Gym Member Management System
      </h1>
      <p className="text-center text-slate-500 mb-8">
        ADT → Base Class → Instances 다형성 시각화
      </p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 2/3: 클래스 다이어그램 + 인스턴스 카드 */}
        <div className="lg:col-span-2 space-y-4">
          {/* ADT 박스 */}
          <div className="border-2 border-dashed border-indigo-400 rounded-xl p-4 bg-white">
            <div className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">
              ⟪ Abstract ⟫ ADT Class
            </div>
            <div className="text-lg font-bold mb-2">MemberADT</div>
            <div className="text-sm text-slate-600 space-y-0.5">
              <div>+ name · type · days · todayPart</div>
              <div className="italic">+ workOut() · checkStatus() · renew(days)</div>
            </div>
          </div>

          <div className="text-center text-slate-400 text-sm">△ extends</div>

          {/* Base 박스 */}
          <div className="border-2 border-slate-400 rounded-xl p-4 bg-white">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Base Class (Implementation)
            </div>
            <div className="text-lg font-bold mb-2">GymMember</div>
            <div className="text-sm text-slate-600 space-y-0.5">
              <div>- _name · _days · _type · _todayPart</div>
              <div>+ workOut() · checkStatus() · renew(days = 30)</div>
            </div>
          </div>

          {/* Subclass 2개 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border-2 border-emerald-400 rounded-xl p-4 bg-white">
              <div className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                Subclass
              </div>
              <div className="text-lg font-bold mb-2">StandardMember</div>
              <div className="text-sm text-slate-600">
                + workOut() <span className="text-emerald-600 font-semibold">⟪override⟫</span>
              </div>
            </div>
            <div className="border-2 border-orange-400 rounded-xl p-4 bg-white">
              <div className="text-xs uppercase tracking-wider text-orange-600 font-semibold mb-1">
                Subclass
              </div>
              <div className="text-lg font-bold mb-2">PTMember</div>
              <div className="text-sm text-slate-600 space-y-0.5">
                <div>- _trainer</div>
                <div>
                  + workOut(), checkStatus(){" "}
                  <span className="text-orange-600 font-semibold">⟪override⟫</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-400 text-sm pt-2">
            ↓ instance-of
          </div>

          {/* 인스턴스 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {members.map((m, idx) => {
              const isPT = m instanceof PTMember;
              const accent = isPT
                ? "border-orange-400 bg-orange-50"
                : "border-emerald-400 bg-emerald-50";
              const btnAccent = isPT
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-emerald-500 hover:bg-emerald-600";
              return (
                <div
                  key={idx}
                  className={`border-2 rounded-xl p-3 ${accent}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl">{isPT ? "🔥" : "🏃"}</div>
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.type}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">
                    오늘의 부위:{" "}
                    <span className="font-semibold">{m.todayPart}</span>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">
                    남은 일수:{" "}
                    <span className="font-semibold text-base">{m.days}일</span>
                  </div>
                  {isPT && (
                    <div className="text-xs text-slate-600 mb-2">
                      트레이너:{" "}
                      <span className="font-semibold">
                        {(m as PTMember).trainer}
                      </span>
                    </div>
                  )}
                  {/* 3개 메서드 버튼 */}
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <button
                      onClick={() => callMethod(m, "workOut")}
                      className={`text-xs text-white rounded py-1 ${btnAccent} transition`}
                    >
                      workOut
                    </button>
                    <button
                      onClick={() => callMethod(m, "checkStatus")}
                      className={`text-xs text-white rounded py-1 ${btnAccent} transition`}
                    >
                      status
                    </button>
                    <button
                      onClick={() => callMethod(m, "renew")}
                      className={`text-xs text-white rounded py-1 ${btnAccent} transition`}
                    >
                      renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽 1/3: 출력 로그 */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 border-2 border-slate-300 rounded-xl bg-white p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Output Log</h2>
              <button
                onClick={resetAll}
                className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {logs.length === 0 && (
                <div className="text-sm text-slate-400 italic">
                  카드의 버튼을 눌러 메서드를 호출해보세요
                </div>
              )}
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`text-xs border-l-4 pl-2 py-1 ${
                    log.isPT
                      ? "border-orange-400 bg-orange-50"
                      : "border-emerald-400 bg-emerald-50"
                  }`}
                >
                  <div className="font-semibold">
                    {log.memberName}.{log.methodName}()
                  </div>
                  {log.result.map((line, i) => (
                    <div key={i} className="text-slate-700">
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}