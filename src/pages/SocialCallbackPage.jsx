import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getUserProfile } from "../lib/api";
import { saveCurrentUser } from "../lib/authStorage";

const providerNames = {
  kakao: "카카오",
  naver: "네이버",
  google: "구글",
};

const errorMessages = {
  redirect_uri_mismatch: "개발자 콘솔에 등록한 Redirect URI와 현재 설정값이 다릅니다.",
  access_denied: "사용자가 로그인 또는 권한 제공을 취소했습니다.",
  invalid_request: "필수 요청값이 누락되었거나 잘못 전달됐습니다.",
  invalid_client: "클라이언트 ID 또는 시크릿 설정을 다시 확인해야 합니다.",
  invalid_grant: "인가 코드가 만료되었거나 이미 사용됐습니다.",
  naver_state_mismatch: "네이버 state 값이 서버 설정과 다릅니다.",
  naver_code_missing: "네이버에서 인가 코드를 넘기지 않았습니다.",
  naver_token_exchange_failed: "네이버 토큰 교환 단계에서 실패했습니다.",
  naver_profile_fetch_failed: "네이버 사용자 정보 조회에 실패했습니다.",
  google_code_missing: "구글에서 인가 코드를 넘기지 않았습니다.",
  google_token_exchange_failed: "구글 토큰 교환 단계에서 실패했습니다.",
  google_profile_fetch_failed: "구글 사용자 정보 조회에 실패했습니다.",
  kakao_code_missing: "카카오에서 인가 코드를 넘기지 않았습니다.",
  kakao_token_exchange_failed: "카카오 토큰 교환 단계에서 실패했습니다.",
  kakao_profile_fetch_failed: "카카오 사용자 정보 조회에 실패했습니다.",
};

function SocialCallbackPage() {
  const navigate = useNavigate();
  const { provider = "social" } = useParams();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("로그인 정보를 불러오는 중입니다.");

  useEffect(() => {
    const error = searchParams.get("error");
    const reason = searchParams.get("reason");
    const userId = searchParams.get("userId");
    const shouldOnboard = searchParams.get("onboarding") === "true";

    if (error) {
      const baseMessage =
        errorMessages[error] || `${providerNames[provider] || "SNS"} 로그인 처리 중 오류가 발생했습니다.`;
      setMessage(reason ? `${baseMessage} (${reason})` : baseMessage);
      return;
    }

    if (!userId) {
      setMessage("사용자 정보를 받지 못했습니다.");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await getUserProfile(userId);
        saveCurrentUser(response.user);
        navigate(shouldOnboard ? "/onboarding" : "/counseling", { replace: true });
      } catch (fetchError) {
        setMessage(fetchError.message);
      }
    };

    fetchUser();
  }, [navigate, provider, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-md px-8 py-10 text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
          Social Login
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          {providerNames[provider] || "SNS"} 로그인 연결 중
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export default SocialCallbackPage;
