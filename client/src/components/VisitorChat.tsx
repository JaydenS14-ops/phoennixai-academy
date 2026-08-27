import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VisitorChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chat = trpc.academy.chat.useMutation({
    onSuccess: ({ answer }) => setMessages(current => [...current, { role: "assistant", content: answer }]),
    onError: () => {
      setMessages(current => [...current, { role: "assistant", content: "I could not answer that just now. Please submit an enquiry and the team will help." }]);
      toast.error("The visitor assistant is temporarily unavailable.");
    },
  });

  const send = (question: string) => {
    if (chat.isPending) return;
    setMessages(current => [...current, { role: "user", content: question }]);
    chat.mutate({ question });
  };

  return <div className="fixed bottom-5 right-4 z-50 sm:bottom-7 sm:right-7">
    {open ? <div className="mb-3 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#ABA944]/35 bg-[#F7F6F2] shadow-2xl shadow-[#1F2426]/20 sm:w-[390px]">
      <div className="flex items-center justify-between bg-[#3E4F55] px-4 py-3 text-white"><div><p className="font-display text-xl font-bold leading-none">Visitor support</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#C9C877]">Business & Technology Centre</p></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></Button></div>
      <AIChatBox messages={messages} onSendMessage={send} isLoading={chat.isPending} height={390} className="border-0 shadow-none" placeholder="Ask about programmes or pathways" emptyStateMessage="Ask about Academy programmes, adult learning, Agency opportunities, pricing, or pathways for young learners." suggestedPrompts={["Which programmes are available?", "Do you support adult learners?", "How does Agency work experience work?"]} />
    </div> : null}
    <Button onClick={() => setOpen(current => !current)} className="h-12 rounded-full bg-[#ABA944] px-5 font-semibold text-[#1F2426] shadow-lg shadow-[#ABA944]/30 hover:bg-[#C9C877]"><MessageCircle className="mr-2 h-4 w-4" />Ask a question</Button>
  </div>;
}
