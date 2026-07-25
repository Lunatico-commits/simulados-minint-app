import { DEFAULT_AVATAR_ID } from "./avatars";

export interface SavedAccount {
  username: string;
  avatarId: string;
  points: number;
  totalExams: number;
  lastActive: number;
}

const STORAGE_KEY = "minint_saved_accounts";

export function getSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let accounts: SavedAccount[] = raw ? JSON.parse(raw) : [];

    // Fallback: ONLY inspect existing localStorage user stats if STORAGE_KEY has NEVER been set (raw === null)
    if (raw === null && accounts.length === 0) {
      const storedUsersRaw = localStorage.getItem("minint_users");
      if (storedUsersRaw) {
        const storedUsers = JSON.parse(storedUsersRaw);
        Object.keys(storedUsers).forEach((key) => {
          const userRec = storedUsers[key];
          if (userRec && userRec.username) {
            const u = userRec.username;
            const statsRaw = localStorage.getItem(`minint_stats_${u}`);
            const stats = statsRaw ? JSON.parse(statsRaw) : { points: 0, totalExams: 0 };
            const avatarId = localStorage.getItem(`minint_avatar_${u}`) || DEFAULT_AVATAR_ID;
            const totalExams = stats.totalExams || 0;
            const points = totalExams === 0 ? 0 : (stats.points || 0);
            accounts.push({
              username: u,
              avatarId,
              points,
              totalExams,
              lastActive: Date.now(),
            });
          }
        });
      }
      // Initialize STORAGE_KEY so future checks respect deletions
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }

    // Sort by last active descending
    return accounts.sort((a, b) => b.lastActive - a.lastActive);
  } catch (err) {
    console.error("Erro ao carregar contas salvas:", err);
    return [];
  }
}

export function saveAccountToDevice(username: string) {
  if (!username) return;

  try {
    const accounts = getSavedAccounts();
    const statsRaw = localStorage.getItem(`minint_stats_${username}`);
    const stats = statsRaw ? JSON.parse(statsRaw) : { points: 0, totalExams: 0 };
    const avatarId = localStorage.getItem(`minint_avatar_${username}`) || DEFAULT_AVATAR_ID;

    const existingIdx = accounts.findIndex(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );

    const totalExams = stats.totalExams || 0;
    const points = totalExams === 0 ? 0 : (stats.points || 0);

    const updatedAccount: SavedAccount = {
      username,
      avatarId,
      points,
      totalExams,
      lastActive: Date.now(),
    };

    if (existingIdx >= 0) {
      accounts[existingIdx] = updatedAccount;
    } else {
      accounts.unshift(updatedAccount);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Erro ao guardar conta no dispositivo:", err);
  }
}

export function removeAccountFromDevice(username: string): SavedAccount[] {
  if (!username) return getSavedAccounts();

  try {
    const accounts = getSavedAccounts();
    const filtered = accounts.filter(
      (a) => a.username.toLowerCase() !== username.toLowerCase()
    );
    // Write back updated list to STORAGE_KEY (only removes shortcut from this device)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    return filtered;
  } catch (err) {
    console.error("Erro ao remover atalho de conta do dispositivo:", err);
    return [];
  }
}
