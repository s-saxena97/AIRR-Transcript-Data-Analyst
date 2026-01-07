
import React, { useState, useEffect } from 'react';
import { DEMO_API_DATA } from '../constants';

interface MongoConfig {
  url: string;
  method: 'GET' | 'POST';
  headers: string;
  body: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: MongoConfig, bypassData?: any) => Promise<void>;
  isLoading: boolean;
  activeConfig: MongoConfig | null;
  sourceType: 'sample' | 'csv' | 'mongo';
}

export const MongoConnector: React.FC<Props> = ({ isOpen, onClose, onConnect, isLoading, activeConfig, sourceType }) => {
  const [config, setConfig] = useState<MongoConfig>({
    url: 'https://api.mock-endpoint.io/v1/students',
    method: 'GET',
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: '{\n  "collection": "students",\n  "database": "airr_records"\n}'
  });

  useEffect(() => {
    if (isOpen && activeConfig) {
      setConfig(activeConfig);
    }
  }, [isOpen, activeConfig]);

  const isCurrentConfigConnected: boolean = 
    sourceType === 'mongo' && 
    activeConfig !== null && 
    config.url === activeConfig.url && 
    config.method === activeConfig.method;

  if (!isOpen) return null;

  const handleDemoMode = () => {
    // Use the distinct DEMO_API_DATA set
    onConnect({ ...config, url: 'DEMO_MOCK_API' }, DEMO_API_DATA);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">External Database Integration</h2>
            <p className="text-xs text-zinc-500">Connect to your student record API endpoint</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-md mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1">Testing Mode</p>
                <p className="text-[10px] text-zinc-500">If your endpoint is returning 404, use our simulated environment.</p>
              </div>
              <button 
                onClick={handleDemoMode}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[10px] font-bold uppercase rounded border border-zinc-700 transition-all whitespace-nowrap"
              >
                Use Demo Data
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Endpoint URL</label>
            <input 
              type="text" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-700"
              placeholder="https://api.yourdomain.com/v1/students"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">HTTP Method</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none appearance-none"
                value={config.method}
                onChange={(e) => setConfig({ ...config, method: e.target.value as any })}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
               <p className="text-[10px] text-zinc-600 italic leading-tight">
                 Ensure the endpoint returns a JSON array matching the AIRR schema.
               </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Headers (JSON)</label>
            <textarea 
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
              value={config.headers}
              onChange={(e) => setConfig({ ...config, headers: e.target.value })}
            />
          </div>

          {config.method === 'POST' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Request Body (JSON)</label>
              <textarea 
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
                value={config.body}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConnect(config)}
            disabled={isLoading || !config.url || isCurrentConfigConnected}
            className={`px-6 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
              isCurrentConfigConnected 
                ? 'bg-zinc-800 text-zinc-400 cursor-default border border-zinc-700' 
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {isLoading && <div className="w-3 h-3 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />}
            {isLoading 
              ? 'Connecting...' 
              : isCurrentConfigConnected 
                ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Connected
                  </>
                )
                : 'Connect Source'
            }
          </button>
        </div>
      </div>
    </div>
  );
};
