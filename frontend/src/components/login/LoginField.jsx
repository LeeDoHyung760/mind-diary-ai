function LoginField({ id, label, type, placeholder }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100/60"
      />
    </label>
  );
}

export default LoginField;
