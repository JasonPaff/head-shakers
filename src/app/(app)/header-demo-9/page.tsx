import { DemoHeader } from './components/demo-header';

export default function HeaderDemo9Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 9</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Mega Menu Focus</p>
        <div className='mt-8 space-y-4'>
          <p>
            This header features rich, content-filled mega menus with icons, descriptions, and visual
            hierarchy. Hover over navigation items to see the full-width mega menu experience.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='p-6 bg-card border border-border rounded-lg'>
                <h3 className='font-semibold mb-2'>Demo Card {i + 1}</h3>
                <p className='text-sm text-muted-foreground'>
                  Sample content to demonstrate page layout with the new header design.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
