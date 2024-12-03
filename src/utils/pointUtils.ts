// Define the point structure
interface RoadPoint {
  x: number;
  y: number;
}

type Point2DTuple = [number, number];
type PointMapping = Map<string, Point2DTuple>;

/**
 * Convert a point tuple to a string key for the Map
 * @param point - Point tuple [x, y]
 * @returns String representation of the point
 */
function pointToKey(point: Point2DTuple): string {
  return `${point[0]},${point[1]}`;
}

/**
 * Merge points that are too close to each other and return the merged points and a mapping.
 * 
 * @param points - List of points as [x, y].
 * @param distanceThreshold - Minimum distance to consider points as the same.
 * @returns Object containing merged points and mapping from original points to their merged representatives.
 */
export function mergeClosePoints(
  points: Point2DTuple[],
  distanceThreshold: number
): {
  mergedPoints: Point2DTuple[];
  pointMapping: PointMapping;
} {
  const mergedPoints: Point2DTuple[] = [];
  const pointMapping: PointMapping = new Map();

  for (const point of points) {
    const [x, y] = point;
    let merged = false;

    for (const [mx, my] of mergedPoints) {
      // Compute Euclidean distance
      const distance = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
      
      if (distance < distanceThreshold) {
        // Map this point to the merged point
        pointMapping.set(pointToKey(point), [mx, my]);
        merged = true;
        break;
      }
    }

    if (!merged) {
      // Add a new merged point
      mergedPoints.push(point);
      pointMapping.set(pointToKey(point), point);
    }
  }

  return {
    mergedPoints,
    pointMapping
  };
}

/**
 * Convert RoadPoint to Point2DTuple
 * @param point - RoadPoint object
 * @returns Point tuple [x, y]
 */
export function roadPointToTuple(point: RoadPoint): Point2DTuple {
  return [point.x, point.y];
}

/**
 * Convert Point2DTuple to RoadPoint
 * @param point - Point tuple [x, y]
 * @returns RoadPoint object
 */
export function tupleToRoadPoint(point: Point2DTuple): RoadPoint {
  return {
    x: point[0],
    y: point[1]
  };
}
