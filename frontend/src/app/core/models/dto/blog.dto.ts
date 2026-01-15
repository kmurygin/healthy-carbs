import type {UserDto} from "@core/models/dto/user.dto";

export interface BlogComment {
  id: number;
  content: string;
  author: UserDto;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  summary: string;
  author: UserDto;
  createdAt: string;
  comments?: BlogComment[];
  imageId?: number | null;
}

export interface CreateBlogPostRequest {
  title: string;
  summary: string;
  content: string;
}

export interface CreateBlogCommentRequest {
  content: string;
}
