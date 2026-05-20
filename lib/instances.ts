import { GymMember } from "./gymMember";
import { StandardMember } from "./standardMember";
import { PTMember } from "./ptMember";

// 과제 1의 main.py와 동일한 회원 인스턴스 구성
export function createMembers(): GymMember[] {
  return [
    new PTMember("윤석주", 100, "아놀드"),
    new StandardMember("유재석", 30, "가슴"),
    new PTMember("홍길동", 10, "김종국", "등"),
    new StandardMember("김철수", 15, "어깨"),
    new PTMember("김영희", 20, "로니콜먼", "하체"),
  ];
}