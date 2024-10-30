export interface NodeData {
  label: string;
  shape?: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  image?: string;
}