export type Grade = "sobresaliente" | "aprobado" | "suspendido";

export type RankingItem = {
  teamId?: string;
  teamName: string;
  grade: Grade;
  note: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  rankings?: RankingItem[];
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type BlogComment = {
  id: string;
  postId: string;
  name: string;
  text: string;
  createdAt: number;
};

export const GRADE_LABEL: Record<Grade, string> = {
  sobresaliente: "Sobresaliente",
  aprobado: "Aprobado",
  suspendido: "Suspendido",
};

export const GRADE_COLOR: Record<Grade, string> = {
  sobresaliente: "bg-emerald-500/15 text-emerald-400",
  aprobado: "bg-amber-500/15 text-amber-400",
  suspendido: "bg-red-500/15 text-red-400",
};
