type NamedItem = {
  name: string;
};

function normalizeForSort(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function sortByName<T extends NamedItem>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftName = normalizeForSort(left.item.name);
      const rightName = normalizeForSort(right.item.name);

      if (leftName < rightName) {
        return -1;
      }

      if (leftName > rightName) {
        return 1;
      }

      return left.index - right.index;
    })
    .map(({ item }) => item);
}
