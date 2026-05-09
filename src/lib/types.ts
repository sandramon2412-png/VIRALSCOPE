export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnail: string;
  description: string;
  channelAvgViews: number;
  outlierScore: number;
  viralityRating: "explosive" | "high" | "medium" | "low";
}

export interface AnalysisResult {
  whyViral: string;
  niche: string;
  competition: "baja" | "media" | "alta";
  estimatedRPM: string;
  facelessFriendly: boolean;
  contentIdeas: string[];
  titleIdeas: string[];
  keywords: string[];
  difficulty: number; // 1-10
  opportunity: number; // 1-10
}

export interface SearchResponse {
  videos: VideoResult[];
  query: string;
  totalResults: number;
}
