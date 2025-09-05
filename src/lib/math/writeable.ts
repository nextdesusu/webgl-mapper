import type { ArrayLike, IWriteableStructure } from "./types";

export abstract class ArrayBasedStructure<T extends ArrayLike> implements IWriteableStructure {
  protected _array: T;

  constructor(array: T) {
    this._array = array;
  }

  get array() {
    return this._array;
  }

  get length(): number {
    return this._array.length;
  }

  copyToArray(target: ArrayLike, offset = 0): void {
    const self = this._array;
    for (let i = 0; i < self.length; i++) {
      target[i + offset] = self[i];
    }
  }

  copyFromArray(array: ArrayLike) {
    const length = this.length;
    const otherLength = array.length;
    const totalLength = Math.min(length, otherLength);
    for (let i = 0; i < totalLength; i++) {
      this._array[i] = array[i];
    }
  }
}