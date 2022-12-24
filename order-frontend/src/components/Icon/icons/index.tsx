import { FunctionComponent } from 'react';

import { IconKey, IconProps } from '../types';
import ArrowLeft from './ArrowLeft';
import Contact from './Contact';
import ExternalLink from './ExternalLink';
import MapMarker from './MapMarker';

const icons: Record<IconKey, FunctionComponent<IconProps>> = {
  'arrow-left': ArrowLeft,
  'contact': Contact,
  'external-link': ExternalLink,
  'map-marker': MapMarker,
};

export default icons;
