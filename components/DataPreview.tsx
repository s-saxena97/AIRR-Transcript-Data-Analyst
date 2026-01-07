
import React, { useState } from 'react';
import { StudentRecord } from '../types';

interface Props {
  data: StudentRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const DataPreview: React.FC<Props> = ({ data, isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredData = data.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl w-full h-full max-w-7xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Batch Dataset Preview
            </h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
              {data.length} Total Records • {filteredData.length} Matches
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search name, school, or city..." 
                className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800">
              <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">GPA (Cum)</th>
                <th className="px-6 py-4 text-center">Weighted</th>
                <th className="px-6 py-4 text-center">Rigor</th>
                <th className="px-6 py-4 text-center">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4 text-[10px] font-mono text-zinc-700">{record.id.padStart(3, '0')}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{record.age}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    <span className="block">{record.schoolName}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-bold">{record.schoolCity}, {record.schoolState}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      record.schoolType === 'College' ? 'border-indigo-900 text-indigo-400 bg-indigo-950/30' : 'border-zinc-800 text-zinc-500'
                    }`}>
                      {record.schoolType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{record.city}, {record.state}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-zinc-100">{record.cumulativeGpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-400">{record.weightedGpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-3 rounded-full ${i < (record.rigorCoursesCount / 2) ? 'bg-zinc-100' : 'bg-zinc-800'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-mono text-zinc-400">{record.creditsEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-zinc-600 font-medium uppercase tracking-[0.2em] text-xs">No records matching your search</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-100" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase">Valid Schema</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-800" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase">ReadOnly</span>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-white transition-all"
           >
             Close Preview
           </button>
        </div>
      </div>
    </div>
  );
};
