import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Save, Trash2, Grid3x3, Edit } from "lucide-react";
import { mockEvents, mockZones } from "../../data/utils";

interface GridSeat {
  row: number;
  col: number;
  zoneId: number | null;
}

export function AdminSeatBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = mockEvents.find(e => e.id === Number(id));
  const [zones, setZones] = useState(mockZones.filter(z => z.event_id === Number(id)));
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(15);
  const [selectedZone, setSelectedZone] = useState<number | null>(zones[0]?.id || null);
  const [isDragging, setIsDragging] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);

  // Initialize grid
  const [grid, setGrid] = useState<GridSeat[][]>(() => {
    const initialGrid: GridSeat[][] = [];
    for (let r = 0; r < 20; r++) { // Max rows for underlying buffer
      const row: GridSeat[] = [];
      for (let c = 0; c < 25; c++) { // Max cols for underlying buffer
        row.push({ row: r, col: c, zoneId: null });
      }
      initialGrid.push(row);
    }
    return initialGrid;
  });

  // Re-generate or adjust grid is not needed if we just slice it in render, 
  // but to keep state clean and preserve assignments, we'll keep the full buffer 
  // and only show rows/cols. However, the user asked for "thông số kích thước lưới thay đổi thì hình ảnh mô phỏng cũng thay đổi".
  // Let's stick to a sliced view or a reactive resize.

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    toggleSeat(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      toggleSeat(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSeat = (row: number, col: number) => {
    if (!selectedZone) return;

    setGrid(prev => {
      const newGrid = [...prev];
      const currentZone = newGrid[row][col].zoneId;
      
      // Toggle: if same zone, clear it; otherwise set to selected zone
      newGrid[row][col] = {
        ...newGrid[row][col],
        zoneId: currentZone === selectedZone ? null : selectedZone
      };
      
      return newGrid;
    });
  };


  const handleCreateOrUpdateZone = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const color = formData.get('color') as string;

    if (editingZone) {
      setZones(prev => prev.map(z => 
        z.id === editingZone.id 
          ? { ...z, name, base_price: price, color_hex: color } 
          : z
      ));
    } else {
      const newZone = {
        id: Math.max(0, ...zones.map(z => z.id)) + 1,
        event_id: Number(id),
        name,
        base_price: price,
        color_hex: color,
        capacity: 0,
        available: 0
      };
      setZones([...zones, newZone]);
      if (!selectedZone) setSelectedZone(newZone.id);
    }

    setEditingZone(null);
    setShowZoneModal(false);
  };

  const handleDeleteZone = (zoneId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khu vực này? Tất cả ghế đã gán sẽ bị xóa.')) {
      setZones(zones.filter(z => z.id !== zoneId));
      if (selectedZone === zoneId) setSelectedZone(null);
      
      // Clear assignments in grid
      setGrid(prev => prev.map(row => 
        row.map(seat => 
          seat.zoneId === zoneId ? { ...seat, zoneId: null } : seat
        )
      ));
    }
  };

  const handleSave = () => {
    alert('Sơ đồ ghế đã được lưu thành công!');
    navigate('/admin/events');
  };

  if (!event) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sự kiện</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/events')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Thiết lập Sơ đồ ghế
            </h1>
            <p className="text-slate-600">{event.name}</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>Lưu sơ đồ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Grid Size */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Kích thước lưới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số hàng: {rows}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số cột: {cols}
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Khu vực</h3>
              <button
                onClick={() => setShowZoneModal(true)}
                className="p-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {zones.map((zone) => (
                <div 
                  key={zone.id}
                  className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedZone === zone.id
                      ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-inner"
                        style={{ backgroundColor: zone.color_hex }}
                      ></div>
                      <span className="font-bold text-slate-800 text-sm tracking-tight">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingZone(zone);
                          setShowZoneModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-md transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 ml-6">
                    {zone.base_price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chọn một khu vực từ danh sách</li>
              <li>• Click hoặc kéo trên lưới để gán ghế</li>
              <li>• Click lại để bỏ chọn</li>
              <li>• Nhấn Lưu để hoàn tất</li>
            </ul>
          </div>
        </div>

        {/* Grid Editor */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
          <div className="w-full mb-10">
            <div 
              className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white text-center py-4 rounded-2xl shadow-2xl mx-auto transition-all duration-300 border-b-4 border-slate-900"
              style={{ width: `${Math.min(100, cols * 4)}%`, maxWidth: '100%', minWidth: '200px' }}
            >
              <div className="text-sm font-black tracking-[0.2em] uppercase opacity-90">SÂN KHẤU CHÍNH</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{cols} columns</div>
            </div>
          </div>

          <div 
            className="overflow-auto max-w-full p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="inline-block">
              {/* Column Numbers Header */}
              <div className="flex gap-1 mb-2 ml-10">
                {Array.from({ length: cols }).map((_, i) => (
                  <div key={i} className="w-8 text-[10px] font-bold text-slate-400 text-center">
                    {i + 1}
                  </div>
                ))}
              </div>

              {grid.slice(0, rows).map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 mb-1">
                  <div className="w-10 pr-2 flex items-center justify-end text-sm font-black text-slate-400 font-mono">
                    {String.fromCharCode(65 + rowIdx)}
                  </div>
                  {row.slice(0, cols).map((seat, colIdx) => {
                    const zone = zones.find(z => z.id === seat.zoneId);
                    
                    return (
                      <div
                        key={colIdx}
                        onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                        onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                        className={`w-8 h-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center text-[8px] font-bold ${
                          zone ? 'shadow-sm' : 'bg-white border-slate-100 text-slate-300'
                        }`}
                        style={
                          zone
                            ? {
                                backgroundColor: zone.color_hex + '20',
                                borderColor: zone.color_hex,
                                color: zone.color_hex
                              }
                            : undefined
                        }
                      >
                        {zone ? `${String.fromCharCode(65 + rowIdx)}${colIdx + 1}` : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-slate-200 bg-white"></div>
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-cyan-500 bg-cyan-50"></div>
              <span>Đã gán khu vực</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Zone Modal */}
      {showZoneModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowZoneModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">
              {editingZone ? 'Chỉnh sửa khu vực' : 'Tạo khu vực mới'}
            </h2>

            <form onSubmit={handleCreateOrUpdateZone} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Tên khu vực
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingZone?.name}
                  placeholder="VD: VIP A, Standard"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Giá niêm yết (VNĐ)
                </label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingZone?.base_price}
                  placeholder="2000000"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Màu sắc đại diện
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue={editingZone?.color_hex || "#FF6B6B"}
                  required
                  className="w-full h-14 p-1 rounded-xl cursor-pointer border-2 border-slate-100 hover:border-slate-200 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneModal(false);
                    setEditingZone(null);
                  }}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 font-bold text-sm"
                >
                  {editingZone ? 'Lưu thay đổi' : 'Tạo khu vực'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
