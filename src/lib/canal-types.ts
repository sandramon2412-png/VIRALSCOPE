export interface CanalInfo {
  id: string;
  nombre: string;
  handle: string;
  descripcion: string;
  suscriptores: number;
  totalVideos: number;
  totalVistas: number;
  avatar: string;
  banner: string;
  fechaCreacion: string;
  pais: string;
  avgViewsUltimos10: number;
}

export interface CanalVideo {
  id: string;
  titulo: string;
  thumbnail: string;
  vistas: number;
  likes: number;
  comentarios: number;
  publicadoEn: string;
  outlierScore: number;
  viralityRating: "explosive" | "high" | "medium" | "low";
  duracion: string;
}

export interface CanalAnalysis {
  nicho: string;
  subnicho: string;
  estilo: string;
  frecuenciaIdeal: string;
  formatosDominantes: string[];
  patronTitulos: string;
  fortalezas: string[];
  debilidades: string[];
  estrategiaEmulacion: string[];
  planAccion: string[];
  dificultadCompetir: number; // 1-10
  oportunidad: string;
  keywords: string[];
  tiempoEstimadoResultados: string;
}
