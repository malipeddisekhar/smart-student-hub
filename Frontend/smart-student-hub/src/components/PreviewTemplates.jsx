import React from 'react';

// Helper: section heading
const SectionHead = ({ children, accent = '#4f46e5' }) => (
  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 6, marginBottom: 14, marginTop: 28 }}>{children}</h2>
);

// Helper: fallback text
const Empty = ({ text = 'Not provided yet' }) => (
  <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.85rem' }}>{text}</p>
);

/* ========== TEMPLATE 1: Single Column ATS-Friendly ========== */
export const SingleColumnTemplate = ({ data }) => {
  const { name, headline, email, phone, linkedin, github, aboutMe, education, experience, projects, skills, awards, languages, hobbies } = data;
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 800, margin: '0 auto', padding: 40, color: '#1a1a1a', lineHeight: 1.6, background: '#fff' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #1a1a1a', paddingBottom: 16 }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>{name}</h1>
        <p style={{ fontSize: '1rem', color: '#555', margin: '4px 0 10px' }}>{headline}</p>
        <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px' }}>
          {email && <span>✉ {email}</span>}
          {phone && <span>☎ {phone}</span>}
          {linkedin && <span>LinkedIn</span>}
          {github && <span>GitHub</span>}
        </div>
      </div>

      {/* Objective */}
      {aboutMe && <><SectionHead accent="#1a1a1a">Objective</SectionHead><p style={{ fontSize: '0.9rem' }}>{aboutMe}</p></>}

      {/* Education */}
      <SectionHead accent="#1a1a1a">Education</SectionHead>
      {education.length > 0 ? education.map((edu, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.95rem' }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>{[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
        </div>
      )) : <Empty />}

      {/* Experience */}
      {experience.length > 0 && <>
        <SectionHead accent="#1a1a1a">Experience</SectionHead>
        {experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</strong>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>{exp.startDate}{exp.startDate ? ` – ${exp.current ? 'Present' : exp.endDate}` : ''}</span>
            </div>
            {exp.description && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: 2 }}>{exp.description}</p>}
          </div>
        ))}
      </>}

      {/* Projects */}
      {projects.length > 0 && <>
        <SectionHead accent="#1a1a1a">Projects</SectionHead>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <strong>{p.title || 'Untitled'}</strong>
            {p.technologies && <span style={{ fontSize: '0.8rem', color: '#4f46e5', marginLeft: 8 }}>({p.technologies})</span>}
            {p.description && <p style={{ fontSize: '0.85rem', color: '#555', margin: '2px 0' }}>{p.description}</p>}
          </div>
        ))}
      </>}

      {/* Skills */}
      {skills.length > 0 && <>
        <SectionHead accent="#1a1a1a">Skills</SectionHead>
        <p style={{ fontSize: '0.9rem' }}>{skills.join(' • ')}</p>
      </>}

      {/* Awards */}
      {awards.length > 0 && <>
        <SectionHead accent="#1a1a1a">Awards</SectionHead>
        {awards.map((a, i) => <p key={i} style={{ fontSize: '0.85rem', marginBottom: 4 }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ''}</p>)}
      </>}

      {/* Languages & Hobbies */}
      <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
        {languages.length > 0 && <div><SectionHead accent="#1a1a1a">Languages</SectionHead><p style={{ fontSize: '0.85rem' }}>{languages.join(', ')}</p></div>}
        {hobbies.length > 0 && <div><SectionHead accent="#1a1a1a">Hobbies</SectionHead><p style={{ fontSize: '0.85rem' }}>{hobbies.join(', ')}</p></div>}
      </div>
    </div>
  );
};

