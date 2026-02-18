export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
