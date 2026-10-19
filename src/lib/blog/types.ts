export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
