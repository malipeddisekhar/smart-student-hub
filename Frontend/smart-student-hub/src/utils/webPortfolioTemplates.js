export const generateWebTemplate = (templateName, data) => {
  const { name, headline, college, department, year, semester, profileData, ed, aboutMe, mergedSkills, mergedProjects, safeAcademicCerts, editorEducation, editorExperience, editorAwards } = data;

  const baseStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
  `;

  const templates = {
    minimalist: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${name} - Minimalist Portfolio</title>
          <style>
              ${baseStyles}
              body { color: #111; background: #fff; }
              .header { padding: 80px 0 40px; text-align: left; border-bottom: 1px solid #eaeaea; margin-bottom: 40px; }
              .header h1 { font-size: 3.5rem; font-weight: 300; letter-spacing: -1px; }
              .header p { font-size: 1.2rem; color: #666; margin-top: 10px; }
              .contact-info { margin-top: 20px; display: flex; gap: 20px; font-size: 0.9rem; }
              .contact-info a { color: #111; text-decoration: none; border-bottom: 1px solid #111; }
              .section { margin-bottom: 60px; }
              .section h2 { font-size: 1.5rem; font-weight: 400; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
              .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
              .card { border: 1px solid #eaeaea; padding: 25px; transition: transform 0.2s; }
              .card:hover { transform: translateY(-5px); }
              .card h3 { font-size: 1.2rem; margin-bottom: 10px; }
              .tag { background: #f4f4f4; padding: 4px 10px; font-size: 0.8rem; margin-right: 5px; margin-bottom: 5px; display: inline-block; }
              .profile-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  ${profileData?.profileImage ? `<img src="${profileData.profileImage}" alt="${name}" class="profile-img">` : ''}
                  <h1>${name}</h1>
                  <p>${headline}</p>
                  <div class="contact-info">
                      ${profileData?.mobileNumber ? `<a href="tel:${profileData.mobileNumber}">${profileData.mobileNumber}</a>` : ''}
                      ${profileData?.collegeEmail ? `<a href="mailto:${profileData.collegeEmail}">${profileData.collegeEmail}</a>` : ''}
                      ${profileData?.linkedinProfile ? `<a href="${profileData.linkedinProfile}" target="_blank">LinkedIn</a>` : ''}
                      ${profileData?.githubProfile ? `<a href="${profileData.githubProfile}" target="_blank">GitHub</a>` : ''}
                  </div>
              </div>

              ${aboutMe ? `<div class="section"><h2>About</h2><p style="font-size: 1.1rem; max-width: 800px;">${aboutMe}</p></div>` : ''}

              ${mergedSkills.length > 0 ? `
              <div class="section">
                  <h2>Skills</h2>
                  <div>${mergedSkills.map(skill => `<span class="tag">${skill}</span>`).join('')}</div>
              </div>` : ''}

              ${mergedProjects.length > 0 ? `
              <div class="section">
                  <h2>Projects</h2>
                  <div class="grid">
                      ${mergedProjects.map(project => `
                          <div class="card">
                              <h3>${project.title}</h3>
                              <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">${project.description || ''}</p>
                              <div style="margin-bottom: 15px;">${(project.technologies || '').split(',').map(t => t.trim() ? `<span class="tag">${t}</span>` : '').join('')}</div>
                              <div style="font-size: 0.9rem;">
                                  ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" style="color:#111; margin-right: 15px;">GitHub</a>` : ''}
                                  ${project.deployLink ? `<a href="${project.deployLink}" target="_blank" style="color:#111;">Live Demo</a>` : ''}
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>` : ''}

              ${editorExperience.length > 0 ? `
              <div class="section">
                  <h2>Experience</h2>
                  <div class="grid">
                      ${editorExperience.map(exp => `
                          <div class="card">
                              <h3>${exp.title}</h3>
                              <p style="color: #666; font-size: 0.9rem;">${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                              <p style="margin-top: 10px; font-size: 0.9rem;">${exp.description || ''}</p>
                          </div>
                      `).join('')}
                  </div>
              </div>` : ''}
          </div>
      </body>
      </html>
    `,
    dark: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${name} - Dark Portfolio</title>
          <style>
              ${baseStyles}
              body { background: #0f172a; color: #e2e8f0; font-family: 'Inter', sans-serif; }
              a { color: #38bdf8; text-decoration: none; }
              .header { text-align: center; padding: 100px 20px; background: linear-gradient(to bottom, #1e293b, #0f172a); }
              .header h1 { font-size: 4rem; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; color: transparent; }
              .profile-img { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #38bdf8; margin-bottom: 20px; }
              .card { background: #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 20px; border: 1px solid #334155; }
              .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
              .tag { background: #0f172a; border: 1px solid #38bdf8; color: #38bdf8; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin: 0 5px 5px 0; }
              h2 { font-size: 2rem; margin-bottom: 30px; color: #f8fafc; border-bottom: 2px solid #334155; padding-bottom: 10px;}
              .contact-links { margin-top: 20px; display: flex; justify-content: center; gap: 20px; }
          </style>
      </head>
      <body>
          <div class="header">
              ${profileData?.profileImage ? `<img src="${profileData.profileImage}" alt="${name}" class="profile-img">` : ''}
              <h1>${name}</h1>
              <p style="font-size: 1.5rem; color: #94a3b8;">${headline}</p>
              <div class="contact-links">
                  ${profileData?.linkedinProfile ? `<a href="${profileData.linkedinProfile}">LinkedIn</a>` : ''}
                  ${profileData?.githubProfile ? `<a href="${profileData.githubProfile}">GitHub</a>` : ''}
                  ${profileData?.collegeEmail ? `<a href="mailto:${profileData.collegeEmail}">Email</a>` : ''}
              </div>
          </div>
          <div class="container">
              ${aboutMe ? `<div style="margin-bottom: 60px; text-align: center; font-size: 1.2rem; color: #cbd5e1; max-width: 800px; margin-left: auto; margin-right: auto;">${aboutMe}</div>` : ''}
              
              <div style="margin-bottom: 60px;">
                  <h2>Tech Stack</h2>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">${mergedSkills.map(skill => `<span class="tag">${skill}</span>`).join('')}</div>
              </div>

              ${mergedProjects.length > 0 ? `
              <div style="margin-bottom: 60px;">
                  <h2>Featured Projects</h2>
                  <div class="grid">
                      ${mergedProjects.map(p => `
                          <div class="card">
                              <h3 style="color: #f8fafc; font-size: 1.3rem; margin-bottom: 10px;">${p.title}</h3>
                              <p style="color: #94a3b8; margin-bottom: 15px; font-size: 0.95rem;">${p.description || ''}</p>
                              <div style="margin-bottom: 15px;">${(p.technologies || '').split(',').map(t => t.trim() ? `<span class="tag" style="border-color:#475569; color:#94a3b8;">${t}</span>` : '').join('')}</div>
                              <div>
                                  ${p.githubLink ? `<a href="${p.githubLink}" target="_blank" style="margin-right: 15px;">GitHub -></a>` : ''}
                                  ${p.deployLink ? `<a href="${p.deployLink}" target="_blank">Demo -></a>` : ''}
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>` : ''}
          </div>
      </body>
      </html>
    `,
    terminal: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${name} - Terminal</title>
          <style>
              body { background: #282a36; color: #f8f8f2; font-family: 'Consolas', 'Courier New', monospace; padding: 40px; }
              .prompt { color: #50fa7b; }
              .path { color: #bd93f9; }
              .cmd { color: #f8f8f2; font-weight: bold; }
              .output { color: #6272a4; margin-bottom: 20px; white-space: pre-wrap; }
              .highlight { color: #ff79c6; }
              .link { color: #8be9fd; text-decoration: none; }
              .link:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <div><span class="prompt">guest@portfolio</span>:<span class="path">~</span>$ <span class="cmd">cat whoami.txt</span></div>
          <div class="output">
Name: <span class="highlight">${name}</span>
Role: ${headline}
Email: <a href="mailto:${profileData?.collegeEmail}" class="link">${profileData?.collegeEmail}</a>
GitHub: <a href="${profileData?.githubProfile}" class="link">${profileData?.githubProfile}</a>
          </div>

          <div><span class="prompt">guest@portfolio</span>:<span class="path">~</span>$ <span class="cmd">cat about.md</span></div>
          <div class="output">${aboutMe || 'Loading...'}</div>

          <div><span class="prompt">guest@portfolio</span>:<span class="path">~</span>$ <span class="cmd">ls ./skills/</span></div>
          <div class="output">${mergedSkills.join('  ')}</div>

          <div><span class="prompt">guest@portfolio</span>:<span class="path">~</span>$ <span class="cmd">cat projects.json</span></div>
          <div class="output">[
${mergedProjects.map(p => `  {
    "title": "${p.title}",
    "tech": "${p.technologies || ''}",
    "url": "${p.deployLink || p.githubLink || ''}"
  }`).join(',\n')}
]</div>
          <div><span class="prompt">guest@portfolio</span>:<span class="path">~</span>$ <span class="cmd animate-pulse">_</span></div>
      </body>
      </html>
    `,
    creative: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${name} - Creative Portfolio</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap');
              body { font-family: 'Space Grotesk', sans-serif; background: #fffcf2; color: #252422; margin: 0; }
              .hero { padding: 100px 5vw; background: #eb5e28; color: #fffcf2; }
              .hero h1 { font-size: 5vw; margin: 0; line-height: 1; text-transform: uppercase; }
              .hero p { font-size: 2vw; margin-top: 20px; opacity: 0.9; }
              .container { padding: 50px 5vw; }
              .masonry { display: column; column-count: 2; column-gap: 30px; }
              @media (max-width: 768px) { .masonry { column-count: 1; } }
              .card { background: #403d39; color: #fffcf2; padding: 30px; border-radius: 20px; break-inside: avoid; margin-bottom: 30px; }
              .card.light { background: #ccc5b9; color: #252422; }
              .tag { background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 30px; display: inline-block; margin: 5px 5px 0 0; }
              .card.light .tag { background: rgba(0,0,0,0.1); }
              .marquee { background: #252422; color: #fffcf2; padding: 20px 0; overflow: hidden; white-space: nowrap; font-size: 2rem; text-transform: uppercase; }
          </style>
      </head>
      <body>
          <div class="hero">
              <h1>Hello, I'm <br/>${name}</h1>
              <p>${headline}</p>
          </div>
          <div class="marquee"><div style="display:inline-block; animation: scroll 20s linear infinite;">${mergedSkills.join(' ★ ')} ★ </div></div>
          <div class="container">
              <h2 style="font-size: 3rem; margin-bottom: 40px;">Selected Works</h2>
              <div class="masonry">
                  ${mergedProjects.map((p, i) => `
                      <div class="card ${i % 2 !== 0 ? 'light' : ''}">
                          <h2>${p.title}</h2>
                          <p style="margin: 20px 0; font-size: 1.1rem;">${p.description || ''}</p>
                          <div>${(p.technologies || '').split(',').map(t => t.trim() ? `<span class="tag">${t}</span>` : '').join('')}</div>
                          <div style="margin-top:20px;">
                              ${p.githubLink ? `<a href="${p.githubLink}" style="color:inherit;text-decoration:underline;">GitHub</a>` : ''}
                          </div>
                      </div>
                  `).join('')}
              </div>
          </div>
      </body>
      </html>
    `,
    elegant: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${name} - Elegant Portfolio</title>
          <style>
              body { font-family: 'Playfair Display', Georgia, serif; background: #fbfbfb; color: #2c3e50; line-height: 1.8; margin: 0; }
              .container { max-width: 900px; margin: 0 auto; padding: 60px 30px; }
              .header { text-align: center; margin-bottom: 80px; }
              .header h1 { font-size: 3.5rem; font-weight: normal; margin-bottom: 10px; font-style: italic; }
              .header p { font-size: 1.2rem; color: #7f8c8d; }
              .divider { width: 50px; height: 2px; background: #c0392b; margin: 40px auto; }
              .section-title { text-align: center; font-size: 2rem; font-weight: normal; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px;}
              .item { margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #ecf0f1; }
              .item:last-child { border: none; }
              .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px; }
              .item-header h3 { font-size: 1.5rem; margin: 0; }
              .item-header span { font-style: italic; color: #7f8c8d; }
              .skills { text-align: center; line-height: 2.5; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${name}</h1>
                  <p>${headline}</p>
                  <div class="divider"></div>
                  <p style="font-family: 'Lato', sans-serif; max-width: 600px; margin: 0 auto;">${aboutMe}</p>
              </div>

              <h2 class="section-title">Experience</h2>
              ${editorExperience.map(exp => `
                  <div class="item">
                      <div class="item-header">
                          <h3>${exp.title} at ${exp.company}</h3>
                          <span>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <p style="font-family: 'Lato', sans-serif;">${exp.description || ''}</p>
                  </div>
              `).join('')}

              <h2 class="section-title">Projects</h2>
              ${mergedProjects.map(p => `
                  <div class="item">
                      <div class="item-header">
                          <h3>${p.title}</h3>
                      </div>
                      <p style="font-family: 'Lato', sans-serif;">${p.description || ''}</p>
                      <p style="font-family: 'Lato', sans-serif; font-size: 0.9rem; color: #c0392b;">${p.technologies || ''}</p>
                  </div>
              `).join('')}

              <h2 class="section-title">Expertise</h2>
              <div class="skills" style="font-family: 'Lato', sans-serif;">
                  ${mergedSkills.join(' &nbsp;•&nbsp; ')}
              </div>
          </div>
      </body>
      </html>
    `
  };

  return templates[templateName] || templates['minimalist'];
};
