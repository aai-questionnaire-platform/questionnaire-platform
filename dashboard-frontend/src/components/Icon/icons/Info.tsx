import { IconProps } from '../types';

function Info(props: IconProps) {
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
        d="M4 15C4 21.0751 8.92487 26 15 26C21.0751 26 26 21.0751 26 15C26 8.92487 21.0751 4 15 4C8.92487 4 4 8.92487 4 15ZM24.24 15C24.24 20.1031 20.1031 24.24 15 24.24C9.89689 24.24 5.76 20.1031 5.76 15C5.76 9.89689 9.89689 5.76 15 5.76C20.1031 5.76 24.24 9.89689 24.24 15ZM14 14C14 13.4477 14.4477 13 15 13C15.5523 13 16 13.4477 16 14V19C16 19.5523 15.5523 20 15 20C14.4477 20 14 19.5523 14 19V14ZM16 11C16 11.5523 15.5523 12 15 12C14.4477 12 14 11.5523 14 11C14 10.4477 14.4477 10 15 10C15.5523 10 16 10.4477 16 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Info;
