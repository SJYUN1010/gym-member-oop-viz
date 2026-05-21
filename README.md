# Gym Member Management System — OOP Polymorphism Visualizer

> 2026 1학기 자료구조 과제 2 · OOP 설계 기반 인터랙티브 웹앱

과제 1에서 설계한 **헬스장 회원 관리 시스템**의 클래스 상속 구조와 다형성을, 웹 환경에서 인터랙티브하게 시각화한 프로젝트입니다.

🔗 **Live Demo**: [https://gym-member-oop-viz.vercel.app/]

---

## 핵심 OOP 구조
- **MemberADT**: 추상 클래스. 회원이 가져야 할 속성(`name`, `type`, `days`, `todayPart`)과 행동(`workOut`, `checkStatus`, `renew`)을 정의.
- **GymMember**: 기본 구현체. 캡슐화(`_name`, `_days` 등 private 필드) 적용.
- **StandardMember**: `workOut()`을 오버라이딩 — 혼자 묵묵히 운동하는 스타일.
- **PTMember**: `workOut()` + `checkStatus()`를 오버라이딩 — 트레이너와 함께하는 스타일, 트레이너 정보 추가.

같은 `workOut()` 호출이라도 인스턴스의 실제 클래스에 따라 결과가 달라지는 것이 **다형성(Polymorphism)** 입니다.

---

## 주요 기능

### 1. 클래스 다이어그램 시각화
ADT → Base Class → Subclass → Instances의 4단계 계층을 화면에 표시. 상속(빈 삼각형)과 instance-of(점선)를 진짜 SVG 화살표로 그려 박스 사이를 연결.

### 2. 다형성 인터랙션
- **카드 클릭** → 해당 인스턴스의 `workOut`, `checkStatus`, `renew` 메서드를 호출하고 결과를 오른쪽 로그 패널에 출력. 같은 메서드라도 클래스에 따라 다른 결과가 출력됨.
- **ADT 박스의 메서드명 hover** → 그 메서드를 오버라이딩한 서브클래스가 빛남.
- **카드 ↔ 부모 클래스 박스 양방향 강조** → 인스턴스-of 관계를 직관적으로 표현.

### 3. Run Full Demo
한 번의 클릭으로 모든 회원의 `workOut()`을 차례로 호출. 다형성의 핵심 메시지("같은 메서드, 다른 결과")가 한 화면에 펼쳐짐.

### 4. 동적 인스턴스 추가/삭제
사용자가 직접 새로운 회원 인스턴스를 만들고 삭제 가능. 유형(Standard/PT) 선택에 따라 트레이너 필드가 동적으로 표시. "클래스로부터 인스턴스를 생성한다"는 OOP의 핵심 흐름을 사용자가 직접 체험.

### 5. 추가 UX
- 다크/라이트 모드 토글
- 메서드 호출 시 카드 펄스 효과
- `renew()` 시 days 카운터의 부드러운 카운트업 애니메이션
- 새 로그 슬라이드인 / 새 카드 fade-in
- 도움말 패널

---

## 기술 스택

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (배포)

순수 React + TypeScript로 클래스를 직접 구현 (`abstract class`, `extends`, `override`) — 과제 1의 Python OOP 구조와 1:1 대응.

---

## 프로젝트 구조

---

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

---

## 제작 정보

- **학번**: 20231480
- **이름**: 윤석주
- **수업**: 2026 1학기 자료구조 (분반 : 라)
- **과제**: OOP 설계 기반 인터랙티브 웹앱 구현 및 풀사이클 배포