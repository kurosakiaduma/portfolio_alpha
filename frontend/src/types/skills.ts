export type GridSize = "1x1" | "2x1" | "2x2"
export type IconType = "brand" | "custom" | "degree"
export type SkillType = "skill" | "certificate" | "degree"

export interface Skill {
    id?: string;
    name: string;
    icon: string;
    category: string;
    description?: string;
    grid_size: GridSize;
    is_academic: boolean;
    display_order: number;
    icon_type: IconType;
    skill_type: SkillType;
}

export interface Certification extends Skill {
  title: string;
  issuer: string;
  year: number;
}

export interface DegreeData extends Certification {
  skill_type: "degree";
  grid_size: "2x2";
  icon_type: "degree";
}