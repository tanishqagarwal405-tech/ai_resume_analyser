const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReport = async (resume, user) => {
  const reportsDir = path.join(__dirname, '../uploads/reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const fileName = `report_${resume._id}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const a = resume.analysis;
    const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#4F46E5');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
       .text('AI Resume Analysis Report', 50, 30);
    doc.font('Helvetica').fontSize(11)
       .text(`${user.name}  •  ${new Date().toLocaleDateString()}`, 50, 62);
    doc.fillColor('#1F2937');

    // Scores
    doc.moveDown(3);
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Score Summary', 50, 120);
    doc.moveTo(50, 140).lineTo(545, 140).stroke('#4F46E5');

    let x = 50;
    [{ label: 'ATS Score', value: a.atsScore }, { label: 'Overall Score', value: a.overallScore },
     { label: 'Job Match', value: a.jobMatchScore }].forEach(s => {
      if (s.value !== null && s.value !== undefined) {
        doc.rect(x, 150, 150, 75).fill('#F3F4F6');
        doc.font('Helvetica-Bold').fontSize(34).fillColor(scoreColor(s.value))
           .text(`${s.value}`, x + 15, 163, { width: 120, align: 'center' });
        doc.font('Helvetica').fontSize(10).fillColor('#6B7280')
           .text(s.label, x + 15, 203, { width: 120, align: 'center' });
        x += 160;
      }
    });

    // Section scores
    let yPos = 250;
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Section Breakdown', 50, yPos);
    yPos += 25;
    doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#4F46E5');
    yPos += 15;

    if (a.sectionScores) {
      Object.entries(a.sectionScores).forEach(([section, score]) => {
        doc.font('Helvetica').fontSize(12).fillColor('#1F2937')
           .text(section.charAt(0).toUpperCase() + section.slice(1), 50, yPos, { width: 120 });
        doc.rect(175, yPos + 3, 300, 10).fill('#E5E7EB');
        doc.rect(175, yPos + 3, Math.max((score / 100) * 300, 2), 10).fill(scoreColor(score));
        doc.font('Helvetica-Bold').fontSize(11).fillColor(scoreColor(score))
           .text(`${score}%`, 485, yPos);
        yPos += 25;
      });
    }

    // Strengths
    yPos += 10;
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Strengths', 50, yPos);
    yPos += 22; doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#4F46E5'); yPos += 10;
    (a.strengths || []).forEach(s => {
      doc.font('Helvetica').fontSize(11).fillColor('#10b981').text('✓ ', 50, yPos, { continued: true })
         .fillColor('#1F2937').text(s, { width: 480 });
      yPos += 20;
    });

    // Weaknesses
    yPos += 10;
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Areas to Improve', 50, yPos);
    yPos += 22; doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#4F46E5'); yPos += 10;
    (a.weaknesses || []).forEach(w => {
      doc.font('Helvetica').fontSize(11).fillColor('#ef4444').text('✗ ', 50, yPos, { continued: true })
         .fillColor('#1F2937').text(w, { width: 480 });
      yPos += 20;
    });

    // Suggestions
    if (yPos > 650) { doc.addPage(); yPos = 50; }
    yPos += 10;
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Suggestions', 50, yPos);
    yPos += 22; doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#4F46E5'); yPos += 10;
    (a.suggestions || []).forEach((s, i) => {
      if (yPos > 720) { doc.addPage(); yPos = 50; }
      doc.rect(50, yPos - 2, 495, 22).fill('#EEF2FF');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#4F46E5')
         .text(`${i + 1}.`, 58, yPos, { continued: true })
         .font('Helvetica').fillColor('#1F2937').text(` ${s}`, { width: 470 });
      yPos += 28;
    });

    // Skills
    if (yPos > 650) { doc.addPage(); yPos = 50; }
    yPos += 10;
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#4F46E5').text('Skills', 50, yPos);
    yPos += 22; doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#4F46E5'); yPos += 10;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#10b981').text('Found:', 50, yPos); yPos += 18;
    doc.font('Helvetica').fontSize(10).fillColor('#1F2937')
       .text((a.skillsFound || []).join('  •  '), 50, yPos, { width: 495 });
    yPos += 25;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#ef4444').text('Missing:', 50, yPos); yPos += 18;
    doc.font('Helvetica').fontSize(10).fillColor('#1F2937')
       .text((a.missingSkills || []).join('  •  '), 50, yPos, { width: 495 });

    // Footer
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.font('Helvetica').fontSize(9).fillColor('#9CA3AF')
         .text(`ResumeAI  |  Page ${i + 1} of ${range.count}`, 50, doc.page.height - 40, {
           width: doc.page.width - 100, align: 'center'
         });
    }

    doc.end();
    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
};

module.exports = { generateReport };