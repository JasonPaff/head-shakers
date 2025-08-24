import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

type AuthLayoutProps = Children;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ClerkProvider>
      <header>
        <SignedOut>
          <SignInButton mode={'redirect'} />
          <SignUpButton mode={'redirect'}>
            <Button>Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      {children}
    </ClerkProvider>
  );
}
