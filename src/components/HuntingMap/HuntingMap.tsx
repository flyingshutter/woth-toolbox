import {
  memo,
  MouseEvent,
  TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEvent,
} from 'react';
import { LoadingOverlay } from 'components/LoadingOverlay';
import { isMarkerEnabled } from 'lib/markers';
import { HuntingMapFilter } from './HuntingMapFilter';
import { HuntingMapMarkerAnimal } from './HuntingMapMarkerAnimal';
import { HuntingMapMarkerGeneric } from './HuntingMapMarkerGeneric';
import { HuntingMapToolbar } from './HuntingMapToolbar';
import { HuntingMapOffsets, HuntingMapOptions, HuntingMapProps } from './types';
import styles from './HuntingMap.module.css';

const HuntingMapMarkerAnimalMemo = memo(HuntingMapMarkerAnimal);
const HuntingMapMarkerGenericMemo = memo(HuntingMapMarkerGeneric);

export const HuntingMap = (props: HuntingMapProps) => {
  const {
    animalMarkers = [],
    defaultScale = 0.25,
    enabledTypes,
    genericMarkers = [],
    imageHeight,
    imageSrc,
    imageWidth,
    markerFilter = [],
    markerVisibilityMap = new Map(),
    maxMarkerSize = 38,
    maxScale = 2.5,
    minOverflow = 200,
    minScale = 0.2,
    scaleIncrement = 0.02,
    onClick,
    onFilterChange,
  } = props;

  // References to internal elements
  const imageRef = useRef<HTMLImageElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Variable holding mouse offset on mousedown on the image
  const imageMouseDownOffset = useRef<[number, number]>([0, 0]);

  // Flag indicating whether the map is currently being dragged
  const isDragging = useRef(false);

  // Information containing pointer offsets at the start of the drag operation
  const [dragStart, setDragStart] = useState<HuntingMapOffsets>({
    pageX: 0,
    pageY: 0,
    translateX: 0,
    translateY: 0,
  });

  // Flag indicating that the map image has loaded
  const [imageLoaded, setImageLoaded] = useState(false);

  // Current map offsets and options
  const [options, setOptions] = useState<HuntingMapOptions>({
    mapHeight: imageHeight * defaultScale,
    mapLeft: 0,
    mapScale: defaultScale,
    mapTop: 0,
    mapWidth: imageWidth * defaultScale,
  });

  // List of animal map marker elements
  const markerListAnimals = useMemo(
    () =>
      animalMarkers
        .filter(marker => isMarkerEnabled(marker.type, enabledTypes))
        .map((marker, index) => (
          <HuntingMapMarkerAnimalMemo
            key={index}
            mapScale={options.mapScale}
            marker={marker}
            markerFilter={markerFilter}
            markerVisibilityMap={markerVisibilityMap}
            maxMarkerSize={maxMarkerSize}
          />
        )),
    [
      animalMarkers,
      enabledTypes,
      markerFilter,
      markerVisibilityMap,
      maxMarkerSize,
      options.mapScale,
    ],
  );

  // List of generic map marker elements
  const markerListGeneric = useMemo(
    () =>
      genericMarkers
        .filter(marker => isMarkerEnabled(marker.type, enabledTypes))
        .map((marker, index) => (
          <HuntingMapMarkerGenericMemo
            key={index}
            mapScale={options.mapScale}
            marker={marker}
            markerFilter={markerFilter}
            markerVisibilityMap={markerVisibilityMap}
            maxMarkerSize={maxMarkerSize}
          />
        )),
    [
      enabledTypes,
      genericMarkers,
      markerFilter,
      markerVisibilityMap,
      maxMarkerSize,
      options.mapScale,
    ],
  );

  /**
   * Ensure specified coordinates remain within the allowed boundaries
   *
   * @param x Horizontal offset
   * @param y Vertical offset
   * @param targetWidth Custom map width override
   * @param targetHeight Custom map height override
   */
  const getBoundMapCoords = useCallback(
    (
      x: number,
      y: number,
      targetWidth?: number,
      targetHeight?: number,
    ): [number, number] => {
      // Ensure container element has been initialized
      const containerElement = ref.current;
      if (!containerElement) {
        return [x, y];
      }

      // Determine height and width of the container element
      const { height: containerHeight, width: containerWidth } =
        containerElement.getBoundingClientRect();

      // Use custom or current map sizes
      const mapWidth = targetWidth ?? options.mapWidth;
      const mapHeight = targetHeight ?? options.mapHeight;

      // Ensure map can not be dragged outside the visible horizontal area
      if (x > containerWidth - minOverflow) {
        x = containerWidth - minOverflow;
      } else if (x < -mapWidth + minOverflow) {
        x = -mapWidth + minOverflow;
      }

      // Ensure map can not be dragged outside the visible vertical area
      if (y > containerHeight - minOverflow) {
        y = containerHeight - minOverflow;
      } else if (y < -mapHeight + minOverflow) {
        y = -mapHeight + minOverflow;
      }

      return [x, y];
    },
    [minOverflow, options],
  );

  /**
   * Get map offset coordinates for a centered position
   *
   * @param targetWidth Custom map width to use when calculating offsets
   * @param targetHeight Custom map height to use when calculating offsets
   */
  const getCenteredMapCoords = useCallback(
    (targetWidth?: number, targetHeight?: number): [number, number] => {
      const containerElement = ref.current;

      // Ensure container element is initialised before proceeding
      if (!containerElement) {
        return [0, 0];
      }

      // Determine height and width of the container element
      const { height: containerHeight, width: containerWidth } =
        containerElement.getBoundingClientRect();

      // Use custom or current map sizes
      const imageWidth = targetWidth ?? options.mapWidth;
      const imageHeight = targetHeight ?? options.mapHeight;

      return [
        containerWidth / 2 - imageWidth / 2,
        containerHeight / 2 - imageHeight / 2,
      ];
    },
    [options],
  );

  /**
   * Handle map image having been fully loaded
   */
  const handleImageLoaded = useCallback(() => setImageLoaded(true), []);

  /**
   * Handle the start of map being dragged
   *
   * @param pageX Current horizontal pointer position in relation to the page
   * @param pageY Current vertical pointer position in relation to the page
   */
  const handleMapDragStart = useCallback(
    (pageX: number, pageY: number) => {
      // Extract current map position offsets
      const { mapLeft, mapTop } = options;

      // Store the starting pointer position as well as current
      // map position offsets for use during the drag process
      setDragStart({
        pageX,
        pageY,
        translateX: mapLeft,
        translateY: mapTop,
      });

      // Enable drag functionality
      isDragging.current = true;
    },
    [options],
  );

  /**
   * Handle the progress of map being dragged
   *
   * @param pageX Current horizontal pointer position in relation to the page
   * @param pageY Current vertical pointer position in relation to the page
   */
  const handleMapDrag = useCallback(
    (pageX: number, pageY: number) => {
      // Ensure map is being dragged
      if (!isDragging.current || (pageX === 0 && pageY === 0)) {
        return;
      }

      // Calculate differences between initial pointer position and current
      const deltaX = dragStart.pageX - pageX;
      const deltaY = dragStart.pageY - pageY;

      // Offset map position by the deltas
      let translateX = dragStart.translateX - deltaX;
      let translateY = dragStart.translateY - deltaY;

      // Ensure map remains within the boundaries
      const [mapLeft, mapTop] = getBoundMapCoords(translateX, translateY);

      // Update options to trigger map's position change
      setOptions(current => ({
        ...current,
        mapLeft,
        mapTop,
      }));
    },
    [dragStart, getBoundMapCoords],
  );

  /**
   * Handle the end of map being dragged
   */
  const handleMapDragCancel = useCallback(() => {
    // Disable drag functionality
    isDragging.current = false;
  }, []);

  /**
   * Handle map being zoomed in
   *
   * @param offsetX Custom vertical cursor offset to zoom the map into
   * @param offsetY Custom horizontal cursor offset to zoom the map into
   */
  const handleMapZoomIn = useCallback(
    (offsetX?: number, offsetY?: number) =>
      setOptions(current => {
        const { mapHeight, mapLeft, mapScale, mapTop, mapWidth } = current;

        // Calculate next scale after scaling it up
        const nextScale =
          Math.round(
            (Math.min(maxScale, mapScale + scaleIncrement) + Number.EPSILON) *
              100,
          ) / 100;

        // Calculate map's size at the next scale
        const nextWidth = imageWidth * nextScale;
        const nextHeight = imageHeight * nextScale;

        // Calculate difference between the current and next sizes
        const diffWidth = nextWidth - mapWidth;
        const diffHeight = nextHeight - mapHeight;

        // Calculate position of the mouse within the map as percentages
        const percentX = offsetX ? offsetX / mapWidth : 0.5;
        const percentY = offsetY ? offsetY / mapWidth : 0.5;

        // Ensure map remains within the boundaries when zooming in
        const [translateX, translateY] = getBoundMapCoords(
          mapLeft - diffWidth * percentX,
          mapTop - diffHeight * percentY,
          nextWidth,
          nextHeight,
        );

        return {
          mapHeight: nextHeight,
          mapLeft: translateX,
          mapScale: nextScale,
          mapTop: translateY,
          mapWidth: nextWidth,
        };
      }),
    [getBoundMapCoords, imageHeight, imageWidth, maxScale, scaleIncrement],
  );

  /**
   * Handle map being zoomed out
   *
   * @param offsetX Custom vertical cursor offset to zoom the map out of
   * @param offsetY Custom horizontal cursor offset to zoom the map out of
   */
  const handleMapZoomOut = useCallback(
    (offsetX?: number, offsetY?: number) =>
      setOptions(current => {
        const { mapHeight, mapLeft, mapScale, mapTop, mapWidth } = current;

        // Calculate next scale after scaling it down
        const nextScale =
          Math.round(
            (Math.max(minScale, mapScale - scaleIncrement) + Number.EPSILON) *
              100,
          ) / 100;

        // Calculate map's size at the next scale
        const nextWidth = imageWidth * nextScale;
        const nextHeight = imageHeight * nextScale;

        // Calculate difference between the current and next sizes
        const diffWidth = mapWidth - nextWidth;
        const diffHeight = mapHeight - nextHeight;

        // Calculate position of the mouse within the map as percentages
        const percentX = offsetX ? offsetX / mapWidth : 0.5;
        const percentY = offsetY ? offsetY / mapWidth : 0.5;

        // Ensure map remains within the boundaries when zooming out
        const [translateX, translateY] = getBoundMapCoords(
          mapLeft + diffWidth * percentX,
          mapTop + diffHeight * percentY,
          nextWidth,
          nextHeight,
        );

        return {
          mapLeft: translateX,
          mapScale: nextScale,
          mapTop: translateY,
          mapWidth: nextWidth,
          mapHeight: nextHeight,
        };
      }),
    [getBoundMapCoords, imageHeight, imageWidth, minScale, scaleIncrement],
  );

  /**
   * Handle initiating map being dragged using a mouse
   *
   * @param event Mouse event
   */
  const handleMouseDown = useCallback(
    (event: MouseEvent<EventTarget>) => {
      event.preventDefault();

      const { pageX, pageY } = event;
      handleMapDragStart(pageX, pageY);
    },
    [handleMapDragStart],
  );

  /**
   * Handle mouse being moved while dragging the map
   *
   * @param event Mouse event
   */
  const handleContainerMouseMove = useCallback(
    (event: MouseEvent<EventTarget>) => {
      const { pageX, pageY } = event;
      handleMapDrag(pageX, pageY);
    },
    [handleMapDrag],
  );

  /**
   * Handle clicking on the map
   */
  const handleMapMouseDown = useCallback((event: MouseEvent<EventTarget>) => {
    imageMouseDownOffset.current = [event.pageX, event.pageY];
  }, []);

  /**
   * Handle clicking on the map
   */
  const handleMouseUp = useCallback(
    (event: MouseEvent<EventTarget>) => {
      event.preventDefault();

      handleMapDragCancel();

      // Ignore clicks on markers
      if (!onClick || event.target !== imageRef.current) {
        return;
      }

      // Retrieve previous and current cursor offset in relation to the page
      const { pageX, pageY } = event;
      const [previousX, previousY] = imageMouseDownOffset.current;

      // Only trigger the event if mouse was released at the same offset
      // as it was pressed down (is a click without the map being dragged)
      if (pageX === previousX && pageY === previousY) {
        const { offsetX, offsetY } = event.nativeEvent;
        const { mapScale } = options;

        onClick(Math.round(offsetX / mapScale), Math.round(offsetY / mapScale));
      }
    },
    [handleMapDragCancel, onClick, options],
  );

  /**
   * Handle initiating map being dragged using touch
   *
   * @param event Touch event
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent<EventTarget>) => {
      // Fix for touch enabled devices that fixes lag on drag start
      event.stopPropagation();

      // Determine if scroll wheel was used on the map image itself
      if (event.target !== imageRef.current) {
        return;
      }

      const { pageX, pageY } = event.touches[0];
      handleMapDragStart(pageX, pageY);
    },
    [handleMapDragStart],
  );

  /**
   * Handle touch being moved while dragging the map
   *
   * @param event Touch event
   */
  const handleTouchMove = useCallback(
    (event: TouchEvent<EventTarget>) => {
      const { pageX, pageY } = event.touches[0];
      handleMapDrag(pageX, pageY);
    },
    [handleMapDrag],
  );

  /**
   * Handle mouse wheel being scrolled
   *
   * @param event Wheel event
   */
  const handleWheel = useCallback(
    (event: WheelEvent<EventTarget>) => {
      // Determine if scroll wheel was used on the map image itself
      if (event.target !== imageRef.current) {
        return;
      }

      // Zoom map at its centre if not scrolling directly on the image
      const { offsetX, offsetY } = event.nativeEvent;

      // Scroll down = positive delta, scroll up = negative delta
      Math.sign(event.deltaY) < 0
        ? handleMapZoomIn(offsetX, offsetY)
        : handleMapZoomOut(offsetX, offsetY);
    },
    [handleMapZoomIn, handleMapZoomOut],
  );

  /**
   * Center map and reset its size
   */
  const handleReset = useCallback(() => {
    const targetWidth = imageWidth * defaultScale;
    const targetHeight = imageHeight * defaultScale;

    // Get center position of the map at target size
    const [mapLeft, mapTop] = getCenteredMapCoords(targetWidth, targetHeight);

    setOptions({
      mapLeft,
      mapScale: defaultScale,
      mapTop,
      mapWidth: imageWidth * defaultScale,
      mapHeight: imageHeight * defaultScale,
    });
  }, [defaultScale, getCenteredMapCoords, imageHeight, imageWidth]);

  /**
   * Handle browser window being resized
   */
  const handleWindowResize = useCallback(() => {
    // Get current map coordinates
    const { mapLeft, mapTop } = options;

    // Get corrected map coordinates if the map is outside boundaries
    const [translateX, translateY] = getBoundMapCoords(mapLeft, mapTop);

    // Update map options if any of the offsets need adjusting
    if (translateX != mapLeft || translateY != mapTop) {
      setOptions(current => ({
        ...current,
        mapLeft: translateX,
        mapTop: translateY,
      }));
    }
  }, [getBoundMapCoords, options]);

  /**
   * Center map on component being mounted the first time
   */
  useEffect(() => {
    const [mapLeft, mapTop] = getCenteredMapCoords();

    setOptions(current => ({
      ...current,
      mapLeft,
      mapTop,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Ensure map remains within boundaries during window resize
   */
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [getBoundMapCoords, handleWindowResize, options]);

  return (
    <>
      {!imageLoaded && (
        <LoadingOverlay>Please wait. Loading map...</LoadingOverlay>
      )}
      <div
        className={styles.HuntingMap}
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMapDragCancel}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMapDragCancel}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
      >
        <HuntingMapFilter
          enabledTypes={enabledTypes}
          markerFilter={markerFilter}
          onChange={onFilterChange}
        />
        <HuntingMapToolbar
          onReset={handleReset}
          onZoomIn={() => handleMapZoomIn()}
          onZoomOut={() => handleMapZoomOut()}
        />

        <div
          className={styles.HuntingMapContainer}
          style={{
            height: `${options.mapHeight}px`,
            left: `${options.mapLeft}px`,
            top: `${options.mapTop}px`,
            width: `${options.mapWidth}px`,
          }}
        >
          {imageLoaded && markerListAnimals}
          {imageLoaded && markerListGeneric}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Nez Perez map"
            className={styles.HuntingMapImage}
            height={options.mapHeight}
            ref={imageRef}
            src={imageSrc}
            width={options.mapWidth}
            onLoad={handleImageLoaded}
            onMouseDown={handleMapMouseDown}
          />
        </div>
      </div>
    </>
  );
};
