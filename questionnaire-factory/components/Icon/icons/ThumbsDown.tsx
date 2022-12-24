import { IconProps } from '@/components/Icon/types';

function ThumbsDown(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="3.36842"
        height="10.9474"
        transform="matrix(1 0 0 -1 4 15.2632)"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.2631 22L7.36841 15.2632V5.15789H15.4955C16.6956 5.15789 17.7802 5.87309 18.2529 6.97614L19.7574 10.4866C19.9175 10.8601 20 11.2621 20 11.6684V12.8838C20 14.5406 18.6568 15.8838 17 15.8838H14.1053L14.6511 18.7567C14.8364 19.732 14.5272 20.7359 13.8252 21.438L13.2631 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ThumbsDown;
