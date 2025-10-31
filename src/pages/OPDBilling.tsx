// src/pages/OPDBilling.tsx
// deps: npm i react-to-print@^3 jspdf html2canvas
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisit, useOPDBills, useProcedureMasters } from '@/hooks/useOPD';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  User,
  Receipt,
  CreditCard,
  IndianRupee,
  Trash2,
  Package,
  FileText,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@/components/DataTable';
import type { OPDBill } from '@/types/opd.types';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ------------------------------- Brand Assets ------------------------------- */
/** Replace these URLs with your final public image links (PNG/JPG/SVG). */
const BILL_ASSETS = {
  header: 'https://your-cdn.com/pulse-side-strip.png',     // full-width header banner
  footer: 'https://your-cdn.com/pulse-footer.png',     // full-width footer banner
  sideStrip: 'https://your-cdn.com/pulse-side-strip.png', // thin vertical strip (optional)
  watermark: 'https://pulsehospitalpcmc.com/assets/logo-DRaM1pzk.png',  // faint center watermark (optional)
};

/* --------------------------------- Types --------------------------------- */

type BillingData = {
  opdTotal: string;
  procedureTotal: string;
  subtotal: string;
  discount: string;
  discountPercent: string;
  totalAmount: string;
  paymentMode: 'cash' | 'card' | 'upi' | 'bank';
  receivedAmount: string;
  balanceAmount: string;
};

interface ProcedureItem {
  id: string;
  procedure_id: number;
  procedure_name: string;
  procedure_code?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  notes: string;
}

/* --------------------------- Reusable Right Panel -------------------------- */

type BillingDetailsPanelProps = {
  data: BillingData;
  onChange: (field: string, value: string) => void;
  onFormatReceived: () => void;
};

