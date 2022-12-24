import icons from '@/components/Icon/icons';
import { IconProps } from '@/components/Icon/types';

export type IconType = keyof typeof icons;

interface IconComponentProps extends IconProps {
  className?: string;
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
