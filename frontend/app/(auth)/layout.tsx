export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-auth p-4 sm:p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
