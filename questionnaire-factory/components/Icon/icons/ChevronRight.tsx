import { IconProps } from '@/components/Icon/types';

function ChevronRight(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 6.9999585 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 1,1 6,6 1,11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ChevronRight;
