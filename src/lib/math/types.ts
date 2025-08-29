export type ArrayLike = {
  length: number;
  [index: number]: number;
}

export interface IWriteableStructure {
  copyToArray(target: ArrayLike, offset?: number): void;
  get length(): number;
}