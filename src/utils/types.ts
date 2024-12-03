export interface Point2D {
  x: number;
  y: number;
}

export interface Line2D {
  start: Point2D;
  end: Point2D;
}

export interface GraphData {
  nodes: Point2D[];
  lines: [number, number][];
}
