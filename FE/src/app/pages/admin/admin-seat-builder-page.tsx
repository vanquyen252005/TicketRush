import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Save, Trash2, Grid3x3 } from "lucide-react";
import { mockEvents, mockZones } from "../../data/mock-data";

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

  // Initialize grid
  const [grid, setGrid] = useState<GridSeat[][]>(() => {
    const initialGrid: GridSeat[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: GridSeat[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({ row: r, col: c, zoneId: null });
      }
      initialGrid.push(row);
    }
    return initialGrid;
  });

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

  const getSeatColor = (zoneId: number | null) => {
    if (!zoneId) return 'bg-slate-200 border-slate-300';
    const zone = zones.find(z => z.id === zoneId);
    return zone ? `border-2` : 'bg-slate-200 border-slate-300';
  };

  const handleCreateZone = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newZone = {
      id: zones.length + 1,
      event_id: Number(id),
      name: formData.get('name') as string,
      base_price: Number(formData.get('price')),
      color_hex: formData.get('color') as string,
      capacity: 0,
      available: 0
    };

    setZones([...zones, newZone]);
    setSelectedZone(newZone.id);
    setShowZoneModal(false);
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
            
            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedZone === zone.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color_hex }}
                    ></div>
                    <span className="font-semibold text-slate-800">{zone.name}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {zone.base_price.toLocaleString('vi-VN')}đ
                  </p>
                </button>
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
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white text-center py-3 rounded-lg shadow-lg mb-6">
              <div className="font-semibold">SÂN KHẤU</div>
            </div>
          </div>

          <div 
            className="overflow-auto max-h-[600px]"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="inline-block min-w-full">
              {grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 mb-1">
                  <div className="w-8 flex items-center justify-center text-sm font-semibold text-slate-600">
                    {String.fromCharCode(65 + rowIdx)}
                  </div>
                  {row.map((seat, colIdx) => {
                    const zone = zones.find(z => z.id === seat.zoneId);
                    
                    return (
                      <div
                        key={colIdx}
                        onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                        onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                        className={`w-8 h-8 rounded border cursor-pointer transition-all hover:opacity-80 ${getSeatColor(seat.zoneId)}`}
                        style={
                          zone
                            ? {
                                backgroundColor: zone.color_hex + '40',
                                borderColor: zone.color_hex
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              ))}
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
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Tạo khu vực mới
            </h2>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên khu vực
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="VD: VIP A, Standard"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Giá niêm yết (VNĐ)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="2000000"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Màu sắc
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#FF6B6B"
                  required
                  className="w-full h-12 px-2 py-1 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  Tạo khu vực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
