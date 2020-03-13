import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventMemberService } from 'src/app/services/event-member.service';
import { ResultMemberModel, EventMemberModel, ResultLikedMemberModel, Sex } from '../../models/event-member';
import { DomSanitizer } from '@angular/platform-browser';
import { LikeService } from 'src/app/services/like.service';
import { LikeModel } from '../../models/like.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { concat, Subscription } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { EventModel } from 'src/app/models/event.model';
import { getDateText } from '../../utilities';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, OnDestroy {

  private readonly matchedText = 'Здравствуйте, на "Быстрых свиданиях {{date}} в Арт-кафе «Пластилиновая ворона»" у Вас взаимные симпатии с:';
  private readonly nonMatchedText = 'Здравствуйте, на "Быстрых свиданиях {{date}} в Арт-кафе «Пластилиновая ворона»" у Вас симпатии, к сожалению, не совпали.';
  private readonly likedText = 'А также Вам проявили симпатию (Вы понравились), им Вы можете написать самостоятельно, т.к. у них Ваших контактов нет:';

  private readonly endMatchedText =
`Оцените, пожалуйста, наше мероприятие в Google:
https://g.page/HappywayKharkiv?share

Или просто добавляйтесь в соц.сетях:
Наша страничка facebook: https://www.facebook.com/happyway.club
Наш инстаграм: http://instagram.com/happyway.date`;
  private readonly endNonMatchedText =
`Наша страничка в соц.сети:
https://www.facebook.com/happyway.club
Наш инстаграм: http://instagram.com/happyway.date`;
  private readonly thanksText = 'Спасибо, что были с нами)';

  private eventChangesSubscription: Subscription;

  event: EventModel;
  members: EventMemberModel[];
  resultMembers: ResultMemberModel[];

  constructor(private readonly eventService: EventService,
              private readonly eventMemberService: EventMemberService,
              private readonly likeService: LikeService,
              private readonly sanitizer: DomSanitizer,
              private readonly snackBar: MatSnackBar,
              private readonly clipboard: Clipboard,
              private readonly progressSpinnerService: ProgressSpinnerService) { }

  ngOnInit() {
    this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
      if (!event) { return; }
      this.event = event;
      this.load(event.id);
    });
  }

  ngOnDestroy() {
    this.eventChangesSubscription.unsubscribe();
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
    this.progressSpinnerService.start();
    return this.likeService.getAllByMember(member.id).pipe(map(likes => {
      const result = <ResultMemberModel>{
        member: member,
        text: this.getResultText(member, likes)
      };
      return result;
    }));
  }

  private load(eventId: number) {
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.progressSpinnerService.start();
      this.eventMemberService.get(eventId).subscribe(data => {
        this.members = data;
        const sexMembers = data.filter(m => m.sex === sex);

        this.resultMembers = [];
        const setResultObs = sexMembers.map(m => this.getResultData(m));
        concat(...setResultObs).subscribe(resultMember => {
          this.resultMembers.push(resultMember);
          this.progressSpinnerService.stop();
        }, error => {
          this.progressSpinnerService.stop();
          this.showError('Ошибка загрузки результатов участников 💔', error);
        });

        this.progressSpinnerService.stop();
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки участиков 💔', error);
      });
    });
  }

  private getResultText(member: EventMemberModel, likes: LikeModel[]) {
    const { matched, liked } = this.getResults(member, likes);

    let resText = '';
    if (matched && matched.length > 0) {
      resText = `${this.matchedText.replace('{{date}}', getDateText(this.event.date))}\n\n`;
      const matchedMembers = this.getLikedMembers(matched);
      matchedMembers.forEach(m => {
        resText += `${this.getMemberText(m)}\n`;
      });
    } else {
      resText = `${this.nonMatchedText.replace('{{date}}', getDateText(this.event.date))}\n`;
    }
    if (liked && liked.length > 0) {
      resText += `\n${this.likedText}\n\n`;
      const likedMembers = this.getLikedMembers(liked);
      likedMembers.forEach(m => {
        resText += `${this.getMemberText(m)}\n`;
      });
    }
    if (matched && matched.length > 0) {
      resText += `\n${this.endMatchedText}\n`;
    } else {
      resText += `\n${this.endNonMatchedText}\n`;
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

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
