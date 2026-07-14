import { Calendar, MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { EVENTS } from '../data';

export default function Events() {
  return (
    <section className="py-16 bg-paper border-b border-line" id="events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-blue font-semibold">Observatory Engagements</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            Events — where to find us
          </h2>
          <p className="text-ink2 text-base">
            Participate in our live methodological briefings, post-election consensus forums, and comparative data workshops with key democratic partners.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTS.map((evt) => (
            <div 
              key={evt.id}
              className="bg-white border border-line rounded-xl p-6 shadow-custom hover:shadow-md transition-all flex items-start gap-5 relative group"
            >
              {/* Date Box */}
              <div className="flex-shrink-0 w-16 text-center border border-line rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-navy text-white text-[10px] font-mono py-1 font-bold tracking-wider uppercase">
                  {evt.month}
                </div>
                <div className="font-display font-bold text-2xl py-2 text-ink">
                  {evt.day}
                </div>
              </div>

              {/* Event Content */}
              <div className="space-y-2 flex-1">
                <h4 className="font-display font-bold text-base sm:text-lg text-ink group-hover:text-brand-blue transition-colors">
                  {evt.title}
                </h4>
                <p className="text-xs text-ink2 leading-relaxed">
                  {evt.description}
                </p>

                {/* Meta location & type */}
                <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono font-medium text-mut border-t border-line/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                    {evt.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-brand-purple" />
                    {evt.type}
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4 text-mut group-hover:text-brand-blue transition-colors">
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
