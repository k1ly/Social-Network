export class Pageable<T> {
  page: number;
  size: number;
  sort: keyof T;
  order: "asc" | "desc";
}