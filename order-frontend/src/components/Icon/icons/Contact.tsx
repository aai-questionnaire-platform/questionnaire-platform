import { IconProps } from '../types';

function Contact(props: IconProps) {
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
        d="M23 24V22C24.6569 22 26 20.6569 26 19V9C26 7.34315 24.6569 6 23 6H7C5.34315 6 4 7.34315 4 9V19C4 20.6569 5.34315 22 7 22H16.1716L19.5858 25.4142C20.8457 26.6741 23 25.7818 23 24ZM6 9C6 8.44772 6.44772 8 7 8H23C23.5523 8 24 8.44772 24 9V19C24 19.5523 23.5523 20 23 20H21V24L17 20H7C6.44772 20 6 19.5523 6 19V9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Contact;
