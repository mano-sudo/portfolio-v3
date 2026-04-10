export default function ProjectLoading() {
    return (
        <main className="w-full overflow-x-hidden bg-background">
            <section className="relative min-h-dvh w-full bg-black/10">
                <div className="absolute inset-0 animate-pulse bg-black/5" />
                <div className="relative flex min-h-dvh flex-col justify-between px-5 pb-10 pt-24 sm:px-8 sm:pt-28">
                    <div className="h-4 w-40 animate-pulse rounded-sm bg-white/25" />
                    <div className="mx-auto h-12 w-3/4 max-w-xl animate-pulse rounded-sm bg-white/20" />
                    <div className="mx-auto h-3 w-16 animate-pulse rounded-full bg-white/20" />
                </div>
            </section>
            <section className="border-t border-black/10 bg-background px-5 py-14 sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="space-y-4 lg:col-span-5">
                        <div className="h-10 w-4/5 animate-pulse rounded-sm bg-black/10" />
                        <div className="h-4 w-32 animate-pulse rounded-sm bg-black/10" />
                        <div className="mt-8 space-y-3">
                            <div className="h-px w-full bg-black/10" />
                            <div className="h-16 animate-pulse rounded-sm bg-black/10" />
                            <div className="h-px w-full bg-black/10" />
                            <div className="h-16 animate-pulse rounded-sm bg-black/10" />
                        </div>
                    </div>
                    <div className="space-y-4 lg:col-span-7">
                        <div className="h-24 w-full animate-pulse rounded-sm bg-black/10" />
                        <div className="h-px w-full bg-black/10" />
                        <div className="h-4 w-full animate-pulse rounded-sm bg-black/10" />
                        <div className="h-4 w-full animate-pulse rounded-sm bg-black/10" />
                        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-black/10" />
                    </div>
                </div>
            </section>
        </main>
    );
}
