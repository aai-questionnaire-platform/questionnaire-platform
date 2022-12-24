import styled from 'styled-components';

interface ChangeAnnouncerProps {
  message: string;
}

const StyledChangeAnnouncer = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  padding: 0;
  margin: -1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

function ChangeAnnouncer({ message }: ChangeAnnouncerProps) {
  return <StyledChangeAnnouncer role="status">{message}</StyledChangeAnnouncer>;
}

export default ChangeAnnouncer;
