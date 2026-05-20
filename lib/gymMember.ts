import { MemberADT } from "./memberADT";

export class GymMember extends MemberADT {
  // Python의 __name, __days 같은 private 필드를 TS의 private으로 표현
  private _name: string;
  private _days: number;
  private _type: string;
  private _todayPart: string;

  constructor(name: string, days: number, type: string, part: string = "전신") {
    super();
    this._name = name;
    this._days = days;
    this._type = type;
    this._todayPart = part;
  }

  get name(): string { return this._name; }
  get days(): number { return this._days; }
  get type(): string { return this._type; }
  get todayPart(): string { return this._todayPart; }

  workOut(): string {
    return `${this.name}님이 ${this.todayPart} 운동을 준비합니다.`;
  }

  checkStatus(): string[] {
    return [
      `회원 이름 : ${this.name}`,
      `회원 등급 : ${this.type}`,
      `남은 일수 : ${this.days}일`,
    ];
  }

  renew(days: number = 30): string {
    this._days += days;
    return `✅[연장 완료] ${this.name}님의 남은 기간이 ${this.days}일이 되었습니다`;
  }
}