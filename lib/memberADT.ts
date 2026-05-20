// 헬스장 회원 관리 시스템 - ADT (추상 클래스)
// 과제1의 member_adt.py와 1:1 대응

export abstract class MemberADT {
  // 회원의 이름
  abstract get name(): string;

  // 회원의 등급 (정기회원/PT회원)
  abstract get type(): string;

  // 남은 이용권 일수
  abstract get days(): number;

  // 오늘의 운동 부위
  abstract get todayPart(): string;

  // 운동을 수행 → 결과 문자열 반환
  abstract workOut(): string;

  // 현재 상태(이름, 남은 기간 등)를 줄 단위 배열로 반환
  abstract checkStatus(): string[];

  // 이용권을 days만큼 연장
  abstract renew(days?: number): string;
}