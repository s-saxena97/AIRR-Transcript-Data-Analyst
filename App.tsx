
import React, { useState, useEffect, useRef } from 'react';
import { StudentRecord, ChatMessage, AnalysisResponse } from './types';
import { SAMPLE_DATA, DEMO_CSV_DATA } from './constants';
import { analyzeData } from './geminiService';
import { DataVisualizer } from './components/DataVisualizer';
import { MongoConnector } from './components/MongoConnector';
import { DataPreview } from './components/DataPreview';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<StudentRecord[] | null>(null);
  const [mongoData, setMongoData] = useState<StudentRecord[] | null>(null);
  const [sourceType, setSourceType] = useState<'sample' | 'csv' | 'mongo'>('sample');
  
  const data = sourceType === 'mongo' ? (mongoData || []) : sourceType === 'csv' ? (csvData || []) : SAMPLE_DATA;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnectingMongo, setIsConnectingMongo] = useState(false);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeMongoConfig, setActiveMongoConfig] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to AIRR Intelligence. Three distinct data sources are now available: the local Sample set, a CSV import channel, and the MongoDB API bridge.",
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isAnalyzing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeData(inputValue, data);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        analysis: result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Operational error during inference. Please check connection and retry.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemoCsv = () => {
    setCsvData(DEMO_CSV_DATA);
    setSourceType('csv');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "CSV Channel: Pre-loaded with demo student records (Tech Pioneers).",
      timestamp: new Date(),
    }]);
  };

  const handleConnectMongo = async (config: { url: string; method: 'GET' | 'POST'; headers: string; body: string }, bypassData?: any) => {
    if (bypassData) {
      setMongoData(bypassData);
      setSourceType('mongo');
      setActiveMongoConfig(config);
      setIsMongoModalOpen(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "API Channel: Connected to simulated MongoDB source (Science Leaders).",
        timestamp: new Date(),
      }]);
      return;
    }

    setIsConnectingMongo(true);
    try {
      let headersObj = {};
      try { headersObj = JSON.parse(config.headers); } catch (e) { throw new Error("Invalid Headers JSON"); }

      const options: RequestInit = {
        method: config.method,
        headers: headersObj,
      };

      if (config.method === 'POST') {
        try { options.body = config.body; } catch (e) { throw new Error("Invalid Body JSON"); }
      }

      const response = await fetch(config.url, options);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Endpoint not found. Use 'Demo Data' in the connector." : `API responded with ${response.status}`);
      }
      
      const result = await response.json();
      const records = Array.isArray(result) ? result : (result.documents || result.records || []);
      
      if (!Array.isArray(records) || records.length === 0) throw new Error("No student records found.");

      setMongoData(records as StudentRecord[]);
      setSourceType('mongo');
      setActiveMongoConfig(config);
      setIsMongoModalOpen(false);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `API synchronized: Active connection to ${config.url}. ${records.length} records retrieved.`,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      alert(`Integration failed: ${err.message}`);
    } finally {
      setIsConnectingMongo(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const parsedData: StudentRecord[] = lines.slice(1).filter(line => line.trim()).map((line, idx) => {
        const values = line.split(',');
        return {
          id: `csv-${idx + 1}`,
          name: (values[0] || 'Unknown').replace(/"/g, ''),
          age: parseInt(values[1]) || 0,
          city: (values[2] || '').replace(/"/g, ''),
          state: (values[3] || '').replace(/"/g, ''),
          schoolName: (values[4] || '').replace(/"/g, ''),
          schoolType: (values[5] as any) || 'High School',
          schoolState: (values[6] || '').replace(/"/g, ''),
          schoolCity: (values[7] || '').replace(/"/g, ''),
          cumulativeGpa: parseFloat(values[8]) || 0,
          unweightedGpa: parseFloat(values[9]) || 0,
          weightedGpa: parseFloat(values[10]) || 0,
          rigorCoursesCount: parseInt(values[11]) || 0,
          creditsEarned: parseInt(values[12]) || 0,
          graduationYear: parseInt(values[13]) || 2024
        };
      });
      
      if (parsedData.length > 0) {
        setCsvData(parsedData);
        setSourceType('csv');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `CSV Imported: ${parsedData.length} records processed from ${file.name}.`,
          timestamp: new Date(),
        }]);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <MongoConnector 
        isOpen={isMongoModalOpen} 
        onClose={() => setIsMongoModalOpen(false)} 
        onConnect={handleConnectMongo} 
        isLoading={isConnectingMongo}
        activeConfig={activeMongoConfig}
        sourceType={sourceType}
      />

      <DataPreview 
        data={data}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <header className="h-14 border-b border-zinc-900 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-100 flex items-center justify-center rounded">
              <svg className="w-4 h-4 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-100">AIRR <span className="text-zinc-500 font-medium">Analytics</span></h1>
          </div>
          
          <div className="h-4 w-px bg-zinc-800" />
          
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
             <button 
               onClick={() => setSourceType('sample')}
               className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all ${sourceType === 'sample' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Sample
             </button>
             {csvData && (
               <button 
                 onClick={() => setSourceType('csv')}
                 className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all ${sourceType === 'csv' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 CSV
               </button>
             )}
             {mongoData && (
               <button 
                 onClick={() => setSourceType('mongo')}
                 className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all ${sourceType === 'mongo' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 API
               </button>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded transition-all flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Batch Preview
          </button>

          <button 
            onClick={() => setIsMongoModalOpen(true)}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded border border-zinc-800 transition-all flex items-center gap-2"
          >
            {mongoData ? 'API Config' : 'Link API'}
          </button>

          <div className="flex gap-1">
            <button 
              onClick={handleLoadDemoCsv}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded border border-zinc-800 transition-all"
              title="Load Demo CSV Set"
            >
              Demo CSV
            </button>
            <label className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded border border-zinc-800 transition-all flex items-center gap-2 cursor-pointer">
              {csvData ? 'Replace CSV' : 'Import CSV'}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          
          <div className="h-8 w-px bg-zinc-900 mx-2" />
          
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold text-zinc-100">{data.length}</span>
            <span className="text-[9px] text-zinc-600 font-bold uppercase ml-2 tracking-tighter">RECORDS</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-zinc-900 bg-zinc-950 hidden lg:flex flex-col">
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Context Schema</label>
              <div className="space-y-3">
                {[
                  { label: 'Academic Performance', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
                  { label: 'Course Rigor Index', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  { label: 'School Metadata', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                      <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-zinc-900">
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Summary</label>
               <div className="grid grid-cols-1 gap-2">
                  <div className="bg-zinc-900/40 p-3 rounded border border-zinc-900">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Mean GPA</p>
                    <p className="text-sm font-mono font-bold text-zinc-300">
                      {(data.reduce((acc, curr) => acc + curr.cumulativeGpa, 0) / (data.length || 1)).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 p-3 rounded border border-zinc-900">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Total Credits</p>
                    <p className="text-sm font-mono font-bold text-zinc-300">
                      {data.reduce((acc, curr) => acc + curr.creditsEarned, 0).toLocaleString()}
                    </p>
                  </div>
               </div>
            </section>

            <section className="pt-4 border-t border-zinc-900">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-3">Quick Queries</label>
              <div className="space-y-2">
                {[
                  'Show GPA distribution',
                  'Compare HS vs College',
                  'Top 5 by Credits'
                ].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setInputValue(tag)}
                    className="w-full text-left text-[11px] text-zinc-500 hover:text-zinc-100 transition-colors py-1.5"
                  >
                    / {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-zinc-950 relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-20 py-10 space-y-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-full lg:max-w-[90%] w-full ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-zinc-100 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AIRR Engine Output</span>
                      </div>
                      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-lg p-5 shadow-sm">
                        <div className="text-sm text-zinc-300 leading-relaxed font-light">
                          {msg.content}
                        </div>
                        
                        {msg.analysis?.calculationSummary && (
                          <div className="mt-6 text-[10px] text-zinc-600 font-mono py-2 px-3 bg-zinc-950 border border-zinc-900 rounded">
                            $ {msg.analysis.calculationSummary}
                          </div>
                        )}

                        {msg.analysis?.visualization && (
                          <DataVisualizer visualization={msg.analysis.visualization} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm border-zinc-700/50">
                      <p className="text-sm text-zinc-100 font-medium">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Analyzing {sourceType.toUpperCase()} source...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-20" />
          </div>

          <div className="p-8 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden p-1 shadow-2xl">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask about current ${sourceType} dataset...`}
                    className="flex-1 bg-transparent border-none px-5 py-4 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isAnalyzing}
                    className="bg-zinc-100 hover:bg-white disabled:opacity-30 text-zinc-950 h-10 px-6 rounded-md transition-all font-bold uppercase text-[10px] tracking-widest"
                  >
                    Analyze
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
