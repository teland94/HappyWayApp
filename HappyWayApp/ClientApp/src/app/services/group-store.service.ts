import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GroupModel} from '../models/group.model';
import {map} from 'rxjs/operators';
import {GroupService} from './group.service';
import '../../extensions';

@Injectable({
  providedIn: 'root'
})
export class GroupStoreService {

  private _groups = new BehaviorSubject<GroupModel[]>(null);
  readonly groups$ = this._groups.asObservable();

  constructor(private groupService: GroupService) { }

  get groups() {
    return this._groups.getValue();
  }

  set groups(val: GroupModel[]) {
    this._groups.next(val);
  }

  create(group: GroupModel) {
    return this.groupService.create(group)
      .pipe(map(data => {
        this.groups = [
          ...this.groups,
          data
        ];
        return data;
      }));
  }

  update(group: GroupModel) {
    return this.groupService.update(group)
      .pipe(map(data => {
        this.groups = this.groups.replace(g => g.id === group.id, group);
        return data;
      }));
  }

  delete(id: number) {
    return this.groupService.delete(id)
      .pipe(map(data => {
        this.groups = this.groups.filter(g => g.id !== id);
        return data;
      }));
  }

  fetchAll() {
    return this.groupService.get()
      .pipe(map(data => {
        this.groups = data;
        return data;
      }));
  }
}
