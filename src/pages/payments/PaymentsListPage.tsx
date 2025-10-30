import { useEffect } from 'react';
import {
  usePaymentCategories,
  useTransactions,
  useTransactionStats,
  useAccountingPeriods,
} from '@/hooks/usePayments';

export default function PaymentsListPage() {
  /* --- fetch all GET endpoints --- */
  const cat   = usePaymentCategories();
  const trx   = useTransactions();
  const stats = useTransactionStats();
  const per   = useAccountingPeriods();

  useEffect(() => {
    console.log('=== PAYMENTS RAW API RESPONSES ===');
    console.log('categories :', cat.categories);
    console.log('transactions :', trx.transactions);
    console.log('transaction-stats :', stats.stats);
    console.log('accounting-periods :', per.periods);
  }, [cat.categories, trx.transactions, stats.stats, per.periods]);

  /* --- bare page --- */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments – Raw API Test</h1>
      <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-[70vh] text-xs">
        {JSON.stringify(
          {
            categories: cat.categories,
            transactions: trx.transactions,
            transactionStats: stats.stats,
            accountingPeriods: per.periods,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}