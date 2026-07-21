"use client";

import { useState } from "react";
import MemberLayout from "@/components/memberLayout";
import { ChevronDown, ChevronUp, Download, BookMarked } from "lucide-react";
import jsPDF from "jspdf";

interface Section {
  title: string;
  content: string;
}

const handbookSections: Section[] = [
  {
    title: "Tenets and Codes of Conduct",
    content: `
As a member of The Tau Gamma Phi TRISKELION'S Grand Fraternity, you are expected to uphold the following tenets:

1. Honor
- Maintain honesty and integrity in all your actions.
- Represent the fraternity positively in public and private settings.

2. Loyalty
- Demonstrate unwavering loyalty to your brothers and the organization.
- Support fraternity activities and initiatives consistently.

3. Brotherhood
- Foster strong bonds among members through cooperation, respect, and support.
- Engage in mentorship and guidance for new members.

4. Integrity
- Uphold ethical standards and make principled decisions.
- Avoid misconduct, dishonesty, or behavior that harms the fraternity's reputation.

5. Service
- Contribute to the community through organized fraternity projects.
- Participate in initiatives that help fellow members and society.

Violations of these codes can lead to disciplinary action, including warnings, suspension, or revocation of membership. Respect, discipline, and integrity are the core of our brotherhood.
    `,
  },
  {
    title: "Fraternity Constitution",
    content: `
The Constitution governs the structure, governance, and operations of the fraternity:

1. Structure
- Supreme Council: the highest governing body responsible for decision-making.
- Chapter Officers: manage chapter-level administration.
- General Members: uphold fraternity principles and participate in events.

2. Rights and Responsibilities
- Members have the right to vote on chapter matters and participate in events.
- Members must attend meetings, adhere to codes, and participate in projects.

3. Governance Processes
- Elections are held annually for officer positions.
- Amendments to the constitution require a two-thirds vote of the Supreme Council.

4. Discipline
- Misconduct is handled through a disciplinary committee.
- Appeals may be submitted to the Supreme Council.

Members must abide by the Constitution to maintain good standing within the fraternity.
    `,
  },
  {
    title: "Chapter House Rules",
    content: `
Chapter house rules ensure safety, respect, and harmony among members:

1. Attendance
- Members must attend all mandatory meetings and chapter events.
- Absences must be communicated and excused in advance.

2. Respect
- Treat fellow members, alumni, and guests with courtesy.
- Maintain a safe and welcoming environment at all times.

3. Maintenance
- Keep chapter facilities clean and orderly.
- Report damages or issues to chapter officers immediately.

4. Conduct
- Hazing, bullying, or any form of abuse is strictly prohibited.
- Substance abuse is not allowed within the chapter premises.

5. Accountability
- Members must report violations of rules to officers.
- Participation in fraternity activities is a responsibility, not a privilege.

Following these rules ensures a safe, productive, and honorable chapter environment.
    `,
  },
  {
    title: "By-Laws of the Verdant Alumni Triskelion Organization",
    content: `
The By-Laws of the alumni organization guide alumni engagement and responsibilities:

1. Membership Criteria
- Only members who have completed their tenure in good standing are eligible.
- Alumni must uphold fraternity principles even after graduation.

2. Roles and Responsibilities
- Alumni may mentor active members.
- Assist in chapter initiatives and community projects.

3. Participation
- Attend alumni meetings, events, and fundraising activities.
- Contribute expertise and guidance to support the chapter.

4. Financial Contributions
- Alumni are encouraged to contribute to fraternity funds for sustainability.
- Contributions support scholarships, projects, and chapter operations.

5. Governance
- Alumni officers are elected annually.
- Decisions affecting alumni activities require a majority vote.

Compliance with the by-laws maintains unity, continuity, and the legacy of the fraternity.
    `,
  },
];

