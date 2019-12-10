import { Component, OnInit } from '@angular/core';
import { EventMemberService } from 'src/app/services/event-member.service';
import { ResultMemberModel, EventMemberModel, ResultLikedMemberModel } from '../../models/event-member';
import { DomSanitizer } from '@angular/platform-browser';
import { LikeService } from 'src/app/services/like.service';
import { LikeModel } from '../../models/like.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSnackBar } from '@angular/material';
import { map } from 'rxjs/operators';
import { concat } from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  private readonly matchedText = 'Здравствуйте, на "Быстрых свиданиях 8.12 в Арт-кафе «Пластилиновая ворона»" у Вас взаимные симпатии с:';
  private readonly nonMatchedText = 'Здравствуйте, на "Быстрых свиданиях 8.12 в Арт-кафе «Пластилиновая ворона»" у Вас симпатии, к сожалению, не совпали.';
  private readonly likedText = 'А также Вам проявили симпатию (Вы понравились), им Вы можете написать самостоятельно, т.к. у них Ваших контактов нет:';

  private readonly endMatchedText = `Оцените, пожалуйста, наше мероприятие в GOOGLE
https://local.google.com/place?id=13114540300414977696&use=srp

Или просто добавляйтесь в соц.сетях:
Наша страничка facebook: https://www.facebook.com/happyway.club
Наш инстаграм: http://instagram.com/happyway.date`;
  private readonly endNonMatchedText = `Наша страничка в соц.сети:
https://www.facebook.com/happyway.club
Наш инстаграм: http://instagram.com/happyway.date/`;
  private readonly thanksText = 'Спасибо, что были с нами)';

  @BlockUI() blockUI: NgBlockUI;

  members: EventMemberModel[];
  resultMembers: ResultMemberModel[];

  constructor(private readonly eventMemberService: EventMemberService,
              private readonly likeService: LikeService,
              private readonly sanitizer: DomSanitizer,
              private readonly snackBar: MatSnackBar,
              private readonly clipboardService: ClipboardService) { }

  ngOnInit() {
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.blockUI.start();
      this.eventMemberService.get().subscribe(data => {
        this.members = data;
        const sexMembers = data.filter(m => m.sex === sex);

        this.resultMembers = [];
        const setResultObs = sexMembers.map(m => this.getResultData(m));
        concat(...setResultObs).subscribe(resultMember => {
          this.resultMembers.push(resultMember);
          this.blockUI.stop();
        }, error => {
          this.blockUI.stop();
          console.log('Load members error', error);
          this.snackBar.open('Ошибка загрузки результатов участников 💔');
        });

        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        console.log('Load members error', error);
        this.snackBar.open('Ошибка загрузки участиков 💔');
      });
    });
  }

  getLinesCount(str: string) {
    return str.split(/\r\n|\r|\n/).length;
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
    this.clipboardService.copyFromContent(text);
  }

  private getResultData(member: EventMemberModel) {
    this.blockUI.start();
    return this.likeService.getAllByMember(member.id).pipe(map(likes => {
      const result = <ResultMemberModel>{
        member: member,
        text: this.getResultText(member, likes)
      };
      return result;
    }));
  }

  private getResultText(member: EventMemberModel, likes: LikeModel[]) {
    const { matched, liked } = this.getResults(member, likes);

    let resText = '';
    if (matched && matched.length > 0) {
      resText = `${this.matchedText}\n\n`;
      const matchedMembers = this.getLikedMembers(matched);
      matchedMembers.forEach(m => {
        resText += `${this.getMemberText(m)}\n`;
      });
    } else {
      resText = `${this.nonMatchedText}\n`;
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
}
