import { useEffect, useState } from "react";
import { getNotificationsForUser, markNotificationRead } from "../firebase/firestore";
import type { Notification } from "../types";
import { Button } from "../ui/components/Button";

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    const list = await getNotificationsForUser(userId);
    setItems(list);
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const unread = items.filter((n) => !n.read).length;

  const onRead = async (n: Notification) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
      } catch {
        /* ignore */
      }
    }
    await load();
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
      >
        <span className="material-icons-outlined text-xl">notifications</span>
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,360px)] max-h-[70vh] overflow-auto rounded-xl border border-border bg-surface shadow-lg z-[70]">
            <div className="px-4 py-3 border-b border-border font-semibold text-sm text-text">Notifications</div>
            {items.length === 0 ? (
              <div className="px-4 py-8 text-sm text-text-dim text-center">No notifications yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-3 hover:bg-bg transition ${n.read ? "opacity-75" : "bg-[#EFF6FF]/50"}`}
                      onClick={() => void onRead(n)}
                    >
                      <div className="font-semibold text-sm text-text">{n.title}</div>
                      <div className="text-xs text-text-dim mt-0.5">{n.message}</div>
                      <div className="text-[11px] text-text-dim mt-1">
                        {n.createdAt.toLocaleString()} · {n.type}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
