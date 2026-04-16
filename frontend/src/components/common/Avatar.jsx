export default function Avatar({ user, size = "sm" }) {
  const sizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm" };
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        title={user.name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white`}
      />
    );
  }

  return (
    <div
      title={user?.name}
      className={`${sizes[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold border-2 border-white`}
    >
      {initials}
    </div>
  );
}
