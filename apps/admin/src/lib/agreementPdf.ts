import { jsPDF } from "jspdf"

export const AGREEMENT_TITLE = "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT"
export const AGREEMENT_VERSION = "1.0"

export function getAgreementTextLines(params: {
    date: string
    name: string
    storeId: string
    phone: string
    verificationMethod?: string
    verificationIdentifier?: string
}): string[] {
    const { date, name, storeId, phone } = params
    const shortStore = storeId ? storeId.substring(0, 8) : "0000"

    return [
        `This Agreement is entered into on ${date}, by and between:`,
        "",
        "Oneprovisiongrowth Pvt Ltd",
        "(Operating under the brand name Republic of Sabjiwala)",
        "PAN: AAECO7051N",
        "CIN: U46301RJ2025PTC102143",
        '(Hereinafter referred to as the "Company")',
        "",
        "AND",
        "",
        `${name}`,
        `Business Name: Store_${shortStore}`,
        '(Hereinafter referred to as the "Vendor")',
        "",
        'Collectively referred to as the "Parties".',
        "",
        "1. Purpose",
        "The Company has shared its business model, operational plan, and collaboration structure with the Vendor.",
        "This Agreement is intended to:",
        "• Protect the confidentiality of the shared information",
        "• Record the Vendor's interest and intent to collaborate with the Company",
        "",
        "2. Confidentiality",
        "The Vendor agrees that all information shared by the Company, including business model, pricing, vendor structure, and operational strategy, shall be treated as strictly confidential and shall not be disclosed or used for any unauthorized purpose.",
        "",
        "3. Acknowledgment of Discussion",
        "The Vendor confirms that:",
        "• The Company has explained its business model and collaboration structure",
        "• The Vendor has understood the concept and opportunity",
        "",
        "4. Expression of Intent",
        "The Vendor expresses a clear willingness and interest to collaborate with the Company.",
        "The Vendor agrees that:",
        "• They are open to entering into a formal legal agreement with the Company",
        "• They will not engage in any competing or conflicting activity using the shared information during this interim period",
        "",
        "5. Interim Understanding",
        "Until a formal agreement is executed:",
        "• Both Parties agree to proceed in good faith",
        "• This document acts as a temporary understanding and commitment of intent, not a final commercial agreement",
        "",
        "6. Non-Circumvention",
        "The Vendor shall not copy, replicate, or misuse the Company's business model, or bypass the network.",
        "",
        "7. Duration",
        "This Agreement shall remain valid for 6 (Six) months or until a formal agreement is executed, whichever is earlier.",
        "",
        "8. Digital Acceptance",
        "This Agreement shall be considered valid upon Digital Confirmation / OTP Verification.",
        "Such acceptance shall be legally valid under applicable Indian laws, including the Information Technology Act, 2000.",
        "",
        "9. Governing Law & Jurisdiction",
        "This Agreement shall be governed by the laws of India, subject to courts in Jaipur, Rajasthan.",
        "",
        "10. Acceptance & Signature Block",
        "Vendor Details:",
        `Name: ${name}`,
        `Contact Number: ${phone}`,
        "Acceptance Statement:",
        '"I confirm that I have understood the discussion and agree to the above terms."',
        "",
        `Digital Confirmation: verified via OTP (${phone})`,
        `Date & Time: ${date}`,
    ]
}

export function generateAndDownloadAgreementPdf(params: {
    name: string
    phone: string
    storeId: string
    date?: string
    verificationMethod?: string
    verificationIdentifier?: string
}) {
    const doc = new jsPDF()
    const dateStr = params.date || new Date().toLocaleDateString("en-IN")
    const name = params.name || "[Vendor Name]"
    const phone = params.phone || "N/A"

    const margin = 15
    const pageW = doc.internal.pageSize.getWidth()
    let cursorY = 20

    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text(AGREEMENT_TITLE, pageW / 2, cursorY, {
        align: "center",
    })

    cursorY += 15
    doc.setFontSize(9.5)
    doc.setFont("helvetica", "normal")

    const lines = getAgreementTextLines({
        date: dateStr,
        name,
        storeId: params.storeId,
        phone,
        verificationMethod: params.verificationMethod,
        verificationIdentifier: params.verificationIdentifier,
    })

    lines.forEach((line) => {
        if (cursorY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            cursorY = 20
        }
        const splitLines = doc.splitTextToSize(line, pageW - margin * 2)
        doc.text(splitLines, margin, cursorY)
        cursorY += splitLines.length * 4.8
    })

    const cleanName = name.replace(/[^a-zA-Z0-9]/g, "_")
    doc.save(`Vendor_Agreement_${cleanName}.pdf`)
}
