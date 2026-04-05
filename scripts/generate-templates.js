const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

const templatesDir = path.join(__dirname, 'lib', 'rag', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

function createPdf(filename, title, content) {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(title, 10, 20);
  doc.setFontSize(12);
  
  const splitText = doc.splitTextToSize(content, 180);
  doc.text(splitText, 10, 30);
  
  doc.save(path.join(templatesDir, filename));
  console.log(`Created ${filename}`);
}

createPdf(
  'fir_template.pdf', 
  'FIR (First Information Report) Template', 
  'FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)\n\n1. District:\n2. Police Station:\n3. Year/FIR No:\n4. Date and Time of FIR:\n5. Name and Address of Informant/Complainant:\n6. Details of known/suspected/unknown accused with full particulars:\n7. Reasons for delay in reporting by the complainant/informant:\n8. Particulars of properties stolen/involved:\n9. Total value of properties stolen/involved:\n10. Inquest Report/U.D. Case No., if any:\n11. F.I.R. Contents (Attach separate sheet, if required):\n  - Incident Type:\n  - Date/Time:\n  - Location:\n  - Exact Description:\n12. Actions taken:\n\nSignature/Thumb impression of the Complainant/Informant\n\n[INSTRUCTIONS FOR GENERATION: Fill these fields accurately based on the case details. Maintain a formal, objective, legal tone.]'
);

createPdf(
  'police_complaint.pdf', 
  'Police Complaint Format', 
  'POLICE COMPLAINT\n\nTo,\nThe Officer-in-Charge,\n[Police Station Name/Location]\n\nDate: [Date of Complaint]\n\nSubject: Formal Complaint regarding [Incident Type] against [Perpetrator Name, if known].\n\nRespected Sir/Madam,\n\nI, [Survivor Name], residing at [Address], would like to bring to your attention a serious incident that occurred on [Date/Time] at [Location].\n\nINCIDENT DETAILS:\n[Chronological description of the events, exactly as stated by the survivor, sticking to facts without emotional exaggeration.]\n\nPARTIES INVOLVED:\n- Suspect(s): [Details]\n- Witness(es): [Details]\n\nEVIDENCE:\nI have attached/can provide the following evidence to support my claim: [List Evidence].\n\nI request you to kindly investigate this matter and register this complaint at the earliest.\n\nYours faithfully,\n\n(Signature)\n[Survivor Name]\n[Contact Information]\n\n[INSTRUCTIONS FOR GENERATION: Write this complaint from the first-person perspective unless acting as a legal representative. Ensure facts are arranged chronologically and logically.]'
);

createPdf(
  'legal_statement.pdf', 
  'Legal Statement Template', 
  'FORMAL LEGAL STATEMENT / AFFIDAVIT\n\nI, _______________, being of sound mind and legal age, do hereby solemnly declare and state as follows:\n\n1. I am making this statement voluntarily, without any threat, coercion, or promise of reward.\n2. On [Date] around [Time], at [Location], the following events transpired:\n   [Detailed account of the incident]\n3. The person(s) responsible for this incident is/are [Perpetrator Details].\n4. Previous patterns/incidents (if applicable): [Details of escalation or frequency]\n5. Impact: As a result of this incident, I have suffered [Physical/Emotional/Financial impacts].\n6. The above statements are true and correct to the best of my knowledge and belief.\n\nDate: ____________\nPlace: ____________\n\nSignature of Deponent: ______________________\n\n[INSTRUCTIONS FOR GENERATION: Keep the language clear, declarative, and solemn. Number paragraphs clearly. Focus heavily on exact dates, times, and actions.]'
);

createPdf(
  'case_summary.pdf', 
  'Lawyer Case Summary Brief', 
  'LEGAL CASE BRIEF & FACTUAL SUMMARY\n\nCONFIDENTIAL & PRIVILEGED\n\nMATTER: [Incident Type] / [Client/Survivor Ref]\nPREPARED ON: [Current Date]\n\nI. EXECUTIVE SUMMARY\n[2-3 paragraph high-level overview of the matter, severity, and urgency.]\n\nII. KEY ENTITIES\n- Complainant/Survivor: [Details]\n- Accused/Perpetrator: [Details, Relationship]\n- Key Witnesses: [Details]\n\nIII. TIMELINE OF EVENTS\n[Chronological bulleted list of all critical events, highlighting dates and locations.]\n\nIV. AVAILABLE EVIDENCE\n[Inventory of evidence with status (e.g., in possession, needs subpoena).]\n\nV. LEGAL STRENGTH & VULNERABILITIES\n- Strengths: [Factors supporting the case]\n- Weaknesses/Gaps: [Missing information, contradictory statements]\n- Recommended Next Steps: [Legal actions to take]\n\n[INSTRUCTIONS FOR GENERATION: This document is for the lawyer/advocate. Emphasize legal strengths, weaknesses, and evidence gaps. Be analytical and strategic.]'
);
