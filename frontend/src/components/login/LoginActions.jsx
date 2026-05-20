import { Link } from "react-router-dom";

function LoginActions() {
  return (
    <div className="space-y-3 pt-2">
      <Link
        to="/counseling"
        className="block rounded-2xl bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        로그인
      </Link>
      <button
        type="button"
        className="block w-full rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
      >
        회원가입
      </button>
    </div>
  );
}

export default LoginActions;
