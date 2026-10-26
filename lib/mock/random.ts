export interface Rng {
  next: () => number;
  int: (maxExclusive: number) => number;
  between: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): Rng {
  const next = mulberry32(hashString(seed));

  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive);

  return {
    next,
    int,
    between: (min: number, max: number) => min + next() * (max - min),
    pick: <T>(items: readonly T[]): T => {
      const item = items[int(items.length)];

      if (item === undefined) {
        throw new Error("No se puede elegir un elemento de una lista vacía.");
      }

      return item;
    },
    shuffle: <T>(items: readonly T[]): T[] => {
      const copy = [...items];

      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = int(index + 1);
        const current = copy[index];
        const swapped = copy[swapIndex];

        if (current !== undefined && swapped !== undefined) {
          copy[index] = swapped;
          copy[swapIndex] = current;
        }
      }

      return copy;
    },
  };
}
