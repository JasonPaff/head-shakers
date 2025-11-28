import { DemoHeader } from './components/demo-header';

export default function HeaderDemo2Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 2</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Glassmorphism</p>
        <div className='mt-8 space-y-4'>
          <p>
            This header features a frosted glass aesthetic with floating elements and a dynamic blur effect.
          </p>
          <p>Scroll down to see the header become more opaque and stick to the top of the viewport.</p>
          <div className='h-[200vh] mt-8 space-y-8'>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className='rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm'>
                <h2 className='text-xl font-semibold'>Content Block {i + 1}</h2>
                <p className='text-muted-foreground mt-2'>
                  Scroll to test the sticky header behavior and glassmorphism effects.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
