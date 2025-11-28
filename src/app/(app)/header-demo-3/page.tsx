import { DemoHeader } from './components/demo-header';

export default function HeaderDemo3Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 3</h1>
        <p className='text-muted-foreground mt-2'>Design Style: Bold Editorial</p>
        <div className='mt-8 space-y-4'>
          <p>This header design is inspired by editorial and magazine layouts, featuring:</p>
          <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
            <li>Large, bold typography for the masthead</li>
            <li>Split-level layout with logo bar and navigation bar</li>
            <li>Uppercase section headers for dramatic hierarchy</li>
            <li>Animated underlines on hover for interactive elements</li>
            <li>Orange accent bar for visual impact</li>
            <li>Responsive stack on mobile devices</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
