import { useState } from "react";
import { CreditCard, Search, ArrowUpRight, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { PaymentStatus } from "../../types";

import { mockTransactions } from "../../data/utils";

export function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = mockTransactions.filter((tx: any) => 
    (tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.gateway_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-50 border-red-100';
      case 'REFUNDED': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Giao dịch thành công</p>
          <p className="text-2xl font-bold text-slate-800">2,450,000đ</p>
          <div className="mt-2 flex items-center text-green-600 text-xs font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+15% hôm nay</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đang chờ xử lý</p>
          <p className="text-2xl font-bold text-slate-800">1,200,000đ</p>
          <div className="mt-2 flex items-center text-yellow-600 text-xs font-bold">
            <span>3 giao dịch</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Thất bại/Hoàn tiền</p>
          <p className="text-2xl font-bold text-slate-800">0đ</p>
          <div className="mt-2 text-slate-400 text-xs">
            <span>Không có biến động</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo ID giao dịch hoặc Mã cổng thanh toán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Giao dịch</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Phương thức</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã cổng (Gateway ID)</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Số tiền</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 tracking-tighter">#{tx.id.split('-').pop()}</div>
                        <div className="text-[10px] text-slate-400">Order Ref: #{tx.booking_id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md">
                      {tx.payment_method}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
                    {tx.gateway_transaction_id || '---'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold text-slate-800">
                      {tx.amount.toLocaleString('vi-VN')} {tx.currency}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(tx.status)}`}>
                      {tx.status === 'SUCCESS' ? <CheckCircle className="w-3 h-3" /> : 
                       tx.status === 'PENDING' ? <Clock className="w-3 h-3" /> : 
                       <AlertTriangle className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
