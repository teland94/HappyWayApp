import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventMemberCardModel, Sex, CardTargetMember, EventMemberModel } from '../../models/event-member';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatHorizontalStepper, MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { LikeService } from 'src/app/services/like.service';
import { SaveLikeModel } from '../../models/like.model';
import { combineLatest, of, Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { BaseComponent } from '../base/base.component';
import { EventMemberStoreService } from '../../services/event-member-store.service';
import { switchMap } from 'rxjs/operators';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { EventModel } from '../../models/event.model';
import { isSame } from '../../utilities';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventMembersSubscription: Subscription;
  private hasChanges: boolean;

  stepper: MatStepper;

  displayedColumns: string[] = ['number', 'liked', 'name'];

  event: EventModel;
  cardMembers: EventMemberCardModel[];
  currentCardMember: EventMemberCardModel;
  currentCardMemberLikedIds: number[];

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
              protected readonly snackBar: MatSnackBar,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.progressSpinnerService.start();
    this.eventMembersSubscription = this.getEventMembers().subscribe(([sex, eventMembers]) => {
      if (!eventMembers) { this.progressSpinnerService.stop(); return; }
      this.cardMembers = null;
      setTimeout(() => {
        this.setCardMembers(eventMembers, sex);
        if (this.cardMembers && this.cardMembers.length > 0) {
          this.setLikedTargetMembers(this.cardMembers[0]);
        }
      });
      this.progressSpinnerService.stop();
    }, error => {
      this.progressSpinnerService.stop();
      this.showError('Ошибка загрузки симпатий 💔', error);
    });
  }

  ngOnDestroy() {
    this.eventMembersSubscription.unsubscribe();
  }

  selectionChanged(event: StepperSelectionEvent) {
    if (this.hasChanges) {
      this.save(false);
    }
    const currentCardMember = this.cardMembers[event.selectedIndex];
    this.setLikedTargetMembers(currentCardMember);
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

  likeMember() {
    if (!this.currentCardMember) { return; }
    const ids = this.currentCardMember.targetMembers.filter(lm => lm.liked).map(lm => lm.id);
    this.hasChanges = !isSame(this.currentCardMemberLikedIds, ids);
  }

  isAnyLiked() {
    if (!this.currentCardMember) { return; }
    return this.currentCardMember.targetMembers.some(l => l.liked);
  }

  isAllLiked() {
    if (!this.currentCardMember) { return; }
    const numSelected = this.currentCardMember.targetMembers.filter(l => l.liked).length;
    const numRows = this.currentCardMember.targetMembers.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (!this.currentCardMember) { return; }
    const isAllLiked = this.isAllLiked();
    this.currentCardMember.targetMembers.forEach(l => l.liked = !isAllLiked);
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
    const saveLike = <SaveLikeModel>{
      sourceMemberId: member.member.id,
      targetMemberIds: []
    };
    member.targetMembers.forEach(lm => {
      if (lm.liked) {
        saveLike.targetMemberIds.push(lm.id);
      }
    });
    return this.likeService.save(saveLike);
  }

  private setLikedTargetMembers(cardMember: EventMemberCardModel) {
    this.currentCardMember = cardMember;
    this.currentCardMemberLikedIds = [];
    this.likeService.getByMember(cardMember.member.id).subscribe(likes => {
      cardMember.targetMembers.forEach(lm => {
        if (likes.some(l => l.targetMemberId === lm.id)) {
          lm.liked = true;
          this.currentCardMemberLikedIds.push(lm.id);
        }
      });
      this.hasChanges = false;
    });
  }

  private setCardMembers(members: EventMemberModel[], sex: Sex) {
    const sexMembers = members.filter(m => m.sex === sex);
    this.cardMembers = sexMembers.map(sm => {
      const oppositeSexMembers = members.filter(m => sm.sex === this.getOppositeSex(m.sex));
      return <EventMemberCardModel>{
        member: sm,
        targetMembers: oppositeSexMembers.map(lm => <CardTargetMember>{
          id: lm.id,
          number: lm.number,
          name: lm.name,
          phoneNumber: lm.phoneNumber
        })
      };
    });
  }

  private getEventMembers() {
    return this.eventService.eventChanges.pipe(switchMap(event => {
      this.event = event;
      if (!event) { return combineLatest([of<Sex>(null), of<EventMemberModel[]>(null)]); }
      return combineLatest([this.eventMemberService.sexChanges, this.eventMemberStoreService.getByEventId(event.id)]);
    }));
  }

  private getOppositeSex(sex: Sex) {
    return sex === Sex.Male ? Sex.Female : Sex.Male;
  }
}
