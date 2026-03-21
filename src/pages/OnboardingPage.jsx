import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SlimeAvatar from "../components/SlimeAvatar";
import { updateUserProfile } from "../lib/api";
import {
  clearCurrentUser,
  clearGuestUser,
  getCurrentUser,
  saveCurrentUser,
  saveGuestUser,
} from "../lib/authStorage";
import { avatarOptions } from "../lib/theme";

function OnboardingPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isGuest = currentUser?.source === "guest" || !currentUser;
  const defaultAvatar =
    avatarOptions.find((option) => option.id === currentUser?.avatarStyle) || avatarOptions[0];

  const [assistantName, setAssistantName] = useState(currentUser?.assistantName || "마음이");
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      assistantName: assistantName.trim(),
      avatarStyle: selectedAvatar.id,
      themeColor: selectedAvatar.accent,
    };

    try {
      if (currentUser?.id && currentUser?.source === "auth") {
        const response = await updateUserProfile(currentUser.id, payload);
        saveCurrentUser(response.user);
      } else {
        saveGuestUser({
          ...currentUser,
          ...payload,
          isOnboardingCompleted: true,
        });
      }

      navigate("/counseling");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (!currentUser?.id) {
      saveGuestUser({
        assistantName,
        avatarStyle: selectedAvatar.id,
        themeColor: selectedAvatar.accent,
        isOnboardingCompleted: false,
      });
    }

    navigate("/counseling");
  };

  const handleBackToLogin = () => {
    clearCurrentUser();
    clearGuestUser();
    navigate("/login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,185,122,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(78,125,97,0.22),transparent_26%)]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="panel grid overflow-hidden md:grid-cols-[1.02fr_0.98fr]">
          <div className="bg-slate-50/75 p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              첫 설정
            </p>
            <h1 className="mt-4 text-3xl font-bold text-ink">
              {isGuest ? "게스트 프로필 설정" : "프로필 설정"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isGuest
                ? "게스트 모드는 현재 기기에만 저장되며 언제든지 바로 지울 수 있습니다."
                : "소셜 계정 프로필과 마음 친구 설정이 계속 연결됩니다."}
            </p>

            <div className="mt-8 rounded-[28px] bg-white px-6 py-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">미리보기</div>
              <div className="mt-5 flex items-end gap-5">
                <div
                  className="flex h-48 w-40 items-center justify-center rounded-[28px]"
                  style={{ backgroundColor: selectedAvatar.surface }}
                >
                  <SlimeAvatar avatar={selectedAvatar} size="medium" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Companion
                  </div>
                  <div className="mt-2 text-2xl font-bold text-ink">{assistantName || "마음이"}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    상담 화면으로 들어가기 전에 이름과 아바타를 정할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <div>
              <label htmlFor="assistant-name" className="text-sm font-semibold text-slate-700">
                친구 이름
              </label>
              <input
                id="assistant-name"
                value={assistantName}
                onChange={(event) => setAssistantName(event.target.value)}
                placeholder="예: 마음이"
                maxLength={16}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:bg-white"
              />
            </div>

            <div className="mt-8">
              <div className="text-sm font-semibold text-slate-700">아바타</div>
              <p className="mt-2 text-sm text-slate-500">
                게스트는 이 기기에만 저장되고, 로그인 사용자는 백엔드에 동기화됩니다.
              </p>

              <div className="mt-4 grid gap-3">
                {avatarOptions.map((option) => {
                  const isSelected = selectedAvatar.id === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedAvatar(option)}
                      className={`flex items-center justify-between rounded-[24px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-brand-300 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: option.surface }}
                        >
                          <img src={option.image} alt={option.label} className="h-12 w-10 object-contain" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-700">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">{option.accent}</span>
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isSelected ? "선택됨" : "선택"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
              {isGuest
                ? "게스트 데이터는 현재 브라우저에만 남고 체험 종료 시 바로 제거됩니다."
                : "로그인한 프로필 변경 사항은 앱 전체에 바로 반영됩니다."}
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !assistantName.trim()}
                className="rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                건너뛰기
              </button>
              <Link
                to="/login"
                onClick={handleBackToLogin}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                뒤로
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
