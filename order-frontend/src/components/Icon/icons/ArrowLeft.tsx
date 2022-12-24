import { IconProps } from '../types';

function ArrowLeft(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7071 19.7071C14.0976 19.3166 14.0976 18.6834 13.7071 18.2929L11.4142 16H21.0015C21.5529 16 22 15.5523 22 15C22 14.4477 21.5529 14 21.0015 14H11.4142L13.7071 11.7071C14.0976 11.3166 14.0976 10.6834 13.7071 10.2929C13.3166 9.90237 12.6834 9.90237 12.2929 10.2929L8.29289 14.2929C7.90237 14.6834 7.90237 15.3166 8.29289 15.7071L12.2929 19.7071C12.6834 20.0976 13.3166 20.0976 13.7071 19.7071Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ArrowLeft;
