const env = import.meta.env;
const apiBaseUrl = env.VITE_API_BASE_URL || "http://localhost:5000/api";
const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

function createProviderAuthUrl(provider) {
  return `${backendBaseUrl}/api/auth/${provider}/login`;
}

export const socialProviders = [
  {
    key: "kakao",
    label: "카카오로 로그인",
    icon: "K",
    className: "bg-[#FEE500] text-[#191919]",
    authUrl: createProviderAuthUrl("kakao"),
  },
  {
    key: "naver",
    label: "네이버로 로그인",
    icon: "N",
    className: "bg-[#03C75A] text-white",
    authUrl: createProviderAuthUrl("naver"),
  },
  {
    key: "google",
    label: "구글로 로그인",
    icon: "G",
    className: "bg-white text-slate-700 border border-slate-200",
    authUrl: createProviderAuthUrl("google"),
  },
].map((provider) => ({
  ...provider,
  enabled: Boolean(provider.authUrl),
}));
