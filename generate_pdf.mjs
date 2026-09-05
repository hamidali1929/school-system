import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4"
});

// Primary Colors
const primaryColor = [0, 51, 102];
const darkText = [15, 23, 42];
const mutedText = [100, 116, 139];
const emeraldColor = [16, 185, 129];

// Header Banner
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.roundedRect(10, 10, 190, 45, 6, 6, "F");

doc.setTextColor(250, 204, 21); // Yellow accent
doc.setFontSize(8);
doc.setFont("helvetica", "bold");
doc.text("ARCHITECTURE SPECIFICATION V2.0", 18, 20);

doc.setTextColor(255, 255, 255);
doc.setFontSize(18);
doc.text("School Management System", 18, 30);

doc.setFontSize(9);
doc.setFont("helvetica", "normal");
doc.setTextColor(200, 225, 255);
doc.text("Dynamic Multi-Client White-Label Architecture, Algorithm & Flowchart", 18, 37);

doc.setFontSize(8);
doc.setTextColor(150, 200, 255);
doc.text("Engine: Google Cloud Firestore (Spark Free Plan) | 500,000+ Students Capacity", 18, 46);

// Section 1: Executive Summary
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("1. Architecture Overview & Core Concept", 10, 65);

doc.setFontSize(9);
doc.setFont("helvetica", "normal");
doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
const summaryText = "This system utilizes a dynamic white-label client-isolated architecture. When distributing to any school, the software dynamically connects to the client's own private Google Firebase instance without modifying source code or exposing developer credentials. The developer pays $0 in hosting, while client schools retain 100% data ownership and privacy.";
doc.text(doc.splitTextToSize(summaryText, 190), 10, 72);

// Section 2: Technical Algorithm
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("2. Technical Algorithm (Step-by-Step Logic)", 10, 95);

// Algorithm Box
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(10, 100, 190, 85, 4, 4, "FD");

doc.setFontSize(8);
doc.setFont("courier", "bold");
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text("[ PHASE A: SYSTEM INITIALIZATION & DYNAMIC RESOLUTION ]", 14, 108);

doc.setFont("courier", "normal");
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
const phaseAText = [
  "1. START Application boot.",
  "2. Query LocalStorage for key 'CUSTOM_FIREBASE_CONFIG':",
  "   - IF exists: activeConfig = JSON.parse(CUSTOM_FIREBASE_CONFIG)",
  "   - ELSE:     activeConfig = DEFAULT_ENV_VARIABLES (.env)",
  "3. Execute initializeApp(activeConfig) -> instantiate db & storage.",
  "4. Asynchronously fetch initial collections: students, teachers, app_data."
];
doc.text(phaseAText, 14, 114);

doc.setFont("courier", "bold");
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text("[ PHASE B: AUTO-REGEX PARSER & ZERO-TOUCH ONBOARDING ]", 14, 138);

doc.setFont("courier", "normal");
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
const phaseBText = [
  "5. Admin opens 'Cloud Database' modal and pastes raw snippet.",
  "6. Regex Parser extracts: apiKey, projectId, storageBucket, appId.",
  "7. Auto-populates all form input fields.",
  "8. On 'Save & Connect': saves config to LocalStorage and reloads app."
];
doc.text(phaseBText, 14, 144);

doc.setFont("courier", "bold");
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text("[ PHASE C: RUNTIME CRUD & BATCH OPERATIONS ]", 14, 164);

doc.setFont("courier", "normal");
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
const phaseCText = [
  "9. StoreContext dispatches mutations via adapter (supabase.from).",
  "10. Adapter executes Firestore writeBatch() in chunks of 450 items.",
  "11. Media/Photos upload directly to client's Firebase Cloud Storage."
];
doc.text(phaseCText, 14, 170);

// Section 3: Flowchart Architecture Description
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("3. System Flowchart Architecture", 10, 198);

doc.setFillColor(241, 245, 249);
doc.roundedRect(10, 203, 190, 48, 4, 4, "F");

doc.setFontSize(8);
doc.setFont("helvetica", "bold");
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text("FLOWCHART PIPELINE:", 15, 211);

doc.setFont("helvetica", "normal");
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
const flowSteps = [
  "[1] App Boot -> [2] Read LocalStorage (Custom vs Default) -> [3] Init Firebase",
  "[4] Render UI -> [5] Admin Setup (Paste Snippet) -> [6] Regex Auto-Parser",
  "[7] Form Auto-Filled -> [8] Save to Storage -> [9] Reload with New DB",
  "[10] User Mutation -> [11] Adapter writeBatch() -> [12] Client's Private Firestore"
];
doc.text(flowSteps, 15, 218);

// Section 4: Capacity Table
doc.setTextColor(darkText[0], darkText[1], darkText[2]);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("4. Firebase Free Tier Scaling Limits Matrix", 10, 260);

doc.setFontSize(7.5);
doc.setFont("helvetica", "normal");
doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
doc.text("• Database Document Storage: 1.0 GB Free = 500,000+ Students (~2KB/student)", 10, 267);
doc.text("• Media Cloud Storage: 5.0 GB Free = 100,000+ Passport Photos (~50KB/photo)", 10, 273);
doc.text("• Daily Quotas: 50,000 Reads & 20,000 Writes / Day (Sufficient for schools up to 5,000 students)", 10, 279);

// Footer
doc.setFontSize(7);
doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
doc.text("School Management System • Technical White-Label Architecture Document • Generated Automatically", 105, 290, { align: "center" });

const buffer = Buffer.from(doc.output("arraybuffer"));
fs.writeFileSync("school_system_architecture_and_algorithm.pdf", buffer);
console.log("PDF generated successfully!");
