export function Dashboard() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-[--accent-11]">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[--gray-12] sm:text-4xl">
            Welcome to your savings workspace
          </h1>
          <p className="mt-3 text-[--gray-11]">
            This is your authenticated area. We can now add loan summaries,
            repayment insights, and action cards here.
          </p>
        </div>
      </div>
    </section>
  );
}
