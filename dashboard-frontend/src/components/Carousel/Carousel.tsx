import { Children, ReactNode } from 'react';
import styled from 'styled-components';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';

import CarouselPagination from '@/components/Carousel/CarouselPagination';

const StyledSwiper = styled(Swiper)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface CarouselProps {
  children: ReactNode[];
}

function Carousel({ children }: CarouselProps) {
  return (
    <StyledSwiper centeredSlides slidesPerView={1.2}>
      {Children.map(children, (child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
      <CarouselPagination />
    </StyledSwiper>
  );
}

export default Carousel;
