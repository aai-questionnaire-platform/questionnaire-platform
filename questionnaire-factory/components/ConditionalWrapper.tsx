type ConditionalWrapperProps = React.PropsWithChildren<{
  if: boolean;
  with: (children: React.ReactNode) => JSX.Element | null;
}>;

function ConditionalWrapper({
  if: condition,
  with: wrapper,
  children,
}: ConditionalWrapperProps) {
  return condition ? wrapper(children) : <>{children}</>;
}

export default ConditionalWrapper;
