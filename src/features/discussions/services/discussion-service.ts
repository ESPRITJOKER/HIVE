import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { viewerClassIds } from "@/features/shared/scope";
import type { ChannelType } from "@/types/domain";

export interface ChannelSummary {
  id: string;
  name: string;
  type: ChannelType;
  courseId: string | null;
  courseLabel: string | null;
}

export interface MessageSummary {
  id: string;
  channelId: string | null;
  courseId: string | null;
  content: string;
  createdAt: string;
  isOwn: boolean;
  authorLabel: string;
}

export async function listChannels(session: SessionContext): Promise<ChannelSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const classIds = viewerClassIds(session);
  if (classIds.length === 0) return [];

  const [{ data: channels, error }, { data: courses }] = await Promise.all([
    supabase
      .from("channels")
      .select("id, name, channel_type, course_id")
      .in("class_id", classIds)
      .order("name"),
    supabase.from("courses").select("id, code, title").in("class_id", classIds),
  ]);
  if (error || !channels) return [];

  const courseById = new Map((courses ?? []).map((course) => [course.id, course]));

  return channels.map((channel) => {
    const course = channel.course_id ? courseById.get(channel.course_id) : null;
    return {
      id: channel.id,
      name: channel.name,
      type: channel.channel_type,
      courseId: channel.course_id,
      courseLabel: course ? `${course.code} · ${course.title}` : null,
    };
  });
}

export async function canReadChannel(session: SessionContext, channelId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { data: channel } = await supabase
    .from("channels")
    .select("class_id")
    .eq("id", channelId)
    .maybeSingle();
  return Boolean(channel && viewerClassIds(session).includes(channel.class_id));
}

export async function listMessages(
  session: SessionContext,
  channelId: string,
  limit = 100,
): Promise<MessageSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase || !(await canReadChannel(session, channelId))) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id, channel_id, course_id, user_id, content, created_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];

  return data.map((message) => ({
    id: message.id,
    channelId: message.channel_id,
    courseId: message.course_id,
    content: message.content,
    createdAt: message.created_at,
    isOwn: message.user_id === session.userId,
    // Classmates' profile rows are private under RLS; never guess a name.
    authorLabel: message.user_id === session.userId ? "You" : "Class member",
  }));
}

/** Inserts with the author derived from the session; the client supplies only content. */
export async function postMessage(
  session: SessionContext,
  input: { channelId: string; content: string },
): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase || !(await canReadChannel(session, input.channelId))) return false;

  const { error } = await supabase.from("messages").insert({
    user_id: session.userId,
    channel_id: input.channelId,
    content: input.content,
  });
  return !error;
}
