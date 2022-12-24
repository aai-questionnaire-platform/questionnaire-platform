import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Label = styled.label<{ required: boolean }>`
  margin: 5px 0px;
  font-size: 15px;

  ${({ required }) =>
    required &&
    css`
      &:after {
        content: ' *';
        color: red;
      }
    `}
`;

const inputStyles = css`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 15px;
`;

const TextArea = styled.textarea`
  ${inputStyles}
  resize: none;
`;

const Input = styled.input`
  ${inputStyles}

  ${({ type }) =>
    type === 'number' &&
    css`
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      -moz-appearance: textfield;
    `}
`;

// TODO: Fix error message styles once we have opinion from design people
const Error = styled.span`
  font-size: 12px;
  margin-top: 4px;
  color: red;
`;

interface FormInputProps {
  label: string;
  name: string;
  error?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
  type?: HTMLInputTypeAttribute | 'textarea';
  value?: string | number | readonly string[];
}

function FormInput({
  error,
  label,
  name,
  required = false,
  type,
  ...rest
}: FormInputProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      {type === 'textarea' ? (
        <TextArea
          {...rest}
          aria-invalid={!!error}
          aria-errormessage={`error-${name}`}
          id={name}
          name={name}
          required={required}
          rows={3}
        />
      ) : (
        <Input
          {...rest}
          aria-invalid={!!error}
          aria-errormessage={`error-${name}`}
          id={name}
          name={name}
          required={required}
          type={type}
        />
      )}
      {error && <Error id={`error-${name}`}>{t(`formErrors.${error}`)}</Error>}
    </Container>
  );
}

export default FormInput;
