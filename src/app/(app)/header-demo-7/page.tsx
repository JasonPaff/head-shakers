import { DemoHeader } from './components/demo-header';

export default function HeaderDemo7Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 7</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Split Asymmetric</p>
        <div className='mt-8 space-y-4'>
          <p className='text-sm text-muted-foreground'>
            This header features an asymmetric split-panel design with distinct visual zones. The left zone
            uses a bold primary background with the logo, while the right zone contains all navigation and
            user controls with contrasting treatments.
          </p>
          <p className='text-sm text-muted-foreground'>
            Try resizing your browser to see how the asymmetric design adapts across different breakpoints
            while maintaining visual tension and balance.
          </p>
        </div>
      </main>
    </div>
  );
}
