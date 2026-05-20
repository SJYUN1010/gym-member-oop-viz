import { GymMember } from "./gymMember";

export class StandardMember extends GymMember {
  constructor(name: string, days: number, part: string = "전신") {
    // 부모 생성자에 "정기회원" 타입을 고정해서 넘겨줌
    super(name, days, "정기회원", part);
  }

  // 오버라이딩: 일반 회원만의 운동 스타일
  override workOut(): string {
    return `🏃 ${this.name}님: 오늘은 ${this.todayPart}하는 날! 혼자서 묵묵히 세트를 소화합니다.`;
  }
}