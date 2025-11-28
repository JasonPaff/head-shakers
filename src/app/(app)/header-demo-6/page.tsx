import { DemoHeader } from './components/demo-header';

export default function HeaderDemo6Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 6</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Retro 80s Revival</p>
        <div className='mt-8 space-y-4'>
          <p>
            This header features a nostalgic 80s-inspired design with gradient backgrounds, bold chunky
            buttons, and arcade-style aesthetics.
          </p>
          <p>Resize your browser to see the responsive behavior across different breakpoints.</p>
        </div>
      </main>
    </div>
  );
}
