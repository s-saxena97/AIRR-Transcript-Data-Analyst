
import React, { useRef, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Label
} from 'recharts';
import { toPng } from 'html-to-image';
import { AnalysisResponse, ChartType } from '../types';

const COLORS = ['#fafafa', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b'];

interface Props {
  visualization: AnalysisResponse['visualization'];
}

export const DataVisualizer: React.FC<Props> = ({ visualization }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  if (!visualization || visualization.type === ChartType.NONE) return null;

  const { type, data, xAxisLabel, yAxisLabel, title } = visualization;

  const downloadImage = useCallback(() => {
    if (chartRef.current === null) {
      return;
    }

    toPng(chartRef.current, { cacheBust: true, backgroundColor: '#09090b' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-chart.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export chart', err);
      });
  }, [chartRef, title]);

  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#fafafa',
    fontSize: '12px',
    padding: '8px'
  };

  const axisLabelStyle: React.CSSProperties = {
    fill: '#a1a1aa',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const tickStyle = {
    fontSize: 10,
    fill: '#d4d4d8', // zinc-300 for readability
    fontWeight: 500
  };

  const chartMargin = { top: 20, right: 30, left: 20, bottom: 40 };

  return (
    <div className="mt-6 relative group">
      <div 
        ref={chartRef}
        className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 transition-all hover:border-zinc-700 overflow-visible"
      >
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em] opacity-90">{title}</h3>
          <button 
            onClick={downloadImage}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded border border-zinc-700 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"
            title="Download PNG"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PNG
          </button>
        </div>
        
        <div className="h-72 w-full overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            {type === ChartType.BAR ? (
              <BarChart data={data} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="label" 
                  tick={tickStyle} 
                  axisLine={{ stroke: '#3f3f46' }} 
                  tickLine={false}
                  height={50}
                >
                  <Label value={xAxisLabel} offset={-25} position="insideBottom" style={axisLabelStyle} />
                </XAxis>
                <YAxis 
                  tick={tickStyle} 
                  axisLine={{ stroke: '#3f3f46' }} 
                  tickLine={false}
                  width={40}
                >
                  <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ ...axisLabelStyle, textAnchor: 'middle' }} offset={10} />
                </YAxis>
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  cursor={{ fill: '#ffffff10' }}
                />
                <Bar dataKey="value" fill="#fafafa" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            ) : type === ChartType.LINE ? (
              <LineChart data={data} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="label" 
                  tick={tickStyle} 
                  axisLine={{ stroke: '#3f3f46' }} 
                  tickLine={false}
                  height={50}
                >
                  <Label value={xAxisLabel} offset={-25} position="insideBottom" style={axisLabelStyle} />
                </XAxis>
                <YAxis 
                  tick={tickStyle} 
                  axisLine={{ stroke: '#3f3f46' }} 
                  tickLine={false}
                  width={40}
                >
                   <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ ...axisLabelStyle, textAnchor: 'middle' }} offset={10} />
                </YAxis>
                <Tooltip contentStyle={tooltipStyle} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#fafafa" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fafafa', strokeWidth: 2, stroke: '#09090b' }} 
                  activeDot={{ r: 6, fill: '#fff' }} 
                />
              </LineChart>
            ) : type === ChartType.PIE ? (
              <PieChart margin={{ bottom: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="label"
                  stroke="#09090b"
                  strokeWidth={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '20px', color: '#d4d4d8', fontWeight: 'bold', textTransform: 'uppercase' }} 
                />
              </PieChart>
            ) : type === ChartType.SCATTER ? (
              <ScatterChart margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.5} />
                <XAxis 
                  type="number" 
                  dataKey="label" 
                  name={xAxisLabel} 
                  tick={tickStyle}
                  axisLine={{ stroke: '#3f3f46' }}
                  height={50}
                >
                  <Label value={xAxisLabel} offset={-25} position="insideBottom" style={axisLabelStyle} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="value" 
                  name={yAxisLabel} 
                  tick={tickStyle}
                  axisLine={{ stroke: '#3f3f46' }}
                  width={40}
                >
                  <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ ...axisLabelStyle, textAnchor: 'middle' }} offset={10} />
                </YAxis>
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                <Scatter name="Students" data={data} fill="#fafafa">
                   {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            ) : null}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
