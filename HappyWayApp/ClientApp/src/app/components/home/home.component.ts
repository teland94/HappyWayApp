import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventMemberCardModel, Sex, CardLikedMember, EventMemberModel } from '../../models/event-member';
import { MatHorizontalStepper, MatSnackBar, MatStepper, MatSnackBarConfig } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { LikeService } from 'src/app/services/like.service';
import { LikeModel, SaveLikeModel } from '../../models/like.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  stepper: MatStepper;

  displayedColumns: string[] = ['number', 'liked', 'name'];
  @BlockUI() blockUI: NgBlockUI;

  cardMembers: EventMemberCardModel[];
  currentCardMember: EventMemberCardModel;

  @ViewChild(MatHorizontalStepper, { static: false }) set matStepper(stepper: MatHorizontalStepper) {
    if (!stepper) { return; }
    this.stepper = stepper;
    this.stepper._getIndicatorType = () => 'number';
  }

  constructor(private readonly eventMemberService: EventMemberService,
              private readonly likeService: LikeService,
              private readonly snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.blockUI.start();
      this.cardMembers = [];
      this.eventMemberService.get().subscribe(data => {
        this.setCardMembers(data, sex);
        if (this.cardMembers && this.cardMembers.length > 0) {
          this.setLikedMembers(this.cardMembers[0]);
        }
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки участников 💔', error);
      });
    });
  }

  selectionChanged(event: StepperSelectionEvent) {
    const currentCardMember = this.cardMembers[event.selectedIndex];
    this.setLikedMembers(currentCardMember);
  }

  getMemberNumber(index: number) {
    const cardMember = this.cardMembers[index];
    return cardMember && cardMember.member ? cardMember.member.number : index;
  }

  goBack() {
    this.stepper.previous();
  }

  goForward() {
    this.stepper.next();
  }

  isAnyLiked() {
    if (!this.currentCardMember) { return; }
    return this.currentCardMember.likedMembers.some(l => l.liked);
  }

  isAllLiked() {
    if (!this.currentCardMember) { return; }
    const numSelected = this.currentCardMember.likedMembers.filter(l => l.liked).length;
    const numRows = this.currentCardMember.likedMembers.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (!this.currentCardMember) { return; }
    const isAllLiked = this.isAllLiked();
    this.currentCardMember.likedMembers.forEach(l => l.liked = !isAllLiked);
  }

  save() {
    let likes = new Array<SaveLikeModel>();
    this.cardMembers.forEach(m => {
      const saveLike = <SaveLikeModel> {
        sourceMemberId: m.member.id,
        targetMemberIds: []
      };
      m.likedMembers.forEach(lm => {
        if (lm.liked) {
          saveLike.targetMemberIds.push(lm.id);
        }
      });
      likes.push(saveLike);
    });
    console.log(likes);

    // const cms = this.cardMembers.filter(m => m.likedMembers.some(lm => lm.liked));
    // likes = cms.map(m => m.likedMembers.map(lm => <LikeModel>{
    //     sourceMemberId: m.member.id,
    //     targetMemberId: lm.id
    //   }
    // ));

    this.likeService.saveAll(likes).subscribe(() => {
      this.snackBar.open('Успешно сохранено ❤');
    }, error => {
      this.showError('Ошибка сохранения 💔', error);
    });
  }

  private setCardMembers(members: EventMemberModel[], sex: Sex) {
    const sexMembers = members.filter(m => m.sex === sex);
    this.cardMembers = sexMembers.map(sm => {
      const oppositeSexMembers = members.filter(m => sm.sex === this.getOppositeSex(m.sex));
      return <EventMemberCardModel>{
        member: sm,
        likedMembers: oppositeSexMembers.map(lm => <CardLikedMember>{
          id: lm.id,
          number: lm.number,
          name: lm.name,
          phoneNumber: lm.phoneNumber
        })
      };
    });
  }

  private setLikedMembers(cardMember: EventMemberCardModel) {
    this.currentCardMember = cardMember;
    const setLikedLength = this.currentCardMember.likedMembers.filter(lm => typeof lm.liked !== 'undefined').length;
    if (setLikedLength === this.currentCardMember.likedMembers.length) { return; }
    this.likeService.getByMember(cardMember.member.id).subscribe(likes => {
      cardMember.likedMembers.forEach(lm => {
        lm.liked = likes.some(l => l.targetMemberId === lm.id);
      });
    });
  }

  private getOppositeSex(sex: Sex) {
    return sex === Sex.Male ? Sex.Female : Sex.Male;
  }

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
