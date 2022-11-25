import Head from 'next/head';
import NoSSR from 'react-no-ssr';
import { HuntingMap } from 'components/HuntingMap';
import { baseUrl } from 'config/app';
import {
  genericMarkers,
  mapHeight,
  mapWidth,
  markerVisibilityMap,
} from './config';

const NezPerceValleyPage = () => (
  <>
    <Head>
      <title>Nez Perce Valley - Way Of The Hunter</title>
    </Head>

    <NoSSR>
      <HuntingMap
        imageHeight={mapHeight}
        imageSrc={`${baseUrl}/img/maps/nez_perce.jpeg`}
        imageWidth={mapWidth}
        markers={genericMarkers}
        markerVisibilityMap={markerVisibilityMap}
      />
    </NoSSR>
  </>
);

export default NezPerceValleyPage;
