import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventMemberCardModel, Sex, CardLikedMember, EventMemberModel } from '../../models/event-member';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatHorizontalStepper, MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { LikeService } from 'src/app/services/like.service';
import { SaveLikeModel } from '../../models/like.model';
import { of, Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { BaseComponent } from '../base/base.component';
import {EventMemberStoreService} from '../../services/event-member-store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventSubscription: Subscription;
  private sexChangesSubscription: Subscription;
  private eventMembersSubscription: Subscription;

  stepper: MatStepper;

  displayedColumns: string[] = ['number', 'liked', 'name'];

  cardMembers: EventMemberCardModel[];
  currentCardMember: EventMemberCardModel;

  @ViewChild(MatHorizontalStepper) set matStepper(stepper: MatHorizontalStepper) {
    if (!stepper) { return; }
    setTimeout(() => {
      this.stepper = stepper;
      this.stepper._getIndicatorType = () => 'number';
    });
  }

  constructor(private readonly eventService: EventService,
              private readonly eventMemberService: EventMemberService,
              private readonly eventMemberStoreService: EventMemberStoreService,
              private readonly likeService: LikeService,
              protected readonly snackBar: MatSnackBar) {
    super(snackBar);
  }

  ngOnInit() {
    this.eventSubscription = this.eventService.eventChanges.subscribe(event => {
      if (!event) { return; }
      this.sexChangesSubscription = this.eventMemberService.sexChanges.subscribe(sex => {
        this.eventMembersSubscription = this.eventMemberStoreService.getByEventId(event.id).subscribe(data => {
          if (!data) { return; }
          this.setCardMembers(data, sex);
          if (this.cardMembers && this.cardMembers.length > 0) {
            this.setLikedMembers(this.cardMembers[0]);
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
    if (this.sexChangesSubscription) {
      this.sexChangesSubscription.unsubscribe();
    }
    if (this.eventMembersSubscription) {
      this.eventMembersSubscription.unsubscribe();
    }
  }

  selectionChanged(event: StepperSelectionEvent) {
    this.save(false);
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

  save(showSuccessMessage = true) {
    this.saveCurrentMember().subscribe(() => {
      if (showSuccessMessage) {
        this.snackBar.open('Успешно сохранено ❤');
      }
    }, error => {
      this.showError('Ошибка сохранения 💔', error);
    });
  }

  private saveCurrentMember() {
    if (!this.currentCardMember) { return of(null); }
    const member = this.currentCardMember;
    const saveLike = <SaveLikeModel> {
      sourceMemberId: member.member.id,
      targetMemberIds: []
    };
    member.likedMembers.forEach(lm => {
      if (lm.liked) {
        saveLike.targetMemberIds.push(lm.id);
      }
    });
    return this.likeService.save(saveLike);
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
    this.likeService.getByMember(cardMember.member.id).subscribe(likes => {
      cardMember.likedMembers.forEach(lm => {
        lm.liked = likes.some(l => l.targetMemberId === lm.id);
      });
    });
  }

  private getOppositeSex(sex: Sex) {
    return sex === Sex.Male ? Sex.Female : Sex.Male;
  }
}
