import { EdgeCrossingType } from './EdgeCrossingType';

export interface EdgeCrossing {
    type: EdgeCrossingType;
    index: number; // the index of the point that is still on the first side of the edge
}