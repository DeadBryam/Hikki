"use client";

import { useParams } from "next/navigation";
import { ChatContainer } from "../_components/chat-container";

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params?.slug as string;

  return <ChatContainer conversationId={conversationId} />;
}
