import { FeaturedContentForm } from './featured-content-form';

interface FeaturedContentFormWrapperProps {
  contentId?: null | string;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeaturedContentFormWrapper = (props: FeaturedContentFormWrapperProps) => {
  return (
    <FeaturedContentForm
      contentId={props.contentId ?? null}
      onClose={props.onClose}
      onSuccess={props.onSuccess}
    />
  );
};
