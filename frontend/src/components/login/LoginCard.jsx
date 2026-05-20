import { useNavigate } from "react-router-dom";
import { clearCurrentUser, clearGuestUser } from "../../lib/authStorage";
import { socialProviders } from "../../lib/socialAuth";
import { clearGuestChats } from "../../storage/chatStorage";

function LoginCard() {
  const navigate = useNavigate();

  const handleGuestStart = () => {
    clearCurrentUser();
    clearGuestUser();
    clearGuestChats();
    navigate("/onboarding");
  };

  return (
    <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-panel backdrop-blur md:p-10">
      <div className="text-center">
        <div className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
          SNS 로그인
        </div>
        <h1 className="mt-5 text-3xl font-bold text-ink">마음 기록 시작하기</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          SNS 계정으로 로그인하거나, 로그인 없이 게스트 체험으로 바로 시작할 수 있습니다.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {socialProviders.map((provider) => (
          <a
            key={provider.key}
            href={provider.enabled ? provider.authUrl : undefined}
            aria-disabled={!provider.enabled}
            className={`flex items-center justify-between rounded-[24px] px-4 py-4 text-sm font-semibold transition ${
              provider.enabled
                ? `${provider.className} shadow-sm hover:translate-y-[-1px]`
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">{provider.icon}</span>
              <span>{provider.label}</span>
            </span>
            <span className="text-xs font-medium">{provider.enabled ? "연결" : "설정 필요"}</span>
          </a>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
        소셜 로그인은 프로필이 백엔드에 저장되고, 게스트 체험은 현재 기기에서만 유지됩니다.
      </div>

      <div className="mt-4 text-center text-sm text-slate-500">
        <button type="button" onClick={handleGuestStart} className="font-semibold text-brand-700">
          게스트로 체험하기
        </button>
      </div>
    </div>
  );
}

export default LoginCard;
