import { GymMember } from "./gymMember";

export class PTMember extends GymMember {
  private _trainer: string;  // PT 회원만의 전용 캡슐화 변수

  constructor(name: string, days: number, trainer: string, part: string = "전신") {
    // 부모 생성자에 "PT회원" 타입을 고정해서 넘겨줌
    super(name, days, "PT회원", part);
    this._trainer = trainer;
  }

  get trainer(): string { return this._trainer; }

  // 오버라이딩: 트레이너와 함께하는 운동 스타일
  override workOut(): string {
    return `🔥 ${this.name}님: ${this._trainer} 코치님과 ${this.todayPart} 훈련하는 중 입니다! '하나 더!!'`;
  }

  // 오버라이딩: 트레이너 정보까지 포함하여 출력
  override checkStatus(): string[] {
    const base = super.checkStatus();  // 부모의 기본 출력 호출
    return [...base, `담당 트레이너 : ${this._trainer}`];
  }
}