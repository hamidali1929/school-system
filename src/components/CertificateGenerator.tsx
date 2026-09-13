// @ts-nocheck
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { X, Download, Award, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface CertificateGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseName: string;
  enrollmentDate?: string;
  logoUrl?: string;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  isOpen,
  onClose,
  studentName,
  courseName,
  enrollmentDate,
  logoUrl = '/logo1.webp'
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Format the date beautifully
  const formattedDate = enrollmentDate 
    ? new Date(enrollmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    
    try {
      // 1. Capture the DOM element as a high-resolution canvas
      // scale: 3 ensures it's super crisp for printing
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // 2. Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // 3. Create PDF (A4 Landscape)
      // A4 dimensions: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // 4. Add image to PDF exactly fitting the A4 landscape size
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

      // 5. Save the PDF
      pdf.save(`Certificate_${studentName.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-slate-100 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Certificate Preview</h3>
              <p className="text-xs text-slate-500 font-medium">High-Resolution Vector Rendering</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isGenerating ? 'Generating VIP PDF...' : 'Download HD PDF'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preview Area (Scrollable) */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-800">
          
          {/* 
            CERTIFICATE ACTUAL DOM 
            We design it at a fixed A4 pixel ratio so it scales perfectly into PDF.
            A4 Landscape at 96 DPI is ~1123px x 794px.
            We use a wrapper with fixed dimensions so html2canvas captures it exactly.
            In the UI, we can use CSS transform scale to fit it on smaller screens if needed, 
            but for the hidden/capture ref, we keep it exact.
          */}
          <div className="relative shadow-2xl bg-white select-none overflow-hidden" 
               style={{ width: '1123px', height: '794px', flexShrink: 0 }}>
            
            {/* The Reference Div for html2canvas */}
            <div ref={certificateRef} className="w-full h-full bg-white relative">
              
              {/* Outer Golden Border */}
              <div className="absolute inset-[15px] border-[6px] border-amber-600/90 rounded-sm z-10 pointer-events-none"></div>
              {/* Inner Intricate Border */}
              <div className="absolute inset-[25px] border-[2px] border-amber-800/40 rounded-sm z-10 pointer-events-none p-2">
                <div className="w-full h-full border border-amber-800/20"></div>
              </div>

              {/* Corner Ornaments (CSS based) */}
              <div className="absolute top-[20px] left-[20px] w-12 h-12 border-t-[4px] border-l-[4px] border-amber-800 z-20"></div>
              <div className="absolute top-[20px] right-[20px] w-12 h-12 border-t-[4px] border-r-[4px] border-amber-800 z-20"></div>
              <div className="absolute bottom-[20px] left-[20px] w-12 h-12 border-b-[4px] border-l-[4px] border-amber-800 z-20"></div>
              <div className="absolute bottom-[20px] right-[20px] w-12 h-12 border-b-[4px] border-r-[4px] border-amber-800 z-20"></div>

              {/* Faint Background Logo / Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] z-0 pointer-events-none">
                <img src={logoUrl} alt="Watermark" className="w-[600px] h-[600px] object-contain grayscale" />
              </div>

              {/* Main Content Area */}
              <div className="relative z-30 w-full h-full flex flex-col items-center pt-[70px] pb-[60px] px-[80px]">
                
                {/* Logo & School Name */}
                <div className="flex flex-col items-center mb-8">
                  <img src={logoUrl} alt="Logo" className="w-[90px] h-[90px] object-contain mb-4 drop-shadow-sm" />
                  <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-amber-800 text-sm font-bold tracking-[0.3em] uppercase">
                    Pioneer's Superior Science School & College
                  </h2>
                </div>

                {/* Certificate Title */}
                <div className="text-center mb-10">
                  <h1 style={{ fontFamily: "'Cinzel', serif" }} className="text-5xl font-black text-slate-900 tracking-wider mb-2">
                    CERTIFICATE
                  </h1>
                  <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl font-bold text-amber-700 tracking-[0.4em]">
                    OF EXCELLENCE
                  </h3>
                </div>

                {/* Body Text */}
                <p style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
                  This is proudly presented to
                </p>

                {/* Student Name */}
                <div className="w-full flex justify-center items-center mb-4 relative">
                  {/* Decorative line left */}
                  <div className="flex-1 border-b border-amber-200 mr-8"></div>
                  {/* Name */}
                  <h2 
                    style={{ fontFamily: "'Great Vibes', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.05)" }} 
                    className="text-7xl font-normal text-slate-800 leading-none px-4 pb-2 capitalize"
                  >
                    {studentName.toLowerCase()}
                  </h2>
                  {/* Decorative line right */}
                  <div className="flex-1 border-b border-amber-200 ml-8"></div>
                </div>

                {/* Course Details */}
                <p style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-sm font-medium text-slate-600 mb-6 text-center max-w-2xl leading-relaxed">
                  For successfully completing the comprehensive skill development program and demonstrating outstanding performance in
                </p>

                <h3 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-12">
                  {courseName}
                </h3>

                {/* Footer / Signatures */}
                <div className="w-full flex justify-between items-end px-16 mt-auto">
                  
                  {/* Date Signature */}
                  <div className="flex flex-col items-center">
                    <span style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-lg font-bold text-slate-800 mb-2">
                      {formattedDate}
                    </span>
                    <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                      Date of Issue
                    </span>
                  </div>

                  {/* Golden Seal (CSS) */}
                  <div className="relative flex items-center justify-center transform translate-y-[-10px]">
                    {/* Sunburst rays */}
                    <div className="absolute w-[120px] h-[120px] bg-amber-500 rotate-45 rounded-sm"></div>
                    <div className="absolute w-[120px] h-[120px] bg-amber-600 rotate-[30deg] rounded-sm"></div>
                    <div className="absolute w-[120px] h-[120px] bg-amber-400 rotate-[60deg] rounded-sm"></div>
                    {/* Inner circles */}
                    <div className="absolute w-[105px] h-[105px] bg-slate-900 rounded-full border-[3px] border-amber-200 z-10 flex flex-col items-center justify-center shadow-inner">
                      <Award className="w-8 h-8 text-amber-400 mb-1" />
                      <span className="text-[8px] font-bold text-amber-200 tracking-widest uppercase text-center leading-tight">
                        Certified<br/>Excellence
                      </span>
                    </div>
                  </div>

                  {/* Principal Signature */}
                  <div className="flex flex-col items-center">
                    {/* Simulated Signature */}
                    <span style={{ fontFamily: "'Alex Brush', cursive" }} className="text-4xl font-normal text-slate-800 mb-1 opacity-90 transform -rotate-2">
                      Nabeel Shehzad
                    </span>
                    <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                      Director / Principal
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
