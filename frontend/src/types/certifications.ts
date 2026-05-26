export type GridSize = "1x1" | "2x1"
export type IconType = "brand" | "custom"
export type CertificationType = "certificate" | "degree"

export interface Certification {
    id?: string;
    title: string;
    issuer: string;
    year: number;
    icon: string;
    grid_size: GridSize;
    is_academic: boolean;
    display_order: number;
    icon_type: IconType;
    skill_type: CertificationType;
}
