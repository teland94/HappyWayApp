import {Component, OnDestroy, OnInit} from '@angular/core';
import {EventMemberService} from 'src/app/services/event-member.service';
import {EventMemberModel, ResultLikedMemberModel, ResultMemberModel} from '../../models/event-member';
import {DomSanitizer} from '@angular/platform-browser';
import {LikeService} from 'src/app/services/like.service';
import {LikeModel} from '../../models/like.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs/operators';
import {concat, Subscription} from 'rxjs';
import {EventService} from 'src/app/services/event.service';
import {EventModel} from 'src/app/models/event.model';
import {getDateText} from '../../utilities';
import {ProgressSpinnerService} from '../../services/progress-spinner.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {BaseComponent} from '../base/base.component';
import {EventPlaceViewModel} from '../../models/event-place.model';
import {EventPlaceStoreService} from "../../services/event-place-store.service";
import {EventMemberStoreService} from '../../services/event-member-store.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent extends BaseComponent implements OnInit, OnDestroy {

  private readonly matchedText = 'Здравствуйте, на "Быстрых свиданиях {{date}} в {{eventPlace}}" в {{city}} у Вас взаимные симпатии с:';
  private readonly nonMatchedText = 'Здравствуйте, на "Быстрых свиданиях {{date}} в {{eventPlace}}" в {{city}} у Вас симпатии, к сожалению, не совпали.';
  private readonly likedText = 'А также Вам проявили симпатию (Вы понравились), им Вы можете написать самостоятельно, т.к. у них Ваших контактов нет:';

  private readonly endMatchedText =
`Оцените, пожалуйста, наше мероприятие в Google:
{{googleUrl}}

Или просто добавляйтесь в соц.сетях:
Наша страничка facebook: {{facebookUrl}}
Наш инстаграм: {{instagramUrl}}`;
  private readonly endNonMatchedText =
`Наша страничка в соц.сети:
{{facebookUrl}}
Наш инстаграм: {{instagramUrl}}`;
  private readonly thanksText = 'Спасибо, что были с нами)';

  private eventChangesSubscription: Subscription;
  private sexChangesSubscription: Subscription;
  private eventMembersSubscription: Subscription;

  event: EventModel;
  eventPlace: EventPlaceViewModel;
  members: EventMemberModel[];
  resultMembers: ResultMemberModel[];

  constructor(private readonly eventService: EventService,
              private readonly eventPlaceStoreService: EventPlaceStoreService,
              private readonly eventMemberService: EventMemberService,
              private readonly eventMemberStoreService: EventMemberStoreService,
              private readonly likeService: LikeService,
              private readonly sanitizer: DomSanitizer,
              protected readonly snackBar: MatSnackBar,
              private readonly clipboard: Clipboard,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
      if (!event) { return; }
      this.event = event;
      this.eventPlaceStoreService.eventPlaces$.subscribe(eventPlaces => {
        if (!eventPlaces) { return; }
        this.eventPlace = eventPlaces.find(ep => ep.id === this.event.eventPlaceId);
        this.sexChangesSubscription = this.eventMemberService.sexChanges.subscribe(sex => {
          this.eventMembersSubscription = this.eventMemberStoreService.getByEventId(event.id).subscribe(eventMembers => {
            if (!eventMembers) { return; }
            this.members = eventMembers;
            const sexMembers = eventMembers.filter(m => m.sex === sex);
            this.resultMembers = [];
            const setResultObs = sexMembers.map(m => this.getResultData(m));
            this.progressSpinnerService.start();
            concat(...setResultObs).subscribe(resultMember => {
              this.resultMembers.push(resultMember);
              this.progressSpinnerService.stop();
            }, error => {
              this.progressSpinnerService.stop();
              this.showError('Ошибка загрузки результатов участников 💔', error);
            });
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.eventChangesSubscription.unsubscribe();
    if (this.sexChangesSubscription) {
      this.sexChangesSubscription.unsubscribe();
    }
    if (this.eventMembersSubscription) {
      this.eventMembersSubscription.unsubscribe();
    }
  }

  getViberUrl(phoneNumber: string) {
    const trimmedPhoneNumber = phoneNumber.replace(/\s/g, '');
    const fullPhoneNumber =
      trimmedPhoneNumber.startsWith('0')
      ? `+38${trimmedPhoneNumber}`
      : `+${trimmedPhoneNumber}`;
    return this.sanitizer.bypassSecurityTrustUrl(`viber://chat?number=${fullPhoneNumber}`);
  }

  copy(text: string) {
    this.clipboard.copy(text);
    this.snackBar.open('Успешно скопировано ❤');
  }

  private getResultData(member: EventMemberModel) {
    return this.likeService.getAllByMember(member.id).pipe(map(likes => {
      return <ResultMemberModel>{
        member: member,
        text: this.getResultText(member, likes)
      };
    }));
  }

  private getResultText(member: EventMemberModel, likes: LikeModel[]) {
    const { matched, liked } = this.getResults(member, likes);

    let resText = '';
    if (matched && matched.length > 0) {
      resText = `${this.matchedText.replace('{{date}}', getDateText(this.event.date))
        .replace('{{eventPlace}}', this.eventPlace.name)
        .replace('""', '"')
        .replace('{{city}}', this.eventPlace.city.nameGenitive)}\n\n`;
      const matchedMembers = this.getLikedMembers(matched);
      matchedMembers.forEach(m => {
        resText += `${this.getMemberText(m)}\n`;
      });
    } else {
      resText = `${this.nonMatchedText.replace('{{date}}', getDateText(this.event.date))
        .replace('{{eventPlace}}', this.eventPlace.name)
        .replace('""', '"')
        .replace('{{city}}', this.eventPlace.city.nameGenitive)}\n`;
    }
    if (liked && liked.length > 0) {
      resText += `\n${this.likedText}\n\n`;
      const likedMembers = this.getLikedMembers(liked);
      likedMembers.forEach(m => {
        resText += `${this.getMemberText(m)}\n`;
      });
    }
    if (matched && matched.length > 0) {
      resText += `\n${this.endMatchedText
        .replace('{{googleUrl}}', this.eventPlace.googleUrl)
        .replace('{{facebookUrl}}', this.eventPlace.facebookUrl)
        .replace('{{instagramUrl}}', this.eventPlace.instagramUrl)}\n`;
    } else {
      resText += `\n${this.endNonMatchedText
        .replace('{{facebookUrl}}', this.eventPlace.facebookUrl)
        .replace('{{instagramUrl}}', this.eventPlace.instagramUrl)}\n`;
    }
    resText += `\n${this.thanksText}`;
    return resText;
  }

  private getLikedMembers(likeIds: number[]) {
    const likedMembers = likeIds.map(memberId => {
      const member = this.members.find(m => m.id === memberId);
      return <ResultLikedMemberModel>{
        number: member.number,
        name: member.name,
        phoneNumber: member.phoneNumber
      };
    });
    return likedMembers.sort((am, bm) => am.number - bm.number);
  }

  private getMemberText(member: ResultLikedMemberModel) {
    return `№ ${member.number} - ${member.name} - ${member.phoneNumber}`;
  }

  private getResults(member: EventMemberModel, likes: LikeModel[]) {
    const matched = likes.filter(l => l.targetMemberId === member.id
      && likes.some(sl => sl.targetMemberId === l.sourceMemberId))
      .map(l => l.sourceMemberId);
    const liked = likes.filter(l => l.targetMemberId === member.id
      && !matched.some(m => m === l.sourceMemberId))
      .map(l => l.sourceMemberId);
    return { matched, liked };
  }
}
