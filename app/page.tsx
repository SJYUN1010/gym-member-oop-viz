"use client";

import { useState } from "react";
import { GymMember } from "@/lib/gymMember";
import { PTMember } from "@/lib/ptMember";
import { createMembers } from "@/lib/instances";

export default function Home() {
  const [members, setMembers] = useState<GymMember[]>(() => createMembers());

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        Gym Member Management System
      </h1>
      <p className="text-center text-slate-500 mb-10">
        ADT → Base Class → Instances 다형성 시각화
      </p>

      {/* ADT 박스 */}
      <section className="max-w-2xl mx-auto mb-6">
        <div className="border-2 border-dashed border-indigo-400 rounded-xl p-5 bg-white">
          <div className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">
            ⟪ Abstract ⟫ ADT Class
          </div>
          <div className="text-xl font-bold mb-3">MemberADT</div>
          <div className="text-sm text-slate-600 space-y-1">
            <div>+ name, type, days, todayPart</div>
            <div>+ workOut() · checkStatus() · renew(days)</div>
          </div>
        </div>
      </section>

      {/* 상속 화살표 (임시 텍스트) */}
      <div className="text-center text-slate-400 mb-6">△ extends</div>

      {/* Base 클래스 박스 */}
      <section className="max-w-2xl mx-auto mb-6">
        <div className="border-2 border-slate-400 rounded-xl p-5 bg-white">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Base Class (Implementation)
          </div>
          <div className="text-xl font-bold mb-3">GymMember</div>
          <div className="text-sm text-slate-600 space-y-1">
            <div>- _name · _days · _type · _todayPart</div>
            <div>+ workOut() · checkStatus() · renew(days = 30)</div>
          </div>
        </div>
      </section>

      {/* 서브클래스 두 개 */}
      <section className="max-w-4xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-emerald-400 rounded-xl p-5 bg-white">
          <div className="text-xs uppercase tracking-wider text-emerald-500 font-semibold mb-1">
            Subclass
          </div>
          <div className="text-xl font-bold mb-3">StandardMember</div>
          <div className="text-sm text-slate-600">
            + workOut() <span className="text-emerald-600">(overridden)</span>
          </div>
        </div>
        <div className="border-2 border-orange-400 rounded-xl p-5 bg-white">
          <div className="text-xs uppercase tracking-wider text-orange-500 font-semibold mb-1">
            Subclass
          </div>
          <div className="text-xl font-bold mb-3">PTMember</div>
          <div className="text-sm text-slate-600 space-y-1">
            <div>- _trainer</div>
            <div>
              + workOut(), checkStatus()
              <span className="text-orange-600"> (overridden)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 인스턴스 카드 영역 */}
      <div className="text-center text-slate-400 mb-4">↓ instance-of</div>
      <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {members.map((m, idx) => {
          const isPT = m instanceof PTMember;
          const accent = isPT
            ? "border-orange-400 bg-orange-50"
            : "border-emerald-400 bg-emerald-50";
          return (
            <div
              key={idx}
              className={`border-2 rounded-xl p-4 ${accent} text-center`}
            >
              <div className="text-4xl mb-2">{isPT ? "🔥" : "🏃"}</div>
              <div className="font-bold text-lg">{m.name}</div>
              <div className="text-xs text-slate-500 mt-1">{m.type}</div>
              <div className="text-xs text-slate-600 mt-2">
                오늘의 부위: <span className="font-semibold">{m.todayPart}</span>
              </div>
              <div className="text-xs text-slate-600">
                남은 일수:{" "}
                <span className="font-semibold">{m.days}일</span>
              </div>
              {isPT && (
                <div className="text-xs text-orange-600 mt-2">
                  트레이너: {(m as PTMember).trainer}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <p className="text-center text-slate-400 text-sm mt-10">
        다음 단계: 카드를 클릭하면 다형성 메서드가 호출됩니다 (작업 중)
      </p>
    </main>
  );
}