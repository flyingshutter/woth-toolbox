import { HuntingMapFilterChangeHandler } from 'components/HuntingMapFilter';
import { HuntingMapLabelOptions } from 'components/HuntingMapLabel';
import { AnimalMarkerOptions, MarkerOptions, MarkerType } from 'types/markers';

type HuntingMapClickHandler = (x: number, y: number) => void;
type HuntingMapResetHandler = () => void;
type HuntingMapZoomInHandler = () => void;
type HuntingMapZoomOutHandler = () => void;

export interface HuntingMapOffsets {
  pageX: number;
  pageY: number;
  translateX: number;
  translateY: number;
}

export interface HuntingMapOptions {
  mapHeight: number;
  mapLeft: number;
  mapScale: number;
  mapTop: number;
  mapWidth: number;
}

export interface HuntingMapProps {
  animalMarkers: Array<AnimalMarkerOptions>;
  defaultScale?: number;
  genericMarkers: Array<MarkerOptions>;
  imageHeight: number;
  imageSrc: string;
  imageWidth: number;
  labels?: Array<HuntingMapLabelOptions>;
  markerRangeMap?: Map<MarkerType, number>;
  maxMarkerSize?: number;
  maxScale?: number;
  minOverflow?: number;
  minScale?: number;
  scaleIncrement?: number;
  selectedFilterTypes?: Array<MarkerType>;
  onClick?: HuntingMapClickHandler;
  onFilterChange?: HuntingMapFilterChangeHandler;
}

export interface HuntingMapToolbarProps {
  onReset: HuntingMapResetHandler;
  onZoomIn: HuntingMapZoomInHandler;
  onZoomOut: HuntingMapZoomOutHandler;
}