/* ========== TEMPLATE 2: Two Column ========== */
export const TwoColumnTemplate = ({ data }) => {
  const { name, headline, email, phone, linkedin, github, aboutMe, education, experience, projects, skills, awards, languages, hobbies } = data;
  const accent = '#4f46e5';
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", display: 'flex', minHeight: '100%', background: '#fff', color: '#1a1a1a' }}>
      {/* Left Sidebar */}
      <div style={{ width: 260, background: '#1e293b', color: '#e2e8f0', padding: '36px 20px', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>{name}</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0' }}>{headline}</p>
        </div>
        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>Contact</h3>
          <div style={{ fontSize: '0.8rem', lineHeight: 2 }}>
            {email && <div>✉ {email}</div>}
            {phone && <div>☎ {phone}</div>}
            {linkedin && <div>💼 LinkedIn</div>}
            {github && <div>🐙 GitHub</div>}
          </div>
        </div>
        {/* Skills */}
        {skills.length > 0 && <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {skills.map((s, i) => <span key={i} style={{ background: '#334155', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', color: '#94a3b8' }}>{s}</span>)}
          </div>
        </div>}
        {/* Languages */}
        {languages.length > 0 && <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>Languages</h3>
          <p style={{ fontSize: '0.8rem' }}>{languages.join(', ')}</p>
        </div>}
        {/* Hobbies */}
        {hobbies.length > 0 && <div>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>Hobbies</h3>
          <p style={{ fontSize: '0.8rem' }}>{hobbies.join(', ')}</p>
        </div>}
      </div>

      {/* Right Content */}
      <div style={{ flex: 1, padding: '36px 32px' }}>
        {aboutMe && <><SectionHead accent={accent}>About Me</SectionHead><p style={{ fontSize: '0.9rem', color: '#555' }}>{aboutMe}</p></>}

        <SectionHead accent={accent}>Education</SectionHead>
        {education.length > 0 ? education.map((edu, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>{edu.institution}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''} {[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}</p>
          </div>
        )) : <Empty />}

        {experience.length > 0 && <>
          <SectionHead accent={accent}>Experience</SectionHead>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</strong>
              <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: 8 }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              {exp.description && <p style={{ fontSize: '0.85rem', color: '#555' }}>{exp.description}</p>}
            </div>
          ))}
        </>}

        {projects.length > 0 && <>
          <SectionHead accent={accent}>Projects</SectionHead>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong>{p.title}</strong>
              {p.technologies && <span style={{ color: accent, fontSize: '0.8rem', marginLeft: 6 }}>({p.technologies})</span>}
              {p.description && <p style={{ fontSize: '0.85rem', color: '#555' }}>{p.description}</p>}
            </div>
          ))}
        </>}

        {awards.length > 0 && <>
          <SectionHead accent={accent}>Awards</SectionHead>
          {awards.map((a, i) => <p key={i} style={{ fontSize: '0.85rem' }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ''}</p>)}
        </>}
      </div>
    </div>
  );
};

/* ========== TEMPLATE 3: 30-70 Split ========== */
export const SplitTemplate = ({ data }) => {
  const { name, headline, email, phone, linkedin, github, aboutMe, education, experience, projects, skills, awards, languages, hobbies } = data;
  const accent = '#059669';
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", display: 'flex', minHeight: '100%', background: '#fff', color: '#1a1a1a' }}>
      {/* Left 30% */}
      <div style={{ width: '30%', background: '#f0fdf4', padding: '36px 18px', borderRight: `3px solid ${accent}`, flexShrink: 0 }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: accent, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 700 }}>{(name || 'S')[0]}</div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{name}</h2>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>{headline}</p>
        </div>
        <div style={{ fontSize: '0.78rem', lineHeight: 2.2, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: accent, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, marginBottom: 4 }}>Contact</div>
          {email && <div>✉ {email}</div>}
          {phone && <div>☎ {phone}</div>}
          {linkedin && <div>💼 LinkedIn</div>}
          {github && <div>🐙 GitHub</div>}
        </div>
        {skills.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: accent, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, marginBottom: 6 }}>Skills</div>
          {skills.map((s, i) => <div key={i} style={{ fontSize: '0.78rem', padding: '2px 0' }}>• {s}</div>)}
        </div>}
        {languages.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: accent, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, marginBottom: 6 }}>Languages</div>
          <div style={{ fontSize: '0.78rem' }}>{languages.join(', ')}</div>
        </div>}
      </div>

      {/* Right 70% */}
      <div style={{ flex: 1, padding: '36px 28px' }}>
        {aboutMe && <><SectionHead accent={accent}>Profile</SectionHead><p style={{ fontSize: '0.88rem', color: '#555' }}>{aboutMe}</p></>}

        <SectionHead accent={accent}>Education</SectionHead>
        {education.map((edu, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
            <p style={{ fontSize: '0.8rem', color: '#555' }}>{edu.institution} {edu.gpa ? `• GPA: ${edu.gpa}` : ''} {[edu.startYear, edu.endYear].filter(Boolean).join('–')}</p>
          </div>
        ))}

        {experience.length > 0 && <>
          <SectionHead accent={accent}>Experience</SectionHead>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${accent}` }}>
              <strong>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</strong>
              <p style={{ fontSize: '0.75rem', color: '#888' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location ? `| ${exp.location}` : ''}</p>
              {exp.description && <p style={{ fontSize: '0.85rem', color: '#555' }}>{exp.description}</p>}
            </div>
          ))}
        </>}

        {projects.length > 0 && <>
          <SectionHead accent={accent}>Projects</SectionHead>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${accent}` }}>
              <strong>{p.title}</strong>
              {p.technologies && <span style={{ color: accent, fontSize: '0.78rem', marginLeft: 6 }}>({p.technologies})</span>}
              {p.description && <p style={{ fontSize: '0.85rem', color: '#555' }}>{p.description}</p>}
            </div>
          ))}
        </>}

        {awards.length > 0 && <>
          <SectionHead accent={accent}>Awards</SectionHead>
          {awards.map((a, i) => <p key={i} style={{ fontSize: '0.85rem' }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ''}</p>)}
        </>}
      </div>
    </div>
  );
};

