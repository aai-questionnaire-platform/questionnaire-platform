import { IconProps } from '../types';

function ChevronRight(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 30 30"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.5858 15L11.2929 8.70711C10.9024 8.31658 10.9024 7.68342 11.2929 7.29289C11.6834 6.90237 12.3166 6.90237 12.7071 7.29289L19.7071 14.2929C20.0976 14.6834 20.0976 15.3166 19.7071 15.7071L12.7071 22.7071C12.3166 23.0976 11.6834 23.0976 11.2929 22.7071C10.9024 22.3166 10.9024 21.6834 11.2929 21.2929L17.5858 15Z" />
    </svg>
  );
}

export default ChevronRight;
