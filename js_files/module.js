export const leaderboard = JSON.parse(
  localStorage.getItem("leaderboard") || "[]"
);

export const currentuser = JSON.parse(
  sessionStorage.getItem("currentuser") || "null"
);

export const users = JSON.parse(localStorage.getItem("users") || "[]");
