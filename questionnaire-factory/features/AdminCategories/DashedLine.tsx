import styled from 'styled-components';

const SVG = styled.svg`
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: visible;
`;

type Position = { x: number; y: number };

interface DashedLineProps {
  color?: string;
  startPos?: Position;
  endPos?: Position;
}

function DashedLine({ color = '#000', startPos, endPos }: DashedLineProps) {
  return startPos && endPos ? (
    <SVG>
      <line
        strokeWidth={2}
        strokeDasharray="4 4"
        stroke={color}
        x1={startPos.x}
        y1={startPos.y}
        x2={endPos.x}
        y2={endPos.y}
      />
    </SVG>
  ) : null;
}

export default DashedLine;
