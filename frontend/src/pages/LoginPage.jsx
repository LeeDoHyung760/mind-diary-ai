import LoginCard from "../components/login/LoginCard";

function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,185,122,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(78,125,97,0.22),transparent_26%)]" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="max-w-4xl text-center text-4xl font-bold leading-tight text-brand-900/10 md:text-6xl md:leading-[1.2]">
          당신의 감정은 기록될 가치가 있습니다.
        </p>
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <LoginCard />
      </div>
    </div>
  );
}

export default LoginPage;
