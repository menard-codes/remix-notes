
export interface Note {
  id: number;
  title: string;
  body: string | null;
  createdAt: Date;
  updatedAt?: Date | undefined;
  authorId: number;
}