import { IconProps } from '../types';

function Heart(props: IconProps) {
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
        d="M5.89036 16.4623L13.5356 24.3885C14.0409 24.9124 14.7609 25.0998 15.4198 24.9502C15.7965 24.8705 16.1545 24.6812 16.4427 24.3825L24.1115 16.4341C26.6314 13.8169 26.6292 9.60714 24.1066 6.99257C21.6012 4.39587 17.5446 4.33687 14.9687 6.8173C12.3954 4.38267 8.37655 4.45488 5.88939 7.03324C3.36983 9.64519 3.37026 13.8509 5.89036 16.4623ZM22.6673 8.38125C24.4429 10.2215 24.4444 13.2048 22.6707 15.047L14.975 23L7.32951 15.0735C5.5571 13.2369 5.55679 10.2588 7.32883 8.42176C9.10087 6.58475 11.9742 6.58443 13.7466 8.42106L14.9702 9.68964L16.236 8.37772C18.0134 6.53938 20.8917 6.54096 22.6673 8.38125Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Heart;