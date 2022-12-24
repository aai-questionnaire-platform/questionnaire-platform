import { IconProps } from '@/components/Icon/types';

function Send(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 4L17.4245 17.9317L3 11.6438L21 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M21 4L10.2123 14.7877V19.5719L12.7716 15.8776"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Send;
