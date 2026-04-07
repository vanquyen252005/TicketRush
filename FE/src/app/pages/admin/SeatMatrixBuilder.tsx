import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { AdminLayout } from "../../components/AdminLayout";
import { SeatComponent } from "../../components/SeatComponent";
import { store } from "../../store";
import { Seat, Zone } from "../../types";
import { Plus, Save, Trash2, Grid3x3, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function SeatMatrixBuilder() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = eventId ? store.getEvent(eventId) : null;

  const [zones, setZones] = useState<Zone[]>([
    { id: "vip", name: "VIP", color: "#F59E0B", rows: 5, cols: 10, price: 2000000 },
    { id: "a", name: "Zone A", color: "#3B82F6", rows: 5, cols: 10, price: 1500000 },
    { id: "b", name: "Zone B", color: "#8B5CF6", rows: 5, cols: 10, price: 1000000 },
  ]);

  const [selectedZone, setSelectedZone] = useState<string>("vip");
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [bulkPrice, setBulkPrice] = useState("");

  const [newZone, setNewZone] = useState({
    name: "",
    rows: 5,
    cols: 10,
    price: 500000,
  });

  useEffect(() => {
    if (!event) {
      navigate("/admin/events");
    }
  }, [event, navigate]);

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    const zone: Zone = {
      id: `zone-${Date.now()}`,
      name: newZone.name,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      rows: newZone.rows,
      cols: newZone.cols,
      price: newZone.price,
    };
    setZones([...zones, zone]);
    setShowAddZoneModal(false);
    setNewZone({ name: "", rows: 5, cols: 10, price: 500000 });
    toast.success("Đã thêm khu vực mới");
  };

  const handleDeleteZone = (zoneId: string) => {
    if (zones.length <= 1) {
      toast.error("Phải có ít nhất một khu vực");
      return;
    }
    setZones(zones.filter((z) => z.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(zones[0].id);
    }
    toast.success("Đã xóa khu vực");
  };

  const handleSeatClick = (seatId: string) => {
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      newSelected.add(seatId);
    }
    setSelectedSeats(newSelected);
  };

  const handleBulkPriceUpdate = () => {
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (selectedSeats.size === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }

    // Update selected zone price (in real app, would update individual seats)
    const updatedZones = zones.map((zone) => {
      if (zone.id === selectedZone) {
        return { ...zone, price };
      }
      return zone;
    });

    setZones(updatedZones);
    setSelectedSeats(new Set());
    setBulkPrice("");
    toast.success(`Đã cập nhật giá cho ${selectedSeats.size} ghế`);
  };

  const handleSaveMatrix = () => {
    if (!eventId) return;

    // Calculate total seats
    const totalSeats = zones.reduce((sum, zone) => sum + zone.rows * zone.cols, 0);
    const minPrice = Math.min(...zones.map((z) => z.price));
    const maxPrice = Math.max(...zones.map((z) => z.price));

    store.updateEvent(eventId, {
      totalSeats,
      price: { min: minPrice, max: maxPrice },
    });

    // Generate seat data
    store.getSeats(eventId);

    toast.success("Đã lưu sơ đồ ghế thành công!");
    navigate("/admin/events");
  };

  if (!event) return null;

  const currentZone = zones.find((z) => z.id === selectedZone);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bộ dựng Sơ đồ ghế</h1>
          <p className="text-gray-600">{event.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/events")}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveMatrix}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Lưu sơ đồ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone Management Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Khu vực</h3>
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedZone === zone.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.name}</span>
                    </div>
                    {zones.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      {zone.rows} hàng × {zone.cols} cột
                    </div>
                    <div className="font-medium text-blue-600">
                      {zone.price.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Edit Tools */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-4">Công cụ chỉnh sửa</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Ghế đã chọn: {selectedSeats.size}
              </div>
              {selectedSeats.size > 0 && (
                <button
                  onClick={() => setSelectedSeats(new Set())}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá cho nhóm ghế
                </label>
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000000"
                />
              </div>

              <button
                onClick={handleBulkPriceUpdate}
                disabled={selectedSeats.size === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4" />
                <span>Cập nhật giá</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seat Matrix Canvas */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">
              {currentZone?.name} - Sơ đồ ghế
            </h3>
            <p className="text-sm text-gray-600">
              Click vào ghế để chọn, sau đó sử dụng công cụ bên trái để chỉnh sửa hàng loạt
            </p>
          </div>

          {/* Stage */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg py-4 text-center font-bold text-gray-700">
              🎭 SÂN KHẤU
            </div>
          </div>

          {/* Seat Grid */}
          {currentZone && (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex gap-1 mb-2 justify-center">
                  <div className="w-10" />
                  {Array.from({ length: currentZone.cols }, (_, i) => (
                    <div
                      key={i}
                      className="w-10 text-center text-sm font-medium text-gray-600"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                {Array.from({ length: currentZone.rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 mb-1 justify-center">
                    <div className="w-10 flex items-center justify-center text-sm font-medium text-gray-600">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>
                    {Array.from({ length: currentZone.cols }, (_, colIndex) => {
                      const seatId = `${selectedZone}-${rowIndex}-${colIndex}`;
                      const isSelected = selectedSeats.has(seatId);
                      const mockSeat: Seat = {
                        id: seatId,
                        row: rowIndex + 1,
                        col: colIndex + 1,
                        zone: currentZone.name,
                        price: currentZone.price,
                        status: isSelected ? "selected" : "available",
                        label: `${currentZone.name}-${String.fromCharCode(65 + rowIndex)}${
                          colIndex + 1
                        }`,
                      };
                      return (
                        <div
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                        >
                          <SeatComponent seat={mockSeat} size="lg" />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tổng ghế</div>
              <div className="text-2xl font-bold text-blue-600">
                {currentZone ? currentZone.rows * currentZone.cols : 0}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Giá mỗi ghế</div>
              <div className="text-2xl font-bold text-green-600">
                {currentZone?.price.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Doanh thu tối đa</div>
              <div className="text-2xl font-bold text-purple-600">
                {currentZone
                  ? (currentZone.rows * currentZone.cols * currentZone.price).toLocaleString(
                      "vi-VN"
                    )
                  : 0}
                đ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Zone Modal */}
      <AnimatePresence>
        {showAddZoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddZoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Thêm khu vực mới</h2>

              <form onSubmit={handleAddZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khu vực *
                  </label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Zone C"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số hàng *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newZone.rows}
                      onChange={(e) =>
                        setNewZone({ ...newZone, rows: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số cột *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newZone.cols}
                      onChange={(e) =>
                        setNewZone({ ...newZone, cols: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá mỗi ghế (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={newZone.price}
                    onChange={(e) =>
                      setNewZone({ ...newZone, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddZoneModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
