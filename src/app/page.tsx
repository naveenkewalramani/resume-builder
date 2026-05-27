import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading editor...</p>
    </div>
  ),
});

export default function HomePage() {
  return <Editor />;
}
