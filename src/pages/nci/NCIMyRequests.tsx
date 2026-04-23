import { useState, useEffect } from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SkeletonList } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { getNTFOwnRequests } from '../../services/api.service';
import { cn } from '../../utils/cn';

const relTime = (d: string) => { try { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; } catch { return ''; } };

export default function NCIMyRequests() {
  const { getUserId } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await getNTFOwnRequests(getUserId());
        if (res.success) {
          setRequests(res.requests || []);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [getUserId]);

  const filtered = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    return !q || (r.purpose || '').toLowerCase().includes(q) || (r.destination || '').toLowerCase().includes(q);
  });

  if (isLoading) {
    return <div className="space-y-4"><SkeletonList count={5} /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Requests</h2>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 h-11 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <FileText className="w-12 h-12 text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">No requests found</p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{req.purpose || 'Gate Pass Request'}</h3>
                  <p className="text-xs text-slate-400">{req.destination || 'N/A'}</p>
                </div>
                <span className="text-[10px] text-slate-400">{relTime(req.createdAt || '')}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {req.status === 'APPROVED' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : req.status === 'REJECTED' ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={cn('text-xs font-bold uppercase',
                    req.status === 'APPROVED' ? 'text-emerald-600' :
                    req.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                  )}>
                    {req.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
