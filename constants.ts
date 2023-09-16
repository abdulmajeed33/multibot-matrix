import {
  Brain,
  Code,
  Container,
  ImageIcon,
  MessageSquare,
  Music,
  PenBox,
  Upload,
  VideoIcon,
  Youtube,
} from "lucide-react";

export const MAX_FREE_COUNTS = 3;

export const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/image",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    color: "text-orange-700",
    href: "/video",
  },
  {
    label: "Code Generation",
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/code",
  },
  // {
  //   label: "Memory",
  //   icon: Brain,
  //   color: "text-sky-500",
  //   href: "/memory",
  // },
  // {
  //   label: "Documents",
  //   icon: Upload,
  //   color: "text-sky-500",
  //   href: "/pdf",
  // },
  // {
  //   label: "Youtube",
  //   icon: Youtube,
  //   color: "text-red-500",
  //   href: "/video-chat",
  // },
  // {
  //   label: "Content Generator",
  //   icon: Container,
  //   color: "text-blue-600",
  //   href: "/content-generator",
  // },
  {
    label: "Article Summary",
    icon: PenBox,
    color: "text-gray-400",
    href: "/article-summary",
  },
];
