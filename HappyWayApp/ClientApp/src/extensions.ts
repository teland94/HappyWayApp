export {};

declare global {
  interface Array<T> {
    replace(this: T[], predicate: (item: T) => boolean, item: T): T[];
  }
}

Array.prototype.replace = function<T> (this: T[], predicate: (item: T) => boolean, item: T): T[] {
  const index = this.findIndex(predicate);
  this[index] = {...item};
  return [...this];
};
