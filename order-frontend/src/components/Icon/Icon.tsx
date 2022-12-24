import { SVGAttributes } from 'react';

import icons from './icons';
import { IconKey } from './types';

interface IconComponentProps extends SVGAttributes<SVGElement> {
  icon: IconKey;
  size?: number;
  alt?: string;
}

function Icon({
  icon,
  alt,
  size = 16,
  className,
  ...rest
}: IconComponentProps) {
  const SvgComponent = icons[icon];
  return (
    <SvgComponent
      {...rest}
      className={className}
      role="img"
      height={size}
      aria-hidden={!alt}
      aria-label={alt}
    />
  );
}

export default Icon;