const BillingDetailsPanel = memo(function BillingDetailsPanel({
  data,
  onChange,
  onFormatReceived,
}: BillingDetailsPanelProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Billing Summary</CardTitle>
        <CardDescription>Combined OPD & Procedure charges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">OPD Charges:</span>
            <span className="font-semibold">₹{data.opdTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Procedure Charges:</span>
            <span className="font-semibold">₹{data.procedureTotal}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Subtotal:</span>
            <span>₹{data.subtotal}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Discount</Label>
          <div className="flex gap-2">
            <Input
              id="discount"
              type="number"
              value={data.discount}
              onChange={(e) => onChange('discount', e.target.value)}
              className="flex-1"
              placeholder="0.00"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={data.discountPercent}
                onChange={(e) => onChange('discountPercent', e.target.value)}
                className="w-16"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <div className="relative">
            <Input
              id="totalAmount"
              type="number"
              value={data.totalAmount}
              className="pr-12 font-bold text-lg"
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              INR
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={data.paymentMode === 'cash' ? 'default' : 'outline'}
              className="w-full"
              size="sm"
              onClick={() => onChange('paymentMode', 'cash')}
            >
              <IndianRupee className="h-4 w-4 mr-1" />
              Cash
            </Button>
            <Button
              variant={data.paymentMode === 'card' ? 'default' : 'outline'}
              className="w-full"
              size="sm"
              onClick={() => onChange('paymentMode', 'card')}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Card
            </Button>
            <Button
              variant={data.paymentMode === 'upi' ? 'default' : 'outline'}
              className="w-full"
              size="sm"
              onClick={() => onChange('paymentMode', 'upi')}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              UPI
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receivedAmount">Received Amount</Label>
          <div className="relative">
            <Input
              id="receivedAmount"
              type="number"
              value={data.receivedAmount}
              onChange={(e) => onChange('receivedAmount', e.target.value)}
              onBlur={onFormatReceived}
              className="pr-12 text-green-600 font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              INR
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceAmount">Balance Amount</Label>
          <div className="relative">
            <Input
              id="balanceAmount"
              type="number"
              value={data.balanceAmount}
              className="pr-12 text-orange-600 font-semibold"
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              INR
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Button variant="default" className="w-full" size="lg">
            <Receipt className="mr-2 h-4 w-4" />
            Save Bill
          </Button>
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

/* ------------------------------ A4 Bill Shell ------------------------------ */
// Clean A4 bill layout with centered header text + left logo slot

  // --- Sticky, print-safe two-band footer used at the very bottom of A4 ---
  const PulseBillFooter: React.FC<{
    addressLine: string;
    contactLine: string;
  }> = ({ addressLine, contactLine }) => {
    const RED = '#e53935';
    const TEAL = '#1f585a';
    return (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 50, // above footer artwork
        }}
      >
        <div
          style={{
            background: RED,
            color: '#fff',
            padding: '6px 18mm',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          {addressLine}
        </div>
        <div
          style={{
            background: TEAL,
            color: '#fff',
            padding: '6px 18mm',
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {contactLine}
        </div>
      </div>
    );
  };



function BillLayoutA4({
  children,
  headerSrc,
  footerSrc,
  sideStripSrc,
  watermarkSrc,
  contentRef,

  // NEW: header content controls
  headerCenterLines = [
    'PULSE MULTISPECIALITY HOSPITAL',
    'S.No. 66/1, Tathawade Chowk, Aundh–Ravet Road, Pimpri-Chinchwad – 411033',
    'Phone: +91 8805331414  |  Email: pulsemhospital@gmail.com',
  ],
  logoSrc = 'https://pulsehospitalpcmc.com/assets/logo-DRaM1pzk.png',              // ← just pass your image link here
  headerHeight = 140,   // match your art
  footerHeight = 90,
  sideStripWidth = 16,
  logoWidthPx = 120,    // tweak logo size
  logoMaxHeightPx = 80, // keeps it within header
  logoLeftPx = 18,      // left inset
  logoTopPx = 18,       // top inset
}: {
  children: React.ReactNode;
  headerSrc: string;
  footerSrc: string;
  sideStripSrc?: string;
  watermarkSrc?: string;
  contentRef: React.RefObject<HTMLDivElement>;

  headerCenterLines?: string[];
  logoSrc?: string;
  headerHeight?: number;
  footerHeight?: number;
  sideStripWidth?: number;
  logoWidthPx?: number;
  logoMaxHeightPx?: number;
  logoLeftPx?: number;
  logoTopPx?: number;
}) {
  return (
  <div
    ref={contentRef}
    className="printable-area relative bg-white shadow-sm ring-1 ring-muted rounded-none"
    style={{
      width: '210mm',
      height: '297mm',              // fixed A4 height so footer can pin to bottom
      margin: '0 auto',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',           // prevent spill on first page
    }}
  >
    {/* Header artwork */}
    {headerSrc && (
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: headerHeight,
          backgroundImage: `url("${headerSrc}")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          zIndex: 5,
        }}
      />
    )}

    {/* Header content layer: logo + centered text */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        display: 'grid',
        gridTemplateColumns: '180px 1fr 180px',
        alignItems: 'center',
        padding: '0 12px',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <div style={{ position: 'relative', height: '100%' }}>
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Logo"
            style={{
              position: 'absolute',
              top: logoTopPx,
              left: logoLeftPx,
              width: `${logoWidthPx}px`,
              maxHeight: `${logoMaxHeightPx}px`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.18))',
            }}
          />
        ) : null}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.3, marginBottom: 4 }}>
          {headerCenterLines[0] || ''}
        </div>
        {headerCenterLines.slice(1).map((line, idx) => (
          <div key={idx} style={{ fontSize: 12, lineHeight: 1.25, opacity: 0.9, marginTop: idx ? 2 : 0 }}>
            {line}
          </div>
        ))}
      </div>

      <div />
      <div style={{width: "100%", border: "1px solid #000000", height: 1, position: "absolute", bottom: 10, left: 0}} />
    </div>

    {/* Footer artwork (behind two-band footer) */}
    {footerSrc && (
      <div
        style={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          height: footerHeight,
          backgroundImage: `url("${footerSrc}")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          zIndex: 10,
        }}
      />
    )}

    {/* Optional side strip */}
    {sideStripSrc && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: headerHeight,
          bottom: footerHeight,
          width: sideStripWidth,
          backgroundImage: `url("${sideStripSrc}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'left top',
          zIndex: 4,
        }}
      />
    )}

    {/* Optional watermark */}
    {watermarkSrc && (
      <div
        style={{
          position: 'absolute',
          inset: `${headerHeight}px 0 ${footerHeight}px 0`,
          opacity: 0.06,
          pointerEvents: 'none',
          backgroundImage: `url("${watermarkSrc}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '55%',
          zIndex: 1,
        }}
      />
    )}

    {/* Main page content */}
    <div
      style={{
        position: 'absolute',
        top: headerHeight,
        left: 0,
        right: 0,
        bottom: footerHeight + 48, // leave room for the two-band footer (≈ 48px)
        padding: '0 18mm',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      {children}
    </div>

    {/* Two-band footer pinned to the very bottom */}
    <PulseBillFooter
      addressLine="S. No. 66/1, Tathawade Chowk, Aundh-Ravet Road, Pimpri-Chinchwad"
      contactLine="Pune-33 | Phone: 8805331414 | Email: pulseicutpa@gmail.com"
    />

    <style>{`
      @page { size: A4; margin: 0; }
      @media print {
        html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
        .printable-area { height: 297mm !important; width: 210mm !important; }
        .no-print { display: none !important; }
      }
    `}</style>
  </div>
);

}


/* --------------------------------- Page --------------------------------- */

export default function OPDBilling() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  const { visit, isLoading: visitLoading, error: visitError } = useVisit(Number(visitId));
  const { opdBills, isLoading: billsLoading } = useOPDBills({ visit: Number(visitId) });
  const { procedureMasters, isLoading: proceduresLoading } = useProcedureMasters({ is_active: true });

  // Print/Export ref (ONLY this area prints/exports)
  const printAreaRef = useRef<HTMLDivElement>(null);

  // OPD Billing State
  const [opdFormData, setOpdFormData] = useState({
    receiptNo: '',
    billDate: new Date().toISOString().split('T')[0],
    billTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    doctor: '',
    opdType: 'consultation',
    opdSubType: 'na',
    chargeType: '',
    diagnosis: '',
    remarks: '',
    opdAmount: '0.00',
  });

  // Procedure Billing State
  const [procedureFormData, setProcedureFormData] = useState({
    doctor: '',
    procedures: [] as ProcedureItem[],
  });

  // Common Billing State (Right Panel)
  const [billingData, setBillingData] = useState<BillingData>({
    opdTotal: '0.00',
    procedureTotal: '0.00',
    subtotal: '0.00',
    discount: '0.00',
    discountPercent: '0',
    totalAmount: '0.00',
    paymentMode: 'cash',
    receivedAmount: '0.00',
    balanceAmount: '0.00',
  });

  // Procedure Search
  const [procedureSearch, setProcedureSearch] = useState('');

  // Map visit data to form when visit loads
  useEffect(() => {
    if (visit) {
      const receiptNo = visit.visit_number
        ? `BILL/${visit.visit_number.split('/').slice(1).join('/')}`
        : `BILL/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(
            new Date().getDate(),
          ).padStart(2, '0')}/001`;

      const isFollowUp = visit.is_follow_up || visit.visit_type === 'follow_up';

      const opdAmount = visit.doctor_details
        ? isFollowUp
          ? visit.doctor_details.follow_up_fee
          : visit.doctor_details.consultation_fee
        : '0.00';

      let chargeType = '';
      if (isFollowUp) chargeType = 'follow_up';
      else if (visit.visit_type === 'new') chargeType = 'first_visit';
      else chargeType = 'revisit';

      const billDate = visit.visit_date ? visit.visit_date : new Date().toISOString().split('T')[0];

      setOpdFormData((prev) => ({
        ...prev,
        receiptNo,
        billDate,
        doctor: visit.doctor?.toString() || '',
        opdType: 'consultation',
        opdSubType: 'na',
        chargeType,
        opdAmount,
      }));

      setProcedureFormData((prev) => ({
        ...prev,
        doctor: visit.doctor?.toString() || '',
      }));

      recalculateBilling(opdAmount, '0.00');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit]);

  // Recalculate billing totals
  const recalculateBilling = (
    opdTotal: string = billingData.opdTotal,
    procedureTotal: string = billingData.procedureTotal,
    discount: string = billingData.discount,
    received: string = billingData.receivedAmount,
  ) => {
    const opd = parseFloat(opdTotal) || 0;
    const procedure = parseFloat(procedureTotal) || 0;
    const disc = parseFloat(discount) || 0;
    const recv = parseFloat(received) || 0;

    const subtotal = opd + procedure;
    const total = Math.max(0, subtotal - disc);
    const balance = total - recv;
    const discountPercent = subtotal > 0 ? ((disc / subtotal) * 100).toFixed(2) : '0';

    setBillingData((prev) => ({
      ...prev,
      opdTotal,
      procedureTotal,
      subtotal: subtotal.toFixed(2),
      discount: disc.toFixed(2),
      discountPercent,
      totalAmount: total.toFixed(2),
      balanceAmount: balance.toFixed(2),
    }));
  };

  // Update OPD amount
  useEffect(() => {
    recalculateBilling(opdFormData.opdAmount, billingData.procedureTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opdFormData.opdAmount]);

  // Calculate procedure total
  useEffect(() => {
    const total = procedureFormData.procedures.reduce((sum, proc) => sum + (parseFloat(proc.total_price) || 0), 0);
    recalculateBilling(billingData.opdTotal, total.toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedureFormData.procedures]);

  const handleOpdInputChange = (field: string, value: string) => {
    setOpdFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProcedureInputChange = (field: string, value: string) => {
    setProcedureFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Centralized billing change handler
  const handleBillingChange = (field: string, value: string) => {
    if (field === 'paymentMode') {
      setBillingData((prev) => ({ ...prev, paymentMode: value as BillingData['paymentMode'] }));
      return;
    }

    if (field === 'receivedAmount') {
      const raw = value;
      setBillingData((prev) => {
        const total = parseFloat(prev.totalAmount) || 0;
        const recv = parseFloat(raw) || 0;
        const balance = (total - recv).toFixed(2);
        return { ...prev, receivedAmount: raw, balanceAmount: balance };
      });
      return;
    }

    if (field === 'discountPercent') {
      setBillingData((prev) => {
        const subtotal = parseFloat(prev.subtotal) || 0;
        const percent = parseFloat(value) || 0;
        const discNum = (subtotal * percent) / 100;
        const totalNum = Math.max(0, subtotal - discNum);
        const recv = parseFloat(prev.receivedAmount) || 0;

        return {
          ...prev,
          discountPercent: percent.toFixed(2),
          discount: discNum.toFixed(2),
          totalAmount: totalNum.toFixed(2),
          balanceAmount: (totalNum - recv).toFixed(2),
        };
      });
      return;
    }

    if (field === 'discount') {
      setBillingData((prev) => {
        const subtotal = parseFloat(prev.subtotal) || 0;
        const discNum = parseFloat(value) || 0;
        const totalNum = Math.max(0, subtotal - discNum);
        const recv = parseFloat(prev.receivedAmount) || 0;
        const percent = subtotal > 0 ? ((discNum / subtotal) * 100).toFixed(2) : '0.00';

        return {
          ...prev,
          discount: discNum.toFixed(2),
          discountPercent: percent,
          totalAmount: totalNum.toFixed(2),
          balanceAmount: (totalNum - recv).toFixed(2),
        };
      });
      return;
    }

    setBillingData((prev) => ({ ...prev, [field]: value } as BillingData));
  };

  const addProcedure = (procedure: any) => {
    const unit = String(procedure?.default_charge ?? '0');
    const newProcedure: ProcedureItem = {
      id: Date.now().toString(),
      procedure_id: Number(procedure?.id),
      procedure_name: String(procedure?.name ?? 'Procedure'),
      procedure_code: procedure?.code ? String(procedure.code) : undefined,
      quantity: 1,
      unit_price: unit,
      total_price: parseFloat(unit).toFixed(2),
      notes: '',
    };
    setProcedureFormData((prev) => ({ ...prev, procedures: [...prev.procedures, newProcedure] }));
  };

  const removeProcedure = (id: string) => {
    setProcedureFormData((prev) => ({ ...prev, procedures: prev.procedures.filter((p) => p.id !== id) }));
  };

  const updateProcedure = (id: string, field: keyof ProcedureItem, value: any) => {
    setProcedureFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? parseInt(value) : updated.quantity;
          const price = field === 'unit_price' ? parseFloat(value) : parseFloat(updated.unit_price);
          updated.total_price = ((qty || 0) * (price || 0)).toFixed(2);
        }
        return updated;
      }),
    }));
  };

  const isLoading = visitLoading || billsLoading || proceduresLoading;

  /* ------------------------------- Printing ------------------------------- */

  const handlePrint = useReactToPrint({
    documentTitle: opdFormData.receiptNo || 'OPD-Bill',
    contentRef: printAreaRef, // react-to-print v3
    pageStyle: `
      @page { size: A4; margin: 0 }
      @media print {
        html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  const handleDownloadPDF = useCallback(async () => {
    const el = printAreaRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${opdFormData.receiptNo || 'OPD-Bill'}.pdf`);
  }, [opdFormData.receiptNo]);

  /* --------------------------------- Guards -------------------------------- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (visitError || !visit) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Billing</CardTitle>
            <CardDescription>{visitError?.message || 'Visit not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/opd/visits')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Visits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* --------------------------- Procedure Masters --------------------------- */

  const normalizedProcedures = (() => {
    const pm: any = procedureMasters ?? [];
    if (Array.isArray(pm)) return pm;
    if (pm && Array.isArray(pm.results)) return pm.results;
    if (pm && Array.isArray(pm.items)) return pm.items;
    return [];
  })();

  const filteredProcedures =
    normalizedProcedures.filter((proc: any) => {
      const q = procedureSearch.toLowerCase();
      const name = (proc?.name ?? '').toString().toLowerCase();
      const code = (proc?.code ?? '').toString().toLowerCase();
      return name.includes(q) || code.includes(q);
    }) || [];

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/consultation/${visitId}`)}
            className="no-print"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Billing</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">Visit #{visit.visit_number}</p>
              <Badge variant="outline" className="capitalize">
                {visit.visit_type.replace('_', ' ')}
              </Badge>
              {visit.is_follow_up && <Badge variant="secondary">Follow-up</Badge>}
              {visit.has_opd_bill && (
                <Badge variant="default" className="bg-green-600">
                  Bill Created
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <Badge variant={visit.payment_status === 'paid' ? 'default' : 'destructive'} className="mt-1">
              {visit.payment_status}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Patient Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Patient Name</p>
                <p className="font-semibold text-lg">{visit.patient_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Patient ID</p>
                <p className="font-mono text-sm text-primary">
                  {visit.patient_details?.patient_id || visit.patient_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Age & Gender</p>
                <p className="font-semibold">
                  {visit.patient_details?.age || 'N/A'} Yrs{' '}
                  {visit.patient_details?.gender
                    ? visit.patient_details.gender.charAt(0).toUpperCase() + visit.patient_details.gender.slice(1)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-semibold">{visit.doctor_name || 'Not assigned'}</p>
                {visit.doctor_details?.specialties && (
                  <p className="text-xs text-muted-foreground">{visit.doctor_details.specialties.join(', ')}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registration</p>
                <Badge variant="outline" className="font-mono">
                  {visit.created_at ? format(new Date(visit.created_at), 'dd/MM/yyyy') : 'N/A'}
                </Badge>
                {visit.patient_details?.mobile && (
                  <p className="text-xs text-muted-foreground mt-1">📞 {visit.patient_details.mobile}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="opd" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="opd" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            OPD Billing
          </TabsTrigger>
          <TabsTrigger value="procedure" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Procedure Billing
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bill Preview
          </TabsTrigger>
        </TabsList>

        {/* OPD Billing */}
        <TabsContent value="opd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>OPD Details</CardTitle>
                <CardDescription>Consultation charges & details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiptNo">Receipt No.</Label>
                    <Input id="receiptNo" value={opdFormData.receiptNo} className="bg-muted" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="billDate">Bill Date</Label>
                      <Input
                        id="billDate"
                        type="date"
                        value={opdFormData.billDate}
                        onChange={(e) => handleOpdInputChange('billDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billTime">Time</Label>
                      <Input
                        id="billTime"
                        type="time"
                        value={opdFormData.billTime}
                        onChange={(e) => handleOpdInputChange('billTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">
                    Doctor <span className="text-destructive">*</span>
                  </Label>
                  <Select value={opdFormData.doctor} onValueChange={(v) => handleOpdInputChange('doctor', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Doctor">{visit.doctor_name || 'Select Doctor'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {visit.doctor && visit.doctor_name && (
                        <SelectItem value={visit.doctor.toString()}>
                          {visit.doctor_name}
                          {visit.doctor_details?.specialties && ` - ${visit.doctor_details.specialties.join(', ')}`}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opdType">
                      OPD Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={opdFormData.opdType} onValueChange={(v) => handleOpdInputChange('opdType', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OPD Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">CONSULTATION</SelectItem>
                        <SelectItem value="follow_up">FOLLOW-UP</SelectItem>
                        <SelectItem value="emergency">EMERGENCY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chargeType">
                      Charge Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={opdFormData.chargeType}
                      onValueChange={(v) => handleOpdInputChange('chargeType', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Charge Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_visit">FIRST VISIT</SelectItem>
                        <SelectItem value="revisit">REVISIT</SelectItem>
                        <SelectItem value="emergency">EMERGENCY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opdAmount">OPD Charges</Label>
                  <div className="relative">
                    <Input
                      id="opdAmount"
                      type="number"
                      value={opdFormData.opdAmount}
                      onChange={(e) => handleOpdInputChange('opdAmount', e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">INR</span>
                  </div>
                  {visit.doctor_details && (
                    <p className="text-xs text-muted-foreground">
                      {visit.is_follow_up ? 'Follow-up' : 'Consultation'} fee: ₹
                      {visit.is_follow_up ? visit.doctor_details.follow_up_fee : visit.doctor_details.consultation_fee}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    value={opdFormData.diagnosis}
                    onChange={(e) => handleOpdInputChange('diagnosis', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter remarks"
                    value={opdFormData.remarks}
                    onChange={(e) => handleOpdInputChange('remarks', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Common Billing Details */}
            <BillingDetailsPanel
              data={billingData}
              onChange={handleBillingChange}
              onFormatReceived={() => {
                const num = parseFloat(billingData.receivedAmount);
                if (!isNaN(num)) setBillingData((prev) => ({ ...prev, receivedAmount: num.toFixed(2) }));
              }}
            />
          </div>
        </TabsContent>

        {/* Procedure Billing */}
        <TabsContent value="procedure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Procedure Billing</CardTitle>
                  <CardDescription className="mt-1">Add procedures & tests</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Procedure Search & Add */}
                <div className="space-y-2">
                  <Label>Search & Add Procedures</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by procedure name or code..."
                      value={procedureSearch}
                      onChange={(e) => setProcedureSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {procedureSearch && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {filteredProcedures.length > 0 ? (
                        filteredProcedures.map((proc: any) => (
                          <div
                            key={proc.id}
                            className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between border-b last:border-b-0"
                            onClick={() => {
                              addProcedure(proc);
                              setProcedureSearch('');
                            }}
                          >
                            <div>
                              <div className="font-medium">{proc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Code: {proc.code || '—'}
                                {proc.category ? ` | ${proc.category}` : ''}
                              </div>
                            </div>
                            <div className="text-sm font-semibold">
                              ₹{parseFloat(String(proc.default_charge ?? '0')).toFixed(2)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No procedures found</div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Selected Procedures Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px]">Procedure</TableHead>
                        <TableHead className="w-[100px] text-center">Qty</TableHead>
                        <TableHead className="w-[120px] text-right">Rate</TableHead>
                        <TableHead className="w-[120px] text-right">Amount</TableHead>
                        <TableHead className="w-[80px] text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {procedureFormData.procedures.length > 0 ? (
                        procedureFormData.procedures.map((procedure) => (
                          <TableRow key={procedure.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{procedure.procedure_name}</div>
                                {procedure.procedure_code && (
                                  <div className="text-xs text-muted-foreground">{procedure.procedure_code}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                value={procedure.quantity}
                                onChange={(e) => updateProcedure(procedure.id, 'quantity', e.target.value)}
                                className="w-16 mx-auto text-center"
                                min="1"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={procedure.unit_price}
                                onChange={(e) => updateProcedure(procedure.id, 'unit_price', e.target.value)}
                                className="w-24 ml-auto text-right"
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{parseFloat(procedure.total_price).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeProcedure(procedure.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No procedures added. Search & add procedures above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Procedure Total */}
                {procedureFormData.procedures.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Procedure Total</span>
                      <span className="text-2xl font-bold">₹{billingData.procedureTotal}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Common Billing Details */}
            <BillingDetailsPanel
              data={billingData}
              onChange={handleBillingChange}
              onFormatReceived={() => {
                const num = parseFloat(billingData.receivedAmount);
                if (!isNaN(num)) setBillingData((prev) => ({ ...prev, receivedAmount: num.toFixed(2) }));
              }}
            />
          </div>
        </TabsContent>

        {/* Bill Preview */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <BillLayoutA4
                headerSrc={BILL_ASSETS.header}
                footerSrc={BILL_ASSETS.footer}
                sideStripSrc={BILL_ASSETS.sideStrip}
                watermarkSrc={BILL_ASSETS.watermark}
                contentRef={printAreaRef}
              >
                {/* Top meta */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px] leading-5">
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Patient Name</span>
                    <span>{visit.patient_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Patient ID</span>
                    <span>{visit.patient_details?.patient_id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Age / Gender</span>
                    <span>
                      {visit.patient_details?.age} Yrs / {visit.patient_details?.gender}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Mobile</span>
                    <span>{visit.patient_details?.mobile}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Visit No</span>
                    <span>{visit.visit_number}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Visit Date</span>
                    <span>{format(new Date(visit.visit_date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Doctor</span>
                    <span>{visit.doctor_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Bill No / Date</span>
                    <span>
                      {opdFormData.receiptNo} • {format(new Date(opdFormData.billDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>

                {/* Bill title */}
                <div className="text-center mt-4 mb-3">
                  <h3 className="text-xl font-bold tracking-wide">BILL</h3>
                </div>

                {/* Charges table */}
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-y">
                      <th className="text-left py-2 font-semibold">Description</th>
                      <th className="text-center py-2 font-semibold w-[60px]">Qty</th>
                      <th className="text-right py-2 font-semibold w-[90px]">Rate</th>
                      <th className="text-right py-2 font-semibold w-[110px]">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseFloat(opdFormData.opdAmount) > 0 && (
                      <tr className="border-b">
                        <td className="py-2">
                          <div>Consultation Fee</div>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            {opdFormData.chargeType.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="py-2 text-center">1</td>
                        <td className="py-2 text-right">{Number(opdFormData.opdAmount).toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold">
                          {Number(opdFormData.opdAmount).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {procedureFormData.procedures.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2">
                          <div>{p.procedure_name}</div>
                          {p.procedure_code && (
                            <div className="text-[11px] text-muted-foreground">Code: {p.procedure_code}</div>
                          )}
                        </td>
                        <td className="py-2 text-center">{p.quantity}</td>
                        <td className="py-2 text-right">{Number(p.unit_price).toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold">{Number(p.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                    {opdFormData.diagnosis && (
                      <tr className="border-b bg-muted/30">
                        <td className="py-2 text-[11px]" colSpan={4}>
                          <span className="font-semibold">Diagnosis:</span> {opdFormData.diagnosis}
                        </td>
                      </tr>
                    )}
                    {opdFormData.remarks && (
                      <tr className="border-b bg-muted/30">
                        <td className="py-2 text-[11px]" colSpan={4}>
                          <span className="font-semibold">Remarks:</span> {opdFormData.remarks}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Amounts */}
                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹ {billingData.subtotal}</span>
                  </div>
                  {parseFloat(billingData.discount) > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount ({billingData.discountPercent}%)</span>
                      <span className="font-semibold">- ₹ {billingData.discount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-[14px] font-bold">
                    <span>Total Amount</span>
                    <span>₹ {billingData.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Amount Received ({billingData.paymentMode.toUpperCase()})</span>
                    <span className="font-semibold">₹ {billingData.receivedAmount}</span>
                  </div>
                  <div className="flex justify-between text-orange-700 text-[14px] font-bold">
                    <span>Balance Due</span>
                    <span>₹ {billingData.balanceAmount}</span>
                  </div>
                </div>

                {/* Signatures & Terms */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-2">Patient Signature</p>
                    <div className="border-b border-muted-foreground h-8" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-2">Authorized Signatory</p>
                    <div className="border-b border-muted-foreground h-8" />
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-muted-foreground">
                  <p className="font-semibold mb-1">Terms & Conditions</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>This is a computer generated bill; signature not required.</li>
                    <li>Please retain this copy for future reference.</li>
                    <li>Bills are non-transferable.</li>
                  </ul>
                </div>

                <div className="mt-3 text-center text-[10px] text-muted-foreground">
                  Generated on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}
                </div>
              </BillLayoutA4>
            </Card>

            {/* Right Side - Common Billing Details */}
            <BillingDetailsPanel
              data={billingData}
              onChange={handleBillingChange}
              onFormatReceived={() => {
                const num = parseFloat(billingData.receivedAmount);
                if (!isNaN(num)) setBillingData((prev) => ({ ...prev, receivedAmount: num.toFixed(2) }));
              }}
            />
          </div>

          {/* Print / Download Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-center no-print">
                <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="default" size="lg" onClick={handlePrint}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Print Bill
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bill History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bill History</CardTitle>
                  <CardDescription className="mt-1">View all bills for this visit</CardDescription>
                </div>
                {opdBills && opdBills.length > 0 && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {opdBills.length} {opdBills.length === 1 ? 'Bill' : 'Bills'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                rows={opdBills || []}
                isLoading={billsLoading}
                columns={[
                  {
                    header: 'Bill Number',
                    key: 'bill_number',
                    cell: (bill: OPDBill) => <div className="font-mono text-sm font-medium">{bill.bill_number}</div>,
                  },
                  {
                    header: 'Bill Date',
                    key: 'bill_date',
                    cell: (bill: OPDBill) => (
                      <div className="text-sm">
                        {format(new Date(bill.bill_date), 'dd MMM yyyy')}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(bill.bill_date), 'hh:mm a')}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Doctor',
                    key: 'doctor',
                    cell: (bill: OPDBill) => (
                      <div className="text-sm">
                        <div className="font-medium">{bill.doctor_name || 'N/A'}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Type',
                    key: 'type',
                    cell: (bill: OPDBill) => (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit capitalize text-xs">
                          {bill.opd_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="w-fit capitalize text-xs">
                          {bill.charge_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ),
                  },
                  {
                    header: 'Total',
                    key: 'total',
                    className: 'text-right',
                    cell: (bill: OPDBill) => (
                      <div className="text-sm font-semibold text-right">₹{parseFloat(bill.total_amount).toFixed(2)}</div>
                    ),
                  },
                  {
                    header: 'Received',
                    key: 'received',
                    className: 'text-right',
                    cell: (bill: OPDBill) => (
                      <div className="text-sm text-green-600 font-semibold text-right">
                        ₹{parseFloat(bill.received_amount).toFixed(2)}
                      </div>
                    ),
                  },
                  {
                    header: 'Balance',
                    key: 'balance',
                    className: 'text-right',
                    cell: (bill: OPDBill) => (
                      <div className="text-sm text-orange-600 font-semibold text-right">
                        ₹{parseFloat(bill.balance_amount).toFixed(2)}
                      </div>
                    ),
                  },
                  {
                    header: 'Status',
                    key: 'status',
                    cell: (bill: OPDBill) => (
                      <Badge
                        variant={
                          bill.payment_status === 'paid'
                            ? 'default'
                            : bill.payment_status === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {bill.payment_status}
                      </Badge>
                    ),
                  },
                ]}
                renderMobileCard={(bill: OPDBill) => (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-medium">{bill.bill_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(bill.bill_date), 'dd MMM yyyy, hh:mm a')}
                        </div>
                      </div>
                      <Badge
                        variant={
                          bill.payment_status === 'paid'
                            ? 'default'
                            : bill.payment_status === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {bill.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{bill.doctor_name || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {bill.opd_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {bill.charge_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-sm font-semibold">₹{parseFloat(bill.total_amount).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Received</div>
                        <div className="text-sm font-semibold text-green-600">
                          ₹{parseFloat(bill.received_amount).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Balance</div>
                        <div className="text-sm font-semibold text-orange-600">
                          ₹{parseFloat(bill.balance_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 no-print">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadPDF}>
                        <FileText className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button variant="default" size="sm" className="flex-1" onClick={handlePrint}>
                        <Receipt className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </>
                )}
                getRowId={(bill: OPDBill) => bill.id.toString()}
                getRowLabel={(bill: OPDBill) => bill.bill_number}
                onView={(bill: OPDBill) => console.log('View bill:', bill.id)}
                extraActions={(bill: OPDBill) => (
                  <>
                    <DropdownMenuItem onClick={handlePrint}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Print Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </>
                )}
                emptyTitle="No bills found"
                emptySubtitle="Bills created for this visit will appear here"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
