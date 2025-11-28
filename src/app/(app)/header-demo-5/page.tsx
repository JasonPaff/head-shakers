import { DemoHeader } from './components/demo-header';

export default function HeaderDemo5Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 5</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Organic Flow</p>
        <div className='mt-8 space-y-4'>
          <p className='text-sm text-muted-foreground'>
            This header features soft, organic shapes with flowing design elements:
          </p>
          <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
            <li>Curved edges and wave-like borders</li>
            <li>Soft shadows with low opacity</li>
            <li>Blob-shaped containers for menu groups</li>
            <li>Smooth, spring-like animations</li>
            <li>Warm, inviting feel using orange warmly</li>
            <li>Fully responsive across all breakpoints</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
