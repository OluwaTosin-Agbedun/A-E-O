import { Users, Mail, Linkedin, Globe } from 'lucide-react';
import { TEAM } from '../data';

export default function Team() {
  return (
    <section className="py-16 bg-white border-b border-line" id="team">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-purple font-semibold">Our People</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            The team behind the evidence
          </h2>
          <p className="text-ink2 text-base">
            We are data analysts, field supervisors, legal scholars, and communications professionals working together to elevate democratic transparent benchmarks.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TEAM.map((member) => (
            <div 
              key={member.id}
              className="bg-paper border border-line rounded-2xl p-6 text-center shadow-custom hover:shadow-md transition-all group hover:-translate-y-1"
            >
              {/* Initials Avatar with custom gradient */}
              <div className="w-18 h-18 rounded-2xl mx-auto mb-4 flex items-center justify-center font-display font-bold text-xl text-white bg-gradient-to-br from-brand-blue-dark to-navy shadow-inner group-hover:scale-105 transition-transform duration-300">
                {member.initials}
              </div>

              <h4 className="font-display font-bold text-base text-ink mb-1">
                {member.name}
              </h4>
              
              <p className="text-xs text-mut font-semibold uppercase tracking-wider mb-4">
                {member.role}
              </p>

              {/* Mock interactive Social icons */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-line/60">
                <button 
                  onClick={() => alert(`Contacting ${member.name} via AEO workspace secure mail.`)}
                  className="p-1.5 bg-white rounded-lg text-mut hover:text-brand-blue hover:bg-white shadow-sm border border-line transition-colors cursor-pointer"
                  title="Secure Mail"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <a 
                  href="#team"
                  onClick={(e) => { e.preventDefault(); alert("Linking to official LinkedIn profile validation pipeline."); }}
                  className="p-1.5 bg-white rounded-lg text-mut hover:text-brand-blue hover:bg-white shadow-sm border border-line transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <button 
                  onClick={() => alert(`Reading research publications by ${member.name}.`)}
                  className="p-1.5 bg-white rounded-lg text-mut hover:text-brand-purple hover:bg-white shadow-sm border border-line transition-colors cursor-pointer"
                  title="Scholarly bio"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
