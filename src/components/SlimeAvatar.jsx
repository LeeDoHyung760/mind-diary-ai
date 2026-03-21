function SlimeAvatar({ avatar, size = "large" }) {
  const sizes = {
    small: "h-12 w-12",
    medium: "h-28 w-24",
    large: "h-[250px] w-[210px]",
  };

  const frameSizes = {
    small: "rounded-2xl p-0.5",
    medium: "rounded-[26px] p-1",
    large: "rounded-[34px] p-1",
  };

  const imageClasses = {
    small: "h-full w-full scale-110 object-contain",
    medium: "h-full w-full scale-[1.18] object-contain",
    large: "h-full w-full scale-[1.22] object-contain",
  };

  const wrapperSize = sizes[size] || sizes.large;
  const frameClass = frameSizes[size] || frameSizes.large;
  const imageClass = imageClasses[size] || imageClasses.large;

  return (
    <div className={`relative flex items-end justify-center ${wrapperSize}`}>
      <div className="absolute bottom-2 h-4 w-2/3 rounded-full bg-slate-900/10 blur-md" />
      <div
        className={`relative flex h-full w-full items-center justify-center ${frameClass}`}
        style={{ backgroundColor: avatar.surface, boxShadow: `0 18px 32px ${avatar.shadow}` }}
      >
        <img src={avatar.image} alt={avatar.label} className={imageClass} />
      </div>
    </div>
  );
}

export default SlimeAvatar;
