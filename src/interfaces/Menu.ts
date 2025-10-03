export interface Course {
  name: string;
  diets?: string;
  price?: string;
}

export interface Menu {
  courses: Course[];
}
