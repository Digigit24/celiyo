// src/pages/OPDBilling.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisit, useOPDBills } from '@/hooks/useOPD';
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
import { 
  ArrowLeft, 
  User, 
  Receipt, 
  CreditCard, 
  IndianRupee,
  Plus,
  Trash2,
  Edit,
  Package,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function OPDBilling() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { visit, isLoading: visitLoading, error: visitError } = useVisit(Number(visitId));
  const { opdBills, isLoading: billsLoading } = useOPDBills({ visit: Number(visitId) });

  // State for forms
  const [opdFormData, setOpdFormData] = useState({
    receiptNo: '',
    billDate: new Date().toISOString().split('T')[0],
    billTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    doctor: '',
    opdType: '',
    opdSubType: '',
    chargeType: '',
    diagnosis: '',
    remark: '',
    totalAmount: '0.00',
    discount: '0.00',
    discountPercent: '0',
    payableAmount: '0.00',
    payMode: 'cash',
    receivedAmount: '0.00',
    balanceAmount: '0.00'
  });

  // Map visit data to form when visit loads
  useEffect(() => {
    if (visit) {
      // Generate receipt number from visit number
      // Visit number format: OPD/20251029/001
      // Convert to bill format: BILL/20251029/001 or use the same
      const receiptNo = visit.visit_number 
        ? `BILL/${visit.visit_number.split('/').slice(1).join('/')}`
        : `BILL/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}/001`;

      // Determine total amount based on visit type
      const isFollowUp = visit.is_follow_up || visit.visit_type === 'follow_up';
      const totalAmount = visit.doctor_details 
        ? (isFollowUp 
            ? visit.doctor_details.follow_up_fee 
            : visit.doctor_details.consultation_fee)
        : '0.00';

      // Determine charge type
      let chargeType = '';
      if (isFollowUp) {
        chargeType = 'follow-up';
      } else if (visit.visit_type === 'new') {
        chargeType = 'first-visit';
      } else {
        chargeType = 'revisit';
      }

      // Use visit date if available
      const billDate = visit.visit_date 
        ? visit.visit_date 
        : new Date().toISOString().split('T')[0];

      setOpdFormData(prev => ({
        ...prev,
        receiptNo: receiptNo,
        billDate: billDate,
        doctor: visit.doctor?.toString() || '',
        opdType: 'consultation',
        opdSubType: 'na',
        chargeType: chargeType,
        totalAmount: totalAmount,
        payableAmount: totalAmount,
        balanceAmount: totalAmount
      }));

      // Also set doctor for procedure form
      setProcedureFormData(prev => ({
        ...prev,
        doctor: visit.doctor?.toString() || ''
      }));
    }
  }, [visit]);

  const calculateAmounts = (data: typeof opdFormData) => {
    const total = parseFloat(data.totalAmount) || 0;
    const discount = parseFloat(data.discount) || 0;
    const received = parseFloat(data.receivedAmount) || 0;

    const payable = total - discount;
    const balance = payable - received;

    return {
      payableAmount: Math.max(0, payable).toFixed(2),
      balanceAmount: balance.toFixed(2)
    };
  };

  const [procedureFormData, setProcedureFormData] = useState({
    doctor: '',
    procedures: [] as Array<{
      id: string;
      particular: string;
      note: string;
      quantity: number;
      charge: number;
      amount: number;
    }>,
    totalAmount: '0.00',
    discount: '0.00',
    discountPercent: '0',
    payableAmount: '0.00',
    payMode: 'cash',
    receivedAmount: '0.00',
    balanceAmount: '0.00'
  });

  const isLoading = visitLoading || billsLoading;

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
            <CardDescription>
              {visitError?.message || 'Visit not found'}
            </CardDescription>
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

  const handleOpdInputChange = (field: string, value: string) => {
    const newData = {
      ...opdFormData,
      [field]: value
    };

    // Handle discount percentage calculation
    if (field === 'discountPercent') {
      const total = parseFloat(newData.totalAmount) || 0;
      const percent = parseFloat(value) || 0;
      const discountAmount = (total * percent) / 100;
      newData.discount = discountAmount.toFixed(2);
    }

    // Handle discount amount to percentage
    if (field === 'discount') {
      const total = parseFloat(newData.totalAmount) || 0;
      const discount = parseFloat(value) || 0;
      const percent = total > 0 ? (discount / total) * 100 : 0;
      newData.discountPercent = percent.toFixed(2);
    }

    // Recalculate amounts
    const calculated = calculateAmounts(newData);
    
    setOpdFormData({
      ...newData,
      ...calculated
    });
  };

  const handleProcedureInputChange = (field: string, value: string) => {
    setProcedureFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProcedure = () => {
    setProcedureFormData(prev => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        {
          id: Date.now().toString(),
          particular: '',
          note: '',
          quantity: 1,
          charge: 0,
          amount: 0
        }
      ]
    }));
  };

  const removeProcedure = (id: string) => {
    setProcedureFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter(p => p.id !== id)
    }));
  };

  const updateProcedure = (id: string, field: string, value: any) => {
    setProcedureFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map(p => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (field === 'quantity' || field === 'charge') {
            updated.amount = updated.quantity * updated.charge;
          }
          return updated;
        }
        return p;
      })
    }));
  };

  // Sample procedures data (will be replaced with API data)
  const sampleProcedures = [
    { id: '1', particular: 'CBC', note: '', quantity: 1, charge: 200, amount: 200 },
    { id: '2', particular: 'Blood Group', note: '', quantity: 1, charge: 100, amount: 100 },
    { id: '3', particular: 'Iron Study (Tibc)', note: '', quantity: 1, charge: 600, amount: 600 },
    { id: '4', particular: 'Ferritin', note: '', quantity: 1, charge: 600, amount: 600 },
    { id: '5', particular: 'Vitamin B12', note: '', quantity: 1, charge: 700, amount: 700 },
    { id: '6', particular: 'Folic acid', note: '', quantity: 1, charge: 800, amount: 800 },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/consultation/${visitId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Billing</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                Visit #{visit.visit_number}
              </p>
              <Badge variant="outline" className="capitalize">
                {visit.visit_type}
              </Badge>
              {visit.is_follow_up && (
                <Badge variant="secondary">Follow-up</Badge>
              )}
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
            <Badge 
              variant={visit.payment_status === 'paid' ? 'default' : 'destructive'}
              className="mt-1"
            >
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
                <p className="font-mono text-sm text-primary">{visit.patient_details?.patient_id || visit.patient_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Age & Gender</p>
                <p className="font-semibold">
                  {visit.patient_details?.age || 'N/A'} Yrs {visit.patient_details?.gender ? visit.patient_details.gender.charAt(0).toUpperCase() + visit.patient_details.gender.slice(1) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-semibold">{visit.doctor_name || 'Not assigned'}</p>
                {visit.doctor_details?.specialties && (
                  <p className="text-xs text-muted-foreground">
                    {visit.doctor_details.specialties.join(', ')}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registration</p>
                <Badge variant="outline" className="font-mono">
                  {visit.created_at ? format(new Date(visit.created_at), 'dd/MM/yyyy') : 'N/A'}
                </Badge>
                {visit.patient_details?.mobile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📞 {visit.patient_details.mobile}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for OPD and Procedure Billing */}
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

        {/* OPD Billing Tab */}
        <TabsContent value="opd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - OPD Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>OPD Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiptNo">Receipt No.</Label>
                    <Input
                      id="receiptNo"
                      value={opdFormData.receiptNo}
                      onChange={(e) => handleOpdInputChange('receiptNo', e.target.value)}
                      className="bg-muted"
                      readOnly
                    />
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
                  <Select
                    value={opdFormData.doctor}
                    onValueChange={(value) => handleOpdInputChange('doctor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Doctor">
                        {visit.doctor_name || 'Select Doctor'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* Current doctor from visit */}
                      {visit.doctor && visit.doctor_name && (
                        <SelectItem value={visit.doctor.toString()}>
                          {visit.doctor_name}
                          {visit.doctor_details?.specialties && 
                            ` - ${visit.doctor_details.specialties.join(', ')}`
                          }
                        </SelectItem>
                      )}
                      {/* Will be replaced with API data */}
                      <SelectItem value="1">DR. SONALI JADHAV</SelectItem>
                      <SelectItem value="2">DR. SHARMA</SelectItem>
                      <SelectItem value="3">DR. TUSHAR AGARWAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opdType">
                    OPD Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={opdFormData.opdType}
                    onValueChange={(value) => handleOpdInputChange('opdType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OPD Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">CONSULTATION</SelectItem>
                      <SelectItem value="followup">FOLLOW-UP</SelectItem>
                      <SelectItem value="emergency">EMERGENCY</SelectItem>
                    </SelectContent>
                  </Select>
                  {opdFormData.opdType && (
                    <p className="text-xs text-muted-foreground">
                      Auto-set based on visit type
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opdSubType">
                    OPD SubType <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={opdFormData.opdSubType}
                    onValueChange={(value) => handleOpdInputChange('opdSubType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OPD SubType" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="na">NA</SelectItem>
                      <SelectItem value="general">GENERAL</SelectItem>
                      <SelectItem value="specialist">SPECIALIST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chargeType">
                    Charge Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={opdFormData.chargeType}
                    onValueChange={(value) => handleOpdInputChange('chargeType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Charge Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-visit">FIRST VISIT</SelectItem>
                      <SelectItem value="follow-up">FOLLOW UP</SelectItem>
                      <SelectItem value="revisit">REVISIT</SelectItem>
                    </SelectContent>
                  </Select>
                  {opdFormData.chargeType && (
                    <p className="text-xs text-muted-foreground">
                      Based on visit: {visit.visit_type} {visit.is_follow_up ? '(follow-up)' : ''}
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
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Textarea
                    id="remark"
                    placeholder="Enter remarks"
                    value={opdFormData.remark}
                    onChange={(e) => handleOpdInputChange('remark', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Billing Details */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <div className="relative">
                    <Input
                      id="totalAmount"
                      type="number"
                      value={opdFormData.totalAmount}
                      onChange={(e) => handleOpdInputChange('totalAmount', e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                  {visit.doctor_details && (
                    <p className="text-xs text-muted-foreground">
                      {visit.is_follow_up ? 'Follow-up' : 'Consultation'} fee: ₹
                      {visit.is_follow_up 
                        ? visit.doctor_details.follow_up_fee 
                        : visit.doctor_details.consultation_fee}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="number"
                      value={opdFormData.discount}
                      onChange={(e) => handleOpdInputChange('discount', e.target.value)}
                      className="flex-1"
                      placeholder="0.00"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={opdFormData.discountPercent}
                        onChange={(e) => handleOpdInputChange('discountPercent', e.target.value)}
                        className="w-16"
                        placeholder="0"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <Input
                      type="number"
                      value={opdFormData.discount}
                      className="w-24"
                      readOnly
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payableAmount">Payable Amount</Label>
                  <div className="relative">
                    <Input
                      id="payableAmount"
                      type="number"
                      value={opdFormData.payableAmount}
                      onChange={(e) => handleOpdInputChange('payableAmount', e.target.value)}
                      className="pr-12 font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Pay Mode</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={opdFormData.payMode === 'cash' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleOpdInputChange('payMode', 'cash')}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Cash
                    </Button>
                    <Button
                      variant={opdFormData.payMode === 'bank' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleOpdInputChange('payMode', 'bank')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Bank
                    </Button>
                    <Button
                      variant={opdFormData.payMode === 'card' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleOpdInputChange('payMode', 'card')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Card
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receivedAmount">Received Amount</Label>
                  <div className="relative">
                    <Input
                      id="receivedAmount"
                      type="number"
                      value={opdFormData.receivedAmount}
                      onChange={(e) => handleOpdInputChange('receivedAmount', e.target.value)}
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
                      value={opdFormData.balanceAmount}
                      className="pr-12 text-orange-600 font-semibold"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/consultation/${visitId}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Consultation
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button variant="default">
                    <Receipt className="mr-2 h-4 w-4" />
                    Save Bill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedure Billing Tab */}
        <TabsContent value="procedure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Procedure Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Billing Details</CardTitle>
                  <CardDescription className="mt-1">
                    Add procedures and tests
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Package
                  </Button>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Doctor Selection */}
                <div className="space-y-2">
                  <Label htmlFor="procedureDoctor">
                    Doctor Name <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={procedureFormData.doctor}
                    onValueChange={(value) => handleProcedureInputChange('doctor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Doctor">
                        {visit.doctor_name || 'Select Doctor'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* Current doctor from visit */}
                      {visit.doctor && visit.doctor_name && (
                        <SelectItem value={visit.doctor.toString()}>
                          {visit.doctor_name}
                          {visit.doctor_details?.specialties && 
                            ` - ${visit.doctor_details.specialties.join(', ')}`
                          }
                        </SelectItem>
                      )}
                      {/* Will be replaced with API data */}
                      <SelectItem value="1">DR. SONALI JADHAV</SelectItem>
                      <SelectItem value="2">DR. SHARMA</SelectItem>
                      <SelectItem value="3">DR. TUSHAR AGARWAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Procedures Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px]">Particulars</TableHead>
                        <TableHead className="w-[200px]">Note</TableHead>
                        <TableHead className="w-[80px] text-center">No's</TableHead>
                        <TableHead className="w-[120px] text-right">Charge</TableHead>
                        <TableHead className="w-[120px] text-right">Amount</TableHead>
                        <TableHead className="w-[100px] text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={addProcedure}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleProcedures.map((procedure) => (
                        <TableRow key={procedure.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                <span className="text-xs text-primary">≡</span>
                              </div>
                              {procedure.particular}
                            </div>
                          </TableCell>
                          <TableCell>{procedure.note}</TableCell>
                          <TableCell className="text-center">{procedure.quantity}</TableCell>
                          <TableCell className="text-right">{procedure.charge}</TableCell>
                          <TableCell className="text-right font-semibold">{procedure.amount}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeProcedure(procedure.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Total Row */}
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">3000.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Amount Details */}
            <Card>
              <CardHeader>
                <CardTitle>Amount Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="procedureTotalAmount">Total Amount</Label>
                  <div className="relative">
                    <Input
                      id="procedureTotalAmount"
                      type="number"
                      value="3000.00"
                      className="pr-12 font-semibold"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedureDiscount">Discount</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="procedureDiscount"
                      type="number"
                      value={procedureFormData.discount}
                      onChange={(e) => handleProcedureInputChange('discount', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={procedureFormData.discountPercent}
                        onChange={(e) => handleProcedureInputChange('discountPercent', e.target.value)}
                        className="w-20"
                      />
                      <span className="flex items-center text-sm text-muted-foreground">%</span>
                      <Input
                        type="number"
                        value={procedureFormData.discount}
                        className="flex-1"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedurePayableAmount">Payable Amount</Label>
                  <div className="relative">
                    <Input
                      id="procedurePayableAmount"
                      type="number"
                      value="3000.00"
                      className="pr-12 font-semibold"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Pay Mode</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={procedureFormData.payMode === 'cash' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleProcedureInputChange('payMode', 'cash')}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Cash
                    </Button>
                    <Button
                      variant={procedureFormData.payMode === 'bank' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleProcedureInputChange('payMode', 'bank')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Bank
                    </Button>
                    <Button
                      variant={procedureFormData.payMode === 'card' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleProcedureInputChange('payMode', 'card')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Card
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedureReceivedAmount">Received Amount</Label>
                  <div className="relative">
                    <Input
                      id="procedureReceivedAmount"
                      type="number"
                      value="3000.00"
                      className="pr-12 text-green-600 font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedureBalanceAmount">Balanced Amount</Label>
                  <div className="relative">
                    <Input
                      id="procedureBalanceAmount"
                      type="number"
                      value="0.00"
                      className="pr-12 text-orange-600 font-semibold"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/consultation/${visitId}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Consultation
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button variant="default">
                    <Receipt className="mr-2 h-4 w-4" />
                    Save Bill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bill Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              {/* Bill Header */}
              <div className="text-center mb-8 border-b-2 border-primary pb-6">
                <h2 className="text-3xl font-bold text-primary mb-2">
                  [HOSPITAL NAME]
                </h2>
                <p className="text-sm text-muted-foreground">
                  [Hospital Address Line 1]
                </p>
                <p className="text-sm text-muted-foreground">
                  [City, State, PIN Code]
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: [Contact Number] | Email: [Email Address]
                </p>
              </div>

              {/* Bill Title */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">OPD BILL</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bill No: {opdFormData.receiptNo}
                </p>
              </div>

              {/* Bill Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Patient Name:</span>
                  <span>{visit.patient_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Patient ID:</span>
                  <span>{visit.patient_details?.patient_id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Age/Gender:</span>
                  <span>
                    {visit.patient_details?.age} Yrs / {visit.patient_details?.gender}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Mobile:</span>
                  <span>{visit.patient_details?.mobile}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Visit No:</span>
                  <span>{visit.visit_number}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Visit Date:</span>
                  <span>{format(new Date(visit.visit_date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Doctor:</span>
                  <span>{visit.doctor_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Bill Date:</span>
                  <span>{format(new Date(opdFormData.billDate), 'dd/MM/yyyy')}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Charges Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4 text-primary">Charges</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-2 font-semibold">Description</th>
                      <th className="text-center py-2 font-semibold">Type</th>
                      <th className="text-right py-2 font-semibold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Consultation Fee</td>
                      <td className="py-3 text-center capitalize">{opdFormData.chargeType?.replace('-', ' ')}</td>
                      <td className="py-3 text-right">{opdFormData.totalAmount}</td>
                    </tr>
                    {opdFormData.diagnosis && (
                      <tr className="border-b bg-muted/30">
                        <td className="py-2 text-xs" colSpan={3}>
                          <span className="font-semibold">Diagnosis:</span> {opdFormData.diagnosis}
                        </td>
                      </tr>
                    )}
                    {opdFormData.remark && (
                      <tr className="border-b bg-muted/30">
                        <td className="py-2 text-xs" colSpan={3}>
                          <span className="font-semibold">Remarks:</span> {opdFormData.remark}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Separator className="my-6" />

              {/* Amount Breakdown */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-base">
                  <span>Total Amount:</span>
                  <span className="font-semibold">₹ {opdFormData.totalAmount}</span>
                </div>
                {parseFloat(opdFormData.discount) > 0 && (
                  <div className="flex justify-between text-base text-green-600">
                    <span>Discount ({opdFormData.discountPercent}%):</span>
                    <span className="font-semibold">- ₹ {opdFormData.discount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Payable Amount:</span>
                  <span>₹ {opdFormData.payableAmount}</span>
                </div>
                <div className="flex justify-between text-base text-green-600">
                  <span>Amount Received ({opdFormData.payMode}):</span>
                  <span className="font-semibold">₹ {opdFormData.receivedAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-orange-600">
                  <span>Balance Due:</span>
                  <span>₹ {opdFormData.balanceAmount}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Status */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Payment Status:</span>
                  <Badge 
                    variant={parseFloat(opdFormData.balanceAmount) === 0 ? 'default' : 'destructive'}
                    className="text-base px-4 py-1"
                  >
                    {parseFloat(opdFormData.balanceAmount) === 0 
                      ? 'PAID' 
                      : parseFloat(opdFormData.receivedAmount) > 0 
                        ? 'PARTIAL' 
                        : 'UNPAID'}
                  </Badge>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Patient Signature</p>
                    <div className="border-b border-muted-foreground mt-8"></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Authorized Signatory</p>
                    <div className="border-b border-muted-foreground mt-8"></div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Terms & Conditions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This is a computer-generated bill and does not require a signature.</li>
                  <li>Please retain this bill for future reference.</li>
                  <li>Bills are non-transferable.</li>
                </ul>
              </div>

              {/* Print Date */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>Generated on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Print Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="default" size="lg">
                  <Receipt className="mr-2 h-4 w-4" />
                  Print Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}