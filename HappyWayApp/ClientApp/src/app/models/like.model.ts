export class LikeModel {
  sourceMemberId: number;
  targetMemberId: number;
}

export class SaveLikeModel {
  sourceMemberId: number;
  targetMemberIds: number[];
}
