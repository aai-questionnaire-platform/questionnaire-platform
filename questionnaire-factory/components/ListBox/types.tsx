export interface ListBoxProps extends React.HTMLProps<HTMLUListElement> {
  onChange: (value: any) => void;
  maxSelectedOptions?: number;
  value?: any;
}