export default function DigitalHandbookPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const logoUrls = ["/1979.jpg", "/aug1979.jpg", "/2005.jpg", "/2007.jpg"];
    const loadedImages: HTMLImageElement[] = [];
    let imagesLoaded = 0;

    const addWatermark = () => {
      doc.setFontSize(14);
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "normal");
      doc.saveGraphicsState();
      const spacingX = 80;
      const spacingY = 50;
      for (let y = 30; y < pageHeight + 40; y += spacingY) {
        for (let x = 10; x < pageWidth + 60; x += spacingX) {
          doc.text("Tau Gamma Las Piñas", x, y, { angle: 45 });
        }
      }
      doc.restoreGraphicsState();
      doc.setTextColor(0, 0, 0);
    };

    const generatePDF = () => {
      addWatermark();
      const logoWidth = 30;
      const logoSpacing = 5;
      const totalWidth = logoWidth * 4 + logoSpacing * 3;
      const startX = (pageWidth - totalWidth) / 2;
      loadedImages.forEach((img, index) => {
        const logoHeight = (img.height / img.width) * logoWidth;
        doc.addImage(
          img,
          "JPEG",
          startX + index * (logoWidth + logoSpacing),
          10,
          logoWidth,
          logoHeight,
        );
      });
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        "The Tau Gamma Phi TRISKELION'S Grand Fraternity",
        pageWidth / 2,
        60,
        { align: "center" },
      );
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Verdant  - Las Piñas Chapter", pageWidth / 2, 70, {
        align: "center",
      });
      let yOffset = 90;
      handbookSections.forEach((section, index) => {
        if (yOffset > pageHeight - 50) {
          doc.addPage();
          addWatermark();
          yOffset = 20;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${section.title}`, 20, yOffset);
        yOffset += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(section.content.trim(), 170);
        lines.forEach((line: string) => {
          if (yOffset > pageHeight - 20) {
            doc.addPage();
            addWatermark();
            yOffset = 20;
          }
          doc.text(line, 20, yOffset);
          yOffset += 6;
        });
        yOffset += 10;
      });
      doc.save("PTAO Digital Handbook.pdf");
    };

    logoUrls.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImages[index] = img;
        imagesLoaded++;
        if (imagesLoaded === logoUrls.length) generatePDF();
      };
      img.onerror = () => {
        imagesLoaded++;
        if (imagesLoaded === logoUrls.length) generatePDF();
      };
    });
  };

  return (
    <MemberLayout>
      <div className="min-h-screen bg-[#f2faf2] overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#e8f5e8] rounded-lg shrink-0">
                <BookMarked className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-[#1a2e1a] truncate">
                  Digital Handbook
                </h1>
                <p className="text-xs text-[#6b8f6b]">
                  Tau Gamma Phi TRISKELION'S Grand Fraternity
                </p>
              </div>
            </div>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-[#1a4d1a] hover:bg-[#163f16] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-3">
          {/* Subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-[#1a2e1a]">
              Verdant - Las Piñas Chapter
            </h2>
            <p className="text-xs text-[#6b8f6b] mt-1">
              Explore the sections below for detailed information.
            </p>
          </div>

          {/* Accordion Sections */}
          {handbookSections.map((section, index) => (
            <div
              key={index}
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200
                border-l-4 border-l-[#1a4d1a]
                ${
                  openIndex === index
                    ? "border-[#1a4d1a] shadow-md"
                    : "border-[#d0e8d0] hover:border-[#1a4d1a] hover:shadow-sm"
                }`}
            >
              {/* Accordion Header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f2faf2] transition-colors"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e8f5e8] text-[#1a4d1a] text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-[#1a2e1a] truncate">
                    {section.title}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-[#1a4d1a] shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6b8f6b] shrink-0 ml-2" />
                )}
              </button>

              {/* Accordion Content */}
              {openIndex === index && (
                <div className="px-5 pb-5 border-t border-[#d0e8d0]">
                  <pre className="text-xs text-[#3d5c3d] leading-relaxed whitespace-pre-wrap font-sans pt-4">
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </MemberLayout>
  );
}
