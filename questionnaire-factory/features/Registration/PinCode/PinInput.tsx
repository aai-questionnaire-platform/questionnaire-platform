import { ChangeEvent, HTMLProps } from 'react';
import styled from 'styled-components';

type PinInputProps = Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  size?: number;
  invalid?: boolean;
};

const PinInputElement = styled.input`
  height: 52px;
  background: repeating-linear-gradient(
    90deg,
    #fff,
    #fff 50px,
    #979797 0,
    #979797 51px
  );

  border: 1px solid #d5d8dd;
  border-radius: 4px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  font-family: 'IBM Plex Mono', monospace;

  &[aria-invalid='true'] {
    border: 2px solid #d93c3c;
    background: repeating-linear-gradient(
      90deg,
      #fff,
      #fff 50px,
      #d93c3c 0,
      #d93c3c 51px
    );
  }
`;

function PinInput({
  value,
  onChange,
  fontSize = 22,
  size = 5,
  invalid,
  ...rest
}: PinInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: changedValue } = event.target;

    if (changedValue.length >= size) {
      event.currentTarget.selectionStart = changedValue.length - 1;
      event.currentTarget.selectionEnd = changedValue.length - 1;
    }

    onChange(changedValue);
  };

  return (
    <PinInputElement
      {...(rest as any)}
      autoComplete="off"
      data-cy="pin-input"
      name="pin"
      onChange={handleChange}
      value={value}
      maxLength={size}
      style={{
        width: 51 * size - 1,
        fontSize,
        letterSpacing: 51 - fontSize * 0.6,
        paddingLeft: 25 - fontSize * 0.28,
      }}
      inputMode="numeric"
      pattern="[0-9]*"
      aria-invalid={invalid}
    />
  );
}

export default PinInput;
