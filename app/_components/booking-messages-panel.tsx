"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, MessageCircleMore, SendHorizonal } from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase";

type Thread = {
  bookingId: string;
  counterpartId: string;
  counterpartName: string;
  serviceLabel: string;
  location: string;
  schedule: string;
  preview: string;
  lastMessageAt: string;
  lastSenderRole: "customer" | "provider" | "admin" | "system";
  unreadCount: number;
};

type MessageItem = {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: "customer" | "provider" | "admin" | "system";
  senderName: string;
  messageText: string;
  createdAt: string;
  isOwnMessage: boolean;
};

type ThreadDetail = {
  bookingId: string;
  counterpartId: string;
  counterpartName: string;
  serviceLabel: string;
  location: string;
  schedule: string;
  messages: MessageItem[];
  unreadCount: number;
};

type Theme = {
  accentText: string;
  accentBg: string;
  accentSoftBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  ownBubble: string;
  ownBubbleText: string;
  otherBubble: string;
  otherBubbleText: string;
  threadUnreadBorder: string;
  threadUnreadBg: string;
  composerButton: string;
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BookingMessagesPanel({
  role,
  basePath,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  theme,
}: {
  role: "customer" | "provider";
  basePath: "/profile/messages" | "/provider/messages";
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref: string;
  emptyActionLabel: string;
  theme: Theme;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedBookingId = searchParams.get("booking") ?? "";
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadDetail, setThreadDetail] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isSending, startSending] = useTransition();

  const apiBasePath = role === "customer" ? "/api/profile/messages" : "/api/provider/messages";

  async function withSession<T>(callback: (accessToken: string) => Promise<T>) {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error("Supabase is not configured yet.");
    }

    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session) {
      router.push("/login");
      throw new Error("Your session expired. Please log in again.");
    }

    return callback(session.access_token);
  }

  async function loadThreads() {
    return withSession(async (accessToken) => {
      const response = await fetch(apiBasePath, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = (await response.json()) as
        | { threads: Thread[] }
        | { error?: string };

      if (!response.ok || !("threads" in result)) {
        throw new Error(("error" in result ? result.error : "") || "Unable to load conversations.");
      }

      setThreads(result.threads);
      return result.threads;
    });
  }

  async function loadThreadDetail(bookingId: string) {
    if (!bookingId) {
      setThreadDetail(null);
      return null;
    }

    return withSession(async (accessToken) => {
      setThreadLoading(true);
      const response = await fetch(`${apiBasePath}/${encodeURIComponent(bookingId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = (await response.json()) as
        | { thread: ThreadDetail }
        | { error?: string };

      if (!response.ok || !("thread" in result)) {
        throw new Error(("error" in result ? result.error : "") || "Unable to load conversation.");
      }

      setThreadDetail(result.thread);

      if (result.thread.unreadCount > 0) {
        await fetch(`${apiBasePath}/${encodeURIComponent(bookingId)}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setThreads((current) =>
          current.map((thread) =>
            thread.bookingId === bookingId ? { ...thread, unreadCount: 0 } : thread,
          ),
        );
      }

      return result.thread;
    }).finally(() => {
      setThreadLoading(false);
    });
  }

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    let channel: ReturnType<NonNullable<typeof client>["channel"]> | null = null;

    async function boot() {
      try {
        const loadedThreads = await loadThreads();

        if (!active) {
          return;
        }

        const targetBookingId =
          selectedBookingId ||
          loadedThreads[0]?.bookingId ||
          "";

        if (!selectedBookingId && targetBookingId) {
          router.replace(`${pathname}?booking=${encodeURIComponent(targetBookingId)}`, {
            scroll: false,
          });
        } else if (targetBookingId) {
          await loadThreadDetail(targetBookingId);
        }

        if (!client) {
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await client.auth.getSession();

        if (!active || !session) {
          setLoading(false);
          return;
        }

        channel = client
          .channel(`${role}-booking-messages-${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "booking_messages",
            },
            async () => {
              const refreshedThreads = await loadThreads().catch(() => null);
              if (!active) {
                return;
              }

              const activeBookingId = selectedBookingId || refreshedThreads?.[0]?.bookingId || "";
              if (activeBookingId) {
                await loadThreadDetail(activeBookingId).catch(() => null);
              }
            },
          )
          .subscribe();
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load conversations.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void boot();

    return () => {
      active = false;
      if (client && channel) {
        void client.removeChannel(channel);
      }
    };
  }, [apiBasePath, pathname, role, router, selectedBookingId]);

  useEffect(() => {
    if (!selectedBookingId) {
      setThreadDetail(null);
      return;
    }

    void loadThreadDetail(selectedBookingId).catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load conversation.");
    });
  }, [selectedBookingId]);

  const selectedThreadSummary = useMemo(
    () => threads.find((thread) => thread.bookingId === selectedBookingId) ?? null,
    [selectedBookingId, threads],
  );

  function openThread(bookingId: string) {
    router.replace(`${basePath}?booking=${encodeURIComponent(bookingId)}`, {
      scroll: false,
    });
  }

  function sendMessage() {
    const nextMessage = draft.trim();
    if (!selectedBookingId || !nextMessage) {
      return;
    }

    startSending(async () => {
      try {
        setError("");
        const thread = await withSession(async (accessToken) => {
          const response = await fetch(`${apiBasePath}/${encodeURIComponent(selectedBookingId)}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ messageText: nextMessage }),
          });

          const result = (await response.json()) as
            | { thread: ThreadDetail }
            | { error?: string };

          if (!response.ok || !("thread" in result)) {
            throw new Error(("error" in result ? result.error : "") || "Unable to send message.");
          }

          return result.thread;
        });

        setDraft("");
        setThreadDetail(thread);
        const refreshedThreads = await loadThreads().catch(() => null);
        if (!selectedBookingId && refreshedThreads?.[0]?.bookingId) {
          openThread(refreshedThreads[0].bookingId);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to send message.");
      }
    });
  }

  if (loading) {
    return (
      <div className="rounded-[20px] border border-[#e5e7eb] bg-white px-4 py-8 text-center text-[14px] text-[#6b7280]">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-[16px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {error}
        </p>
      ) : null}

      <section className="rounded-[22px] border border-[#e5e7eb] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-black text-[#111827]">Booking Conversations</h2>
            <p className="mt-1 text-[12px] text-[#6b7280]">
              Messages are grouped by booking so both sides stay in the same thread.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}>
            {threads.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {threads.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#d9e2dd] bg-[#fbfefc] px-4 py-8 text-center">
              <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${theme.accentSoftBg} ${theme.accentText}`}>
                <MessageCircleMore className="h-6 w-6" />
              </div>
              <p className="mt-4 text-[15px] font-extrabold text-[#111827]">{emptyTitle}</p>
              <p className="mt-2 text-[13px] leading-6 text-[#6b7280]">{emptyDescription}</p>
              <Link
                href={emptyActionHref}
                className={`mt-4 inline-flex h-10 items-center justify-center rounded-[12px] px-4 text-[13px] font-extrabold text-white ${theme.composerButton}`}
              >
                {emptyActionLabel}
              </Link>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.bookingId}
                type="button"
                onClick={() => openThread(thread.bookingId)}
                className={`w-full rounded-[18px] border p-4 text-left ${
                  selectedBookingId === thread.bookingId
                    ? `${theme.accentBorder} ${theme.accentSoftBg}`
                    : thread.unreadCount > 0
                      ? `${theme.threadUnreadBorder} ${theme.threadUnreadBg}`
                      : "border-[#e5e7eb] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-extrabold text-[#111827]">
                      {thread.counterpartName}
                    </p>
                    <p className={`mt-1 text-[12px] font-semibold ${theme.accentText}`}>
                      {thread.serviceLabel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#4b5563]">
                      {thread.preview}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-[#94a3b8]">
                      {formatRelativeDate(thread.lastMessageAt)}
                    </p>
                    {thread.unreadCount > 0 ? (
                      <span className={`mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold text-white ${theme.composerButton}`}>
                        {thread.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[12px] text-[#6b7280]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`h-4 w-4 ${theme.accentText}`} />
                    <span>{thread.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 ${theme.accentText}`} />
                    <span>{thread.location}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {selectedThreadSummary ? (
        <section className="rounded-[22px] border border-[#e5e7eb] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#edf1ef] pb-4">
            <p className="text-[16px] font-black text-[#111827]">
              {threadDetail?.counterpartName ?? selectedThreadSummary.counterpartName}
            </p>
            <p className={`mt-1 text-[12px] font-semibold ${theme.accentText}`}>
              {threadDetail?.serviceLabel ?? selectedThreadSummary.serviceLabel}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[#6b7280]">
              {threadDetail?.schedule ?? selectedThreadSummary.schedule}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {threadLoading ? (
              <div className="rounded-[16px] bg-[#f8fafc] px-4 py-6 text-center text-[13px] text-[#6b7280]">
                Loading messages...
              </div>
            ) : threadDetail?.messages.length ? (
              threadDetail.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[18px] px-4 py-3 ${
                      message.isOwnMessage
                        ? `${theme.ownBubble} ${theme.ownBubbleText}`
                        : `${theme.otherBubble} ${theme.otherBubbleText}`
                    }`}
                  >
                    <p className="text-[11px] font-bold opacity-80">{message.senderName}</p>
                    <p className="mt-1 text-[13px] leading-6">{message.messageText}</p>
                    <p className="mt-2 text-[10px] opacity-70">{formatTimestamp(message.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-[#d9e2dd] bg-[#fbfefc] px-4 py-6 text-center text-[13px] text-[#6b7280]">
                No messages in this booking thread yet.
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-[#edf1ef] pt-4">
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                Send message
              </span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message about this booking..."
                className="min-h-[6rem] w-full rounded-[16px] border border-[#d9e2dd] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none placeholder:text-[#98A2B3]"
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Link
                href={role === "customer" ? `/profile/bookings/${selectedThreadSummary.bookingId}` : `/provider/bookings/${selectedThreadSummary.bookingId}`}
                className={`text-[12px] font-bold ${theme.accentText}`}
              >
                Open booking details
              </Link>
              <button
                type="button"
                onClick={sendMessage}
                disabled={isSending || !draft.trim()}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-extrabold text-white disabled:opacity-60 ${theme.composerButton}`}
              >
                <SendHorizonal className="h-4 w-4" />
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
