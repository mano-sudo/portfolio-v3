export default function ProjectLoading() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 py-12 sm:py-14 md:py-20 lg:py-24">
        <div className="h-6 w-32 bg-white/10 rounded-sm animate-pulse" />
        <div className="mt-8 h-10 w-4/5 bg-white/10 rounded-sm animate-pulse" />
        <div className="mt-4 h-4 w-full max-w-3xl bg-white/10 rounded-sm animate-pulse" />
        <div className="mt-2 h-4 w-2/3 max-w-2xl bg-white/10 rounded-sm animate-pulse" />
      </section>
    </main>
  );
}
