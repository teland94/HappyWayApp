export {};

declare global {
  interface Array<T> {
    replace(this: T[], predicate: (item: T) => boolean, item: T): T[];
    addOrReplaceRange(this: T[], predicate: (item: T) => boolean, items: T[]): T[];
  }
}

Array.prototype.replace = function<T> (this: T[], predicate: (item: T) => boolean, item: T): T[] {
  const index = this.findIndex(predicate);
  this[index] = {...item};
  return [...this];
};

Array.prototype.addOrReplaceRange = function<T> (this: T[], predicate: (item: T) => boolean, items: T[]): T[] {
  const itemIndex = this.findIndex(predicate);
  const start = itemIndex > -1 ? itemIndex : 0;
  this.splice(start, this.length, ...items);
  return this;
};
