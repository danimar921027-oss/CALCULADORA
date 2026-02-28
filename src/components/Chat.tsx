import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, AlertCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getChatSession, analyzeImageWithPrompt } from '../services/gemini';
import { cn } from '../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: '¡Hola! Soy **AlphaRisk Coach**. Estoy aquí para ayudarte a calcular lotajes exactos, analizar tus bitácoras de trading y mantener tu gestión de riesgo bajo control. ¿En qué te puedo ayudar hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, file: File } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    chatSessionRef.current = getChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage({ url, file });
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.url);
      setSelectedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      imageUrl: currentImage?.url
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      let responseText = '';

      if (currentImage) {
        const base64Data = await fileToBase64(currentImage.file);
        const prompt = userText || "Analiza esta imagen de mi bitácora o gráfico de trading.";
        responseText = await analyzeImageWithPrompt(base64Data, currentImage.file.type, prompt) || '';
      } else {
        const response = await chatSessionRef.current.sendMessage({ message: userText });
        responseText = response.text || '';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-4",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-sm" 
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
              )}
            >
              {msg.imageUrl && (
                <img 
                  src={msg.imageUrl} 
                  alt="Uploaded" 
                  className="max-w-full rounded-lg mb-3 border border-slate-700/50"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              )}
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analizando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img 
              src={selectedImage.url} 
              alt="Preview" 
              className="h-20 w-auto rounded-md border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 rounded-full p-1 hover:bg-slate-700 hover:text-white border border-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Tengo $500, quiero arriesgar 1% en EURUSD con SL de 15 pips..."
              className="w-full max-h-32 min-h-[56px] bg-transparent text-slate-200 p-3 resize-none focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <div className="flex gap-2 h-[56px] items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Subir captura de bitácora"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
