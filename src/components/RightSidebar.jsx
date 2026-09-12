import React from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { 
  RotateCw, 
  Flag, 
  Circle, 
  Mail, 
  Phone, 
  Maximize2, 
  Search,
  UserCheck,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const RightSidebar = () => {
  const { visitors, openBadgeModal, setIsCheckInOpen } = useVisitorContext();

  const sampleVisitor1 = visitors[0] || { fullName: 'Logan Davidson', company: 'Follow up mail', hostName: 'Engr. Marcus Sterling' };
  const sampleVisitor2 = visitors[1] || { fullName: 'Megan Pearce', company: 'First customer call', hostName: 'Dr. Alex Rivera' };

  const activeVisitors = visitors.filter(v => v.status !== 'Checked-Out');

  return (
    <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 py-2 font-sans select-none">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-soft-card border border-white/80 space-y-5 h-full flex flex-col justify-between">
        <div className="space-y-5">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-realty-dark tracking-tight">Security Live Feed</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <button 
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-realty-textSecondary flex items-center justify-center text-xs transition"
              title="Refresh Activity Feed"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Activity Item 1 */}
          <div className="space-y-3 relative pl-6 border-l-2 border-dashed border-gray-200">
            {/* Timeline Pin */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-realty-dark flex items-center justify-center text-[8px] text-white">
              <Flag className="w-2.5 h-2.5 text-pastel-lime" />
            </div>

            <div className="flex items-center justify-between text-xs text-realty-textMuted font-medium">
              <span className="font-bold text-realty-dark">Executive VIP Entry</span>
              <span>1:23 pm</span>
            </div>

            {/* Gate Activity Card */}
            <div className="bg-realty-cardSubtle rounded-2xl p-2.5 border border-gray-100 space-y-2.5">
              <div className="relative rounded-xl overflow-hidden h-28">
                <img src="/timber.jpg" alt="Eko Atlantic Tower" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-tag-rental text-white text-[10px] font-bold">
                  Verified Gate Access
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="font-bold text-xs text-realty-dark">Eko Atlantic Tower Gate</div>
                <div className="text-[11px] text-realty-textMuted font-medium">Plot 1412 Victoria Island, Lagos, Nigeria</div>
              </div>

              {/* Pill tags & avatars strip */}
              <div className="flex items-center justify-between pt-1">
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-realty-dark shadow-xs">
                  Pass Badge Granted
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-6 h-6 rounded-full bg-realty-dark text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    +{activeVisitors.length}
                  </span>
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Avatar" className="w-6 h-6 rounded-full object-cover shadow-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Activity Item 2 */}
          <div className="space-y-3 relative pl-6 border-l-2 border-dashed border-gray-200">
            {/* Timeline Pin */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600">
              <Circle className="w-2 h-2 fill-current text-gray-500" />
            </div>

            <div className="flex items-center justify-between text-xs text-realty-textMuted font-medium">
              <span>Host Check-In</span>
              <span>1:20 pm</span>
            </div>

            {/* Activity Strip Tunde */}
            <div className="flex items-center justify-between bg-realty-cardSubtle p-2.5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5">
                <img 
                  src={sampleVisitor1.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"} 
                  alt={sampleVisitor1.fullName} 
                  className="w-8 h-8 rounded-full object-cover shadow-xs" 
                />
                <div>
                  <div className="font-bold text-xs text-realty-dark">{sampleVisitor1.fullName}</div>
                  <div className="text-[11px] text-realty-textMuted font-medium">{sampleVisitor1.company || 'Lagos State Infrastructure Ltd'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => openBadgeModal(sampleVisitor1)}
                  className="w-7 h-7 rounded-full bg-white text-realty-dark flex items-center justify-center text-xs shadow-xs hover:bg-gray-50 transition"
                  title="View Badge / Pass"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Activity Item 3 */}
          <div className="space-y-3 relative pl-6">
            {/* Timeline Pin */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600">
              <Circle className="w-2 h-2 fill-current text-gray-500" />
            </div>

            <div className="flex items-center justify-between text-xs text-realty-textMuted font-medium">
              <span>Security Clearance</span>
              <span>1:15 pm</span>
            </div>

            {/* Activity Strip Nneka */}
            <div className="flex items-center justify-between bg-realty-cardSubtle p-2.5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5">
                <img 
                  src={sampleVisitor2.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"} 
                  alt={sampleVisitor2.fullName} 
                  className="w-8 h-8 rounded-full object-cover shadow-xs" 
                />
                <div>
                  <div className="font-bold text-xs text-realty-dark">{sampleVisitor2.fullName}</div>
                  <div className="text-[11px] text-realty-textMuted font-medium">{sampleVisitor2.company || 'First Bank Nigeria Consult'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => openBadgeModal(sampleVisitor2)}
                  className="w-7 h-7 rounded-full bg-white text-realty-dark flex items-center justify-center text-xs shadow-xs hover:bg-gray-50 transition"
                  title="View Badge / Pass"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Search / Quick Visitor Search Bar */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-realty-textMuted" />
            <input 
              type="text" 
              placeholder="Search guest or host..." 
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-realty-dark placeholder-realty-textMuted focus:outline-none font-medium" 
            />
          </div>
          <button 
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className="px-3 py-1.5 rounded-full bg-realty-dark text-white text-xs font-bold hover:bg-realty-darkHover transition shadow-pill-active whitespace-nowrap"
          >
            Check-In
          </button>
        </div>

      </div>
    </aside>
  );
};
