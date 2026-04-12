import { MessageCircle } from "lucide-react";

export default function ChatIndex() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 min-h-[200px]">
      <MessageCircle className="w-16 h-16 mb-4 text-gray-600 opacity-50" strokeWidth={1.25} />
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
        Selecione uma conversa à esquerda para ver as mensagens.
      </p>
    </div>
  );
}
