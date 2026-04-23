import { useState } from "react";
import { Settings, Save, Globe, Shield, Mail, CreditCard, Code } from "lucide-react";

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const TabButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all font-bold text-sm ${
        activeTab === id 
          ? 'border-cyan-600 text-cyan-600 bg-cyan-50/50' 
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <TabButton id="general" icon={Globe} label="Cấu hình chung" />
          <TabButton id="security" icon={Shield} label="Bảo mật" />
          <TabButton id="notifications" icon={Mail} label="Thông báo" />
          <TabButton id="payments" icon={CreditCard} label="Cổng thanh toán" />
          <TabButton id="developer" icon={Code} label="Nhà phát triển" />
        </div>

        <div className="p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên ứng dụng</label>
                  <input 
                    type="text" 
                    defaultValue="TicketRush" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ngôn ngữ mặc định</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white">
                    <option>Tiếng Việt</option>
                    <option>Tiếng Anh</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email liên hệ</label>
                  <input 
                    type="email" 
                    defaultValue="support@ticketrush.com" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mô tả SEO</label>
                  <textarea 
                    rows={3}
                    defaultValue="Hệ thống đặt vé sự kiện, âm nhạc và workshop hàng đầu."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab !== "general" && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Settings className="w-8 h-8" />
              </div>
              <p className="text-slate-500 italic">Tính năng {activeTab} đang được hoàn thiện...</p>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-3">
            <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm">
              Hủy thay đổi
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-bold text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-lg text-red-600">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-red-800">Vùng nguy hiểm</h4>
          <p className="text-sm text-red-600 mb-4">Các thay đổi ở đây có thể ảnh hưởng nghiêm trọng đến hệ thống đang vận hành.</p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold text-xs uppercase tracking-widest">
            Bật chế độ bảo trì
          </button>
        </div>
      </div>
    </div>
  );
}