/* ========== TEMPLATE 4: Modern Card Layout ========== */
export const ModernCardTemplate = ({ data }) => {
  const { name, headline, email, phone, linkedin, github, aboutMe, education, experience, projects, skills, awards, languages, hobbies } = data;
  const cardStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 16 };
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f8fafc', padding: '32px 24px', minHeight: '100%', color: '#1a1a1a' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', textAlign: 'center', padding: 36 }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>{name}</h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, margin: '4px 0 14px' }}>{headline}</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px', fontSize: '0.8rem', opacity: 0.8 }}>
            {email && <span>✉ {email}</span>}
            {phone && <span>☎ {phone}</span>}
            {linkedin && <span>💼 LinkedIn</span>}
            {github && <span>🐙 GitHub</span>}
          </div>
        </div>

        {/* About */}
        {aboutMe && <div style={cardStyle}><h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>About</h3><p style={{ fontSize: '0.88rem', color: '#555' }}>{aboutMe}</p></div>}

        {/* Two-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Education */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Education</h3>
            {education.length > 0 ? education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: '0.88rem' }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                <p style={{ fontSize: '0.78rem', color: '#888' }}>{edu.institution}</p>
              </div>
            )) : <Empty />}
          </div>
          {/* Skills */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.length > 0 ? skills.map((s, i) => <span key={i} style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>) : <Empty />}
            </div>
          </div>
        </div>

        {/* Experience */}
        {experience.length > 0 && <div style={cardStyle}>
          <h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Experience</h3>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</strong>
              <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: 8 }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              {exp.description && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: 2 }}>{exp.description}</p>}
            </div>
          ))}
        </div>}

        {/* Projects */}
        {projects.length > 0 && <div style={cardStyle}>
          <h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Projects</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {projects.map((p, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e5e7eb' }}>
                <strong style={{ fontSize: '0.9rem' }}>{p.title}</strong>
                {p.technologies && <p style={{ fontSize: '0.75rem', color: '#4f46e5', margin: '2px 0' }}>{p.technologies}</p>}
                {p.description && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </div>}

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {awards.length > 0 && <div style={cardStyle}><h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Awards</h3>{awards.map((a, i) => <p key={i} style={{ fontSize: '0.8rem' }}><strong>{a.title}</strong></p>)}</div>}
          {languages.length > 0 && <div style={cardStyle}><h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Languages</h3><p style={{ fontSize: '0.8rem' }}>{languages.join(', ')}</p></div>}
          {hobbies.length > 0 && <div style={cardStyle}><h3 style={{ fontSize: '0.9rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Hobbies</h3><p style={{ fontSize: '0.8rem' }}>{hobbies.join(', ')}</p></div>}
        </div>
      </div>
    </div>
  );
};
