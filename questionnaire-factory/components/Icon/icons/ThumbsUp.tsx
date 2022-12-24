import { IconProps } from '@/components/Icon/types';

function ThumbsUp(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="8.73682"
        width="3.36842"
        height="10.9474"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.2631 2L7.36841 8.73684V18.8421H15.4955C16.6956 18.8421 17.7802 18.1269 18.2529 17.0239L19.7574 13.5134C19.9175 13.1399 20 12.7379 20 12.3316V11.1162C20 9.45938 18.6568 8.11623 17 8.11623H14.1053L14.6511 5.24334C14.8364 4.26795 14.5272 3.26406 13.8252 2.56202L13.2631 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ThumbsUp;
