// src/hooks/useOPD.ts
import { useState, useEffect } from 'react';
import {
  getVisits,
  getTodayVisits,
  getQueue,
  getVisitStatistics,
} from '@/services/opd/visit.service';
import { getOPDBills } from '@/services/opd/opdBill.service';
import { getProcedureMasters } from '@/services/opd/procedureMaster.service';
import { getProcedurePackages } from '@/services/opd/procedurePackage.service';
import { getProcedureBills } from '@/services/opd/procedureBill.service';

import { getClinicalNotes } from '@/services/opd/clinicalNote.service';
import { getVisitFindings } from '@/services/opd/visitFinding.service';
import { getVisitAttachments } from '@/services/opd/visitAttachment.service';
import type {
  Visit,
  OPDBill,
  ProcedureMaster,
  ProcedurePackage,
  ProcedureBill,
  ClinicalNote,
  VisitFinding,
  VisitAttachment,
  VisitStatistics,
} from '@/types/opd.types';

interface OPDData {
  visits: {
    count: number;
    results: Visit[];
  };
  todayVisits: {
    count: number;
    data: Visit[];
  };
  queue: {
    waiting: Visit[];
    called: Visit[];
    in_consultation: Visit[];
  };
  statistics: VisitStatistics | null;
  opdBills: {
    count: number;
    results: OPDBill[];
  };
  procedureMasters: {
    count: number;
    results: ProcedureMaster[];
  };
  procedurePackages: {
    count: number;
    results: ProcedurePackage[];
  };
  procedureBills: {
    count: number;
    results: ProcedureBill[];
  };
  clinicalNotes: {
    count: number;
    results: ClinicalNote[];
  };
  visitFindings: {
    count: number;
    results: VisitFinding[];
  };
  visitAttachments: {
    count: number;
    results: VisitAttachment[];
  };
}

export const useOPD = () => {
  const [data, setData] = useState<OPDData>({
    visits: { count: 0, results: [] },
    todayVisits: { count: 0, data: [] },
    queue: { waiting: [], called: [], in_consultation: [] },
    statistics: null,
    opdBills: { count: 0, results: [] },
    procedureMasters: { count: 0, results: [] },
    procedurePackages: { count: 0, results: [] },
    procedureBills: { count: 0, results: [] },
    clinicalNotes: { count: 0, results: [] },
    visitFindings: { count: 0, results: [] },
    visitAttachments: { count: 0, results: [] },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOPDData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        visitsRes,
        todayVisitsRes,
        queueRes,
        statisticsRes,
        opdBillsRes,
        procedureMastersRes,
        procedurePackagesRes,
        procedureBillsRes,
        clinicalNotesRes,
        visitFindingsRes,
        visitAttachmentsRes,
      ] = await Promise.allSettled([
        getVisits({ page: 1 }),
        getTodayVisits(),
        getQueue(),
        getVisitStatistics(),
        getOPDBills({ page: 1 }),
        getProcedureMasters({ page: 1 }),
        getProcedurePackages({ page: 1 }),
        getProcedureBills({ page: 1 }),
        getClinicalNotes({ page: 1 }),
        getVisitFindings({ page: 1 }),
        getVisitAttachments({ page: 1 }),
      ]);

      setData({
        visits:
          visitsRes.status === 'fulfilled'
            ? visitsRes.value
            : { count: 0, results: [] },
        todayVisits:
          todayVisitsRes.status === 'fulfilled'
            ? todayVisitsRes.value
            : { count: 0, data: [] },
        queue:
          queueRes.status === 'fulfilled'
            ? queueRes.value.data
            : { waiting: [], called: [], in_consultation: [] },
        statistics:
          statisticsRes.status === 'fulfilled'
            ? statisticsRes.value.data
            : null,
        opdBills:
          opdBillsRes.status === 'fulfilled'
            ? opdBillsRes.value
            : { count: 0, results: [] },
        procedureMasters:
          procedureMastersRes.status === 'fulfilled'
            ? procedureMastersRes.value
            : { count: 0, results: [] },
        procedurePackages:
          procedurePackagesRes.status === 'fulfilled'
            ? procedurePackagesRes.value
            : { count: 0, results: [] },
        procedureBills:
          procedureBillsRes.status === 'fulfilled'
            ? procedureBillsRes.value
            : { count: 0, results: [] },
        clinicalNotes:
          clinicalNotesRes.status === 'fulfilled'
            ? clinicalNotesRes.value
            : { count: 0, results: [] },
        visitFindings:
          visitFindingsRes.status === 'fulfilled'
            ? visitFindingsRes.value
            : { count: 0, results: [] },
        visitAttachments:
          visitAttachmentsRes.status === 'fulfilled'
            ? visitAttachmentsRes.value
            : { count: 0, results: [] },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch OPD data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOPDData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAllOPDData,
  };
};