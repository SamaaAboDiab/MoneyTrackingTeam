import { Link } from "react-router-dom";

function UserAvatarLink({ user }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <Link to="/profile">
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {initial}
        </span>
      )}
    </Link>
  );
}

export default UserAvatarLink;
