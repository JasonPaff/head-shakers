type ContentLayoutProps = RequiredChildren;

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return <div className={'mx-auto max-w-[1444px] px-4 py-2 lg:px-8'}>{children}</div>;
};
