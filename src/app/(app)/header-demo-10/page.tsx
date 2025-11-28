import { DemoHeader } from './components/demo-header';

export default function HeaderDemo10Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8 pb-24 md:pb-8'>
        <h1 className='text-2xl font-bold'>Header Demo 10</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Bottom Navigation Hybrid</p>

        <div className='mt-8 space-y-4'>
          <div className='bg-card border border-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>Design Features</h2>
            <ul className='space-y-2 text-muted-foreground'>
              <li>• Desktop: Full horizontal navigation with all menu items</li>
              <li>• Tablet: Condensed top bar with dropdown menus</li>
              <li>• Mobile: Minimal top bar + fixed bottom navigation (iOS/Android style)</li>
              <li>• Bottom nav includes: Browse, Search, Add, Notifications, Profile</li>
              <li>• Smooth transitions between breakpoints</li>
              <li>• Safe area padding for notched devices</li>
            </ul>
          </div>

          <div className='bg-card border border-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>Sample Content</h2>
            <p className='text-muted-foreground'>
              Scroll down to see how the header behaves. On mobile, notice the bottom navigation bar. On
              desktop, see the full expanded header.
            </p>
          </div>

          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className='bg-card border border-border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-2'>Sample Card {i + 1}</h3>
              <p className='text-muted-foreground'>
                This is sample content to demonstrate scrolling behavior and how the header remains accessible
                throughout the page.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
