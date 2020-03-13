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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;

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
              private readonly likeService: LikeService,
              private readonly snackBar: MatSnackBar,
              private readonly progressSpinnerService: ProgressSpinnerService) { }

  ngOnInit() {
    this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
      if (!event) { return; }
      this.load(event.id);
    });
  }

  ngOnDestroy() {
    this.eventChangesSubscription.unsubscribe();
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

  private load(eventId: number) {
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.progressSpinnerService.start();
      this.cardMembers = [];
      this.eventMemberService.get(eventId).subscribe(data => {
        this.setCardMembers(data, sex);
        if (this.cardMembers && this.cardMembers.length > 0) {
          this.setLikedMembers(this.cardMembers[0]);
        }
        this.progressSpinnerService.stop();
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки участников 💔', error);
      });
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

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
