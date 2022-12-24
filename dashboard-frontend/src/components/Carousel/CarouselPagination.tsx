import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSwiper } from 'swiper/react';

const Container = styled.div`
  display: flex;
`;

const Dot = styled.button<{ active: boolean }>`
  height: 10px;
  width: 10px;
  margin: 4px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.gray};
  background-color: ${({ active, theme }) =>
    active ? theme.gray : theme.white};
  transition: 0.1s all;
  cursor: pointer;
`;

function CarouselPagination() {
  const swiper = useSwiper();
  const [selectedSlide, setSelectedSlide] = useState(0);

  useEffect(() => {
    const listener = () => {
      setSelectedSlide(swiper.realIndex);
    };

    swiper.on('slideChange', listener);
    return () => swiper.off('slideChange', listener);
  }, [swiper]);

  const dots = Array.from(Array(swiper.slides.length));

  return (
    <Container>
      {dots.map((_, i) => (
        <Dot
          key={i}
          active={selectedSlide === i}
          onClick={() => swiper.slideTo(i)}
          aria-label={`${i + 1}/${dots.length}`}
        />
      ))}
    </Container>
  );
}

export default CarouselPagination;
