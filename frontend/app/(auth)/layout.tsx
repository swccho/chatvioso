export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-app">
      {/* Desktop: branding/value side */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-brand-soft/30 lg:p-12">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-primary">
            Workspace-based team communication
          </h2>
          <p className="mt-3 text-sm text-primary-secondary">
            Chat, collaborate, and stay in sync with your team in real time.
          </p>
        </div>
      </div>

      {/* Form side: full width on mobile, half on desktop */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
