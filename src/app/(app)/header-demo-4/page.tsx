import { DemoHeader } from './components/demo-header';

export default function HeaderDemo4Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 4</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Cyberpunk Tech</p>
        <div className='mt-8 space-y-4'>
          <p className='text-muted-foreground'>
            This header features a futuristic, tech-inspired design with:
          </p>
          <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
            <li>Geometric shapes and angular design elements</li>
            <li>Glowing orange neon-style accents</li>
            <li>HUD-style layout with bracketed sections</li>
            <li>Animated borders and hover effects</li>
            <li>Monospace typography for tech aesthetic</li>
            <li>Fully responsive across all breakpoints</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
