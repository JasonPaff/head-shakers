import { DemoHeader } from './components/demo-header';

export default function HeaderDemo8Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8 pt-32'>
        <h1 className='text-2xl font-bold'>Header Demo 8</h1>
        <p className='mt-2 text-muted-foreground'>Design Style: Floating Islands</p>
        <div className='mt-8 space-y-4'>
          <p className='text-sm text-muted-foreground'>
            This header features independent floating component groups that create a modern, spacious layout
            with depth through shadows and positioning.
          </p>
          <div className='mt-16 grid gap-8'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className='rounded-lg border bg-card p-6 shadow-sm'>
                <h2 className='mb-2 text-lg font-semibold'>Sample Content Section {i + 1}</h2>
                <p className='text-sm text-muted-foreground'>
                  Scroll to see how the floating islands header behaves. Each island maintains its position
                  and visual independence while creating a cohesive navigation experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
