import type { User } from "@/features/auth";
import type { IConversation } from "./IConversation";

export interface IChatWindowProps {
  currentUser: User;
  conversation: IConversation;
  onBack?: () => void;
}
