import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-3xl border border-black/5 p-10 shadow-lg">
        <h1 className="font-bebas text-[44px] leading-none text-black">
          SIGN IN
        </h1>
        <GoogleSignInButton />
      </div>
    </main>
  );
}
