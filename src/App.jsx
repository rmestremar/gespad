import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Trash2, Settings } from 'lucide-react';
import JSZip from 'jszip';

const AgenteGemini = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiModal, setShowApiModal] = useState(!apiKey);
  const [documents, setDocuments] = useState(JSON.parse(localStorage.getItem('agente_docs') || '[]'));
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('agente_messages') || '[]'));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('agente_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('agente_docs', JSON.stringify(documents));
  }, [documents]);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey);
      setShowApiModal(false);
    }
  };

  const extractPptxText = async (file) => {
    const zip = await JSZip.loadAsync(file);
    const slideFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    const texts = await Promise.all(
      slideFiles.map(async (slideName) => {
        const xml = await zip.files[slideName].async('string');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const nodes = doc.querySelectorAll('t');
        return Array.from(nodes)
          .map(n => n.textContent)
          .filter(t => t.trim())
          .join(' ');
      })
    );

    return texts.filter(t => t).join('\n\n');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newDocs = [];

    for (const file of files) {
      try {
        let content;
        if (file.name.endsWith('.pptx')) {
          content = await extractPptxText(file);
        } else {
          content = await file.text();
        }
        newDocs.push({
          id: Date.now() + Math.random(),
          name: file.name,
          content,
          type: file.type,
          size: file.size
        });
      } catch (error) {
        console.error('Error leyendo archivo:', error);
      }
    }

    setDocuments([...documents, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const callGeminiAPI = async (userMessage) => {
    if (!apiKey.trim()) {
      alert('Por favor, configura tu API Key de Google');
      setShowApiModal(true);
      return;
    }

    setLoading(true);
    
    try {
      let context = '';
      if (documents.length > 0) {
        context = `\n\n**DOCUMENTOS DISPONIBLES:**\n`;
        documents.forEach(doc => {
          context += `\n[${doc.name}]\n${doc.content.substring(0, 2000)}...\n`;
        });
        context += `\n**Usa la información anterior si es relevante para responder.**`;
      }

      const fullPrompt = userMessage + context;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error en la API');
      }

      let botResponse = '';
      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts) {
          botResponse = candidate.content.parts.map(part => part.text || '').join('');
        }
        if (candidate.groundingMetadata && candidate.groundingMetadata.searchEntryPoint) {
          botResponse += '\n\n*Búsqueda realizada en internet para información actualizada*';
        }
      }

      if (!botResponse) {
        botResponse = 'No pude procesar la respuesta. Por favor, intenta de nuevo.';
      }

      setMessages([...messages, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botResponse }
      ]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      setMessages([...messages, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: `❌ Error: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      callGeminiAPI(input);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-72 border-r border-slate-700 bg-slate-900/50 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Agente IA
          </h1>
          <p className="text-xs text-slate-400">con búsqueda web</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-300 uppercase mb-3 tracking-wide">
              Documentos ({documents.length})
            </p>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Sin documentos cargados</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-start justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => deleteDocument(doc.id)} className="ml-2 p-1 text-slate-500 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-slate-700">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg text-sm font-medium transition transform hover:scale-105"
          >
            <Upload size={16} />
            Subir documento
          </button>
          <button
            onClick={() => setShowApiModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition"
          >
            <Settings size={16} />
            API Key
          </button>
          <button
            onClick={() => { setMessages([]); localStorage.removeItem('agente_messages'); }}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition"
          >
            Limpiar chat
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".txt,.pdf,.md,.json,.pptx"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-200 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Bienvenido
                </h2>
                <p className="text-slate-400 max-w-md">
                  Sube documentos a la izquierda y hazme preguntas. Buscaré en internet y analizaré tus archivos.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg border border-slate-700 rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 bg-slate-900/50 p-6">
          <form onSubmit={handleSubmit} className="max-w-3xl flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hazme una pregunta..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {showApiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Configura tu API Key
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Necesitas una API Key de Google. Obtenla gratis en{' '}
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                ai.google.dev
              </a>
            </p>
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega tu API Key aquí"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-4"
              />
              <button type="submit" className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition">
                Guardar API Key
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">
              Tu API Key se guarda solo en tu navegador, no se envía a servidores externos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteGemini;
