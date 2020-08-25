export class EventMemberModel {
  id: number;
  number: number;
  name: string;
  sex: Sex;
  phoneNumber: string;
  eventId: number;
}

export class EventMemberCardModel {
  member: EventMemberModel;
  targetMembers: CardTargetMember[];
}

export class CardTargetMember {
  id: number;
  number: number;
  liked: boolean;
  name: string;
  phoneNumber: string;
}

export class ResultMemberModel {
  member: EventMemberModel;
  text: string;
}

export class ResultLikedMemberModel {
  number: number;
  name: string;
  phoneNumber: string;
}

export enum Sex {
  Male,
  Female
}
