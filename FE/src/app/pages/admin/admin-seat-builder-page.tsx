import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit, Eraser, Grid3x3, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { eventService } from "../../services/event-service";
import { Event, SeatLayoutRequest, Zone } from "../../types";

interface GridSeat {
  row: number;
  col: number;
  zoneId: number | null;
}

type SelectionMode = "assign" | "clear";

interface SelectionRect {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  mode: SelectionMode;
  zoneId: number | null;
}

const MAX_ROWS = 20;
const MAX_COLS = 25;

const createEmptyGrid = (): GridSeat[][] =>
  Array.from({ length: MAX_ROWS }, (_, row) =>
    Array.from({ length: MAX_COLS }, (_, col) => ({
      row,
      col,
      zoneId: null,
    }))
  );

const rowLabelForIndex = (index: number) => String.fromCharCode(65 + index);

const parseRowIndex = (rowLabel: string) => {
  const normalized = rowLabel?.trim()?.toUpperCase();
  if (!normalized) {
    return -1;
  }

  return normalized.charCodeAt(0) - 65;
};

const parseSeatIndex = (seatNumber: string) => {
  const parsed = Number.parseInt(seatNumber, 10);
  return Number.isNaN(parsed) ? -1 : parsed - 1;
};

const buildGridFromZones = (zones: Zone[]) => {
  const nextGrid = createEmptyGrid();
  let nextRows = 10;
  let nextCols = 15;

  zones.forEach((zone) => {
    zone.seats?.forEach((seat) => {
      const rowIndex = parseRowIndex(seat.row_label);
      const colIndex = parseSeatIndex(seat.seat_number);

      if (rowIndex < 0 || colIndex < 0 || rowIndex >= MAX_ROWS || colIndex >= MAX_COLS) {
        return;
      }

      nextRows = Math.max(nextRows, rowIndex + 1);
      nextCols = Math.max(nextCols, colIndex + 1);
      nextGrid[rowIndex][colIndex].zoneId = zone.id;
    });
  });

  return {
    grid: nextGrid,
    rows: Math.min(MAX_ROWS, nextRows),
    cols: Math.min(MAX_COLS, nextCols),
  };
};

const countAssignedSeats = (grid: GridSeat[][], rows: number, cols: number, zoneId: number) => {
  let count = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row]?.[col]?.zoneId === zoneId) {
        count += 1;
      }
    }
  }

  return count;
};

const normalizeSelection = (selection: SelectionRect) => ({
  startRow: Math.min(selection.startRow, selection.endRow),
  endRow: Math.max(selection.startRow, selection.endRow),
  startCol: Math.min(selection.startCol, selection.endCol),
  endCol: Math.max(selection.startCol, selection.endCol),
});

const isCellSelected = (row: number, col: number, selection: SelectionRect | null) => {
  if (!selection) {
    return false;
  }

  const bounds = normalizeSelection(selection);
  return row >= bounds.startRow && row <= bounds.endRow && col >= bounds.startCol && col <= bounds.endCol;
};

const applySelectionToGrid = (prevGrid: GridSeat[][], rows: number, cols: number, selection: SelectionRect) => {
  const nextGrid = prevGrid.map((gridRow) => gridRow.map((cell) => ({ ...cell })));
  const bounds = normalizeSelection(selection);
  const zoneId = selection.mode === "assign" ? selection.zoneId : null;

  for (let row = Math.max(0, bounds.startRow); row <= Math.min(bounds.endRow, rows - 1); row += 1) {
    for (let col = Math.max(0, bounds.startCol); col <= Math.min(bounds.endCol, cols - 1); col += 1) {
      nextGrid[row][col] = {
        ...nextGrid[row][col],
        zoneId,
      };
    }
  }

  return nextGrid;
};

export function AdminSeatBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(15);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("assign");
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [grid, setGrid] = useState<GridSeat[][]>(() => createEmptyGrid());

  const selectionRef = useRef<SelectionRect | null>(null);
  const isSelectingRef = useRef(false);
  const rowsRef = useRef(rows);
  const colsRef = useRef(cols);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    colsRef.current = cols;
  }, [cols]);

  const syncSelection = (next: SelectionRect | null) => {
    selectionRef.current = next;
    setSelection(next);
  };

  const applyEventLayout = (data: Event) => {
    const initialZones = data.zones ?? [];
    const { grid: nextGrid, rows: nextRows, cols: nextCols } = buildGridFromZones(initialZones);

    setEvent(data);
    setZones(initialZones);
    setGrid(nextGrid);
    setRows(nextRows);
    setCols(nextCols);
    setSelectedZone(initialZones[0]?.id ?? null);
    setSelectionMode("assign");
    syncSelection(null);
  };

  const commitSelection = () => {
    if (!isSelectingRef.current) {
      return;
    }

    const currentSelection = selectionRef.current;
    isSelectingRef.current = false;

    if (!currentSelection) {
      syncSelection(null);
      return;
    }

    if (currentSelection.mode === "assign" && !currentSelection.zoneId) {
      toast.error("Hãy chọn khu vực trước khi gán ghế");
      syncSelection(null);
      return;
    }

    setGrid((prev) => applySelectionToGrid(prev, rowsRef.current, colsRef.current, currentSelection));
    syncSelection(null);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelectingRef.current) {
        commitSelection();
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const startSelection = (row: number, col: number) => {
    if (selectionMode === "assign" && !selectedZone) {
      toast.error("Hãy chọn một khu vực trước khi gán ghế");
      return;
    }

    isSelectingRef.current = true;
    syncSelection({
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col,
      mode: selectionMode,
      zoneId: selectionMode === "assign" ? selectedZone : null,
    });
  };

  const extendSelection = (row: number, col: number) => {
    if (!isSelectingRef.current || !selectionRef.current) {
      return;
    }

    syncSelection({
      ...selectionRef.current,
      endRow: row,
      endCol: col,
    });
  };

  const handleSeatMouseDown = (event: MouseEvent<HTMLButtonElement>, row: number, col: number) => {
    event.preventDefault();
    startSelection(row, col);
  };

  const handleCreateOrUpdateZone = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "");
    const price = Number(formData.get("price"));
    const color = String(formData.get("color") || "#06b6d4");

    if (!name.trim() || Number.isNaN(price)) {
      toast.error("Vui lòng nhập tên và giá khu vực hợp lệ");
      return;
    }

    if (editingZone) {
      setZones((prev) =>
        prev.map((zone) =>
          zone.id === editingZone.id
            ? { ...zone, name, base_price: price, color_hex: color }
            : zone
        )
      );
    } else {
      const newZone: Zone = {
        id: Math.max(0, ...zones.map((zone) => zone.id)) + 1,
        event_id: Number(id),
        name,
        base_price: price,
        color_hex: color,
        capacity: 0,
        available: 0,
      };

      setZones((prev) => [...prev, newZone]);
      setSelectedZone((current) => current ?? newZone.id);
    }

    setEditingZone(null);
    setShowZoneModal(false);
  };

  const handleDeleteZone = (zoneId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khu vực này?")) {
      return;
    }

    setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }

    setGrid((prev) =>
      prev.map((gridRow) =>
        gridRow.map((seat) =>
          seat.zoneId === zoneId ? { ...seat, zoneId: null } : seat
        )
      )
    );
  };

  const handleSave = async () => {
    if (!event) {
      return;
    }

    const payloadZones = zones
      .map((zone) => {
        const seats: SeatLayoutRequest["zones"][number]["seats"] = [];

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            if (grid[row]?.[col]?.zoneId !== zone.id) {
              continue;
            }

            seats.push({
              row_label: rowLabelForIndex(row),
              seat_number: String(col + 1),
            });
          }
        }

        return {
          id: zone.id,
          name: zone.name,
          base_price: zone.base_price,
          color_hex: zone.color_hex,
          seats,
        };
      })
      .filter((zone) => zone.seats.length > 0);

    if (payloadZones.length === 0) {
      toast.error("Hãy tạo ít nhất một khu vực và gán ghế trước khi lưu");
      return;
    }

    const emptyZones = zones.filter((zone) => countAssignedSeats(grid, rows, cols, zone.id) === 0);
    if (emptyZones.length > 0) {
      toast.error(`Khu vực ${emptyZones.map((zone) => zone.name).join(", ")} chưa được gán ghế`);
      return;
    }

    const layoutRequest: SeatLayoutRequest = {
      rows,
      cols,
      zones: payloadZones,
    };

    setIsSaving(true);
    try {
      const updated = await eventService.saveSeatLayout(event.id, layoutRequest);
      setEvent(updated);
      setZones(updated.zones ?? []);
      toast.success("Đã lưu sơ đồ ghế vào backend");
      navigate("/admin/events");
    } catch (error) {
      console.error("Lỗi khi lưu sơ đồ ghế:", error);
      const message = isAxiosError(error)
        ? (error.response?.data as any)?.error || (error.response?.data as any)?.message || error.message
        : error instanceof Error
        ? error.message
        : "Không thể lưu sơ đồ ghế";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) {
          return;
        }

        const data = await eventService.getEventById(Number(id));
        applyEventLayout(data);
      } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (zones.length === 0) {
      return;
    }

    if (!selectedZone || !zones.some((zone) => zone.id === selectedZone)) {
      setSelectedZone(zones[0].id);
    }
  }, [zones, selectedZone]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Đang tải thông tin...</h2>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sự kiện</h2>
        <button
          onClick={() => navigate("/admin/events")}
          className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/events")}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Thiết lập sơ đồ ghế</h1>
            <p className="text-slate-600">{event.name}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{isSaving ? "Đang lưu..." : "Lưu sơ đồ"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Kích thước lưới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số hàng: {rows}</label>
                <input
                  type="range"
                  min="5"
                  max={MAX_ROWS}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số cột: {cols}</label>
                <input
                  type="range"
                  min="5"
                  max={MAX_COLS}
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-slate-500">
                Khi lưu, chỉ các ô đang được gán khu vực mới được gửi xuống backend.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Chế độ thao tác</h3>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Kéo để gán vùng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode("assign")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  selectionMode === "assign"
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Gán vùng
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode("clear")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  selectionMode === "clear"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Eraser className="w-4 h-4" />
                Bỏ gán
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-5">
              Chọn một khu vực ở bên dưới, sau đó kéo chuột trên lưới để gán hoặc xóa cả một khung ghế thay vì từng ghế.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Khu vực</h3>
              <button
                onClick={() => {
                  setEditingZone(null);
                  setShowZoneModal(true);
                }}
                className="p-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {zones.map((zone) => {
                const assignedSeats = countAssignedSeats(grid, rows, cols, zone.id);

                return (
                  <div
                    key={zone.id}
                    className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedZone === zone.id
                        ? "border-cyan-500 bg-cyan-50 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50/50"
                    }`}
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: zone.color_hex }}></div>
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
                      {zone.base_price.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-xs text-slate-400 ml-6 mt-1">
                      {assignedSeats} ghế đã gán
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chọn một khu vực từ danh sách</li>
              <li>• Chuyển sang "Gán vùng" để kéo chọn một khung ghế</li>
              <li>• Chuyển sang "Bỏ gán" để xóa cả một khung ghế</li>
              <li>• Nhấn Lưu để gửi toàn bộ sơ đồ xuống backend</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
          <div className="w-full mb-10">
            <div
              className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white text-center py-4 rounded-2xl shadow-2xl mx-auto transition-all duration-300 border-b-4 border-slate-900"
              style={{ width: `${Math.min(100, cols * 4)}%`, maxWidth: "100%", minWidth: "200px" }}
            >
              <div className="text-sm font-black tracking-[0.2em] uppercase opacity-90">SÂN KHẤU CHÍNH</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {cols} columns • {rows} rows
              </div>
            </div>
          </div>

          <div className="overflow-auto max-w-full p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 select-none">
            <div className="inline-block">
              <div className="flex gap-1 mb-2 ml-10">
                {Array.from({ length: cols }).map((_, index) => (
                  <div key={index} className="w-8 text-[10px] font-bold text-slate-400 text-center">
                    {index + 1}
                  </div>
                ))}
              </div>

              {grid.slice(0, rows).map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 mb-1">
                  <div className="w-10 pr-2 flex items-center justify-end text-sm font-black text-slate-400 font-mono">
                    {rowLabelForIndex(rowIndex)}
                  </div>

                  {row.slice(0, cols).map((seat, colIndex) => {
                    const zone = zones.find((entry) => entry.id === seat.zoneId);
                    const isPreview = isCellSelected(rowIndex, colIndex, selection);

                    return (
                      <button
                        key={colIndex}
                        type="button"
                        onMouseDown={(event) => handleSeatMouseDown(event, rowIndex, colIndex)}
                        onMouseEnter={() => extendSelection(rowIndex, colIndex)}
                        className={`w-8 h-8 rounded-lg border-2 cursor-crosshair transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center text-[8px] font-bold ${
                          zone ? "shadow-sm" : "bg-white border-slate-100 text-slate-300"
                        } ${isPreview ? (selection?.mode === "clear" ? "ring-2 ring-rose-500 ring-offset-1" : "ring-2 ring-cyan-500 ring-offset-1") : ""}`}
                        style={
                          zone
                            ? {
                                backgroundColor: `${zone.color_hex}20`,
                                borderColor: zone.color_hex,
                                color: zone.color_hex,
                              }
                            : isPreview && selection?.mode === "clear"
                            ? {
                                backgroundColor: "#fff1f2",
                                borderColor: "#fb7185",
                                color: "#e11d48",
                              }
                            : isPreview && selection?.mode === "assign" && selection.zoneId
                            ? {
                                backgroundColor: `${zones.find((entry) => entry.id === selection.zoneId)?.color_hex ?? "#06b6d4"}22`,
                                borderColor: zones.find((entry) => entry.id === selection.zoneId)?.color_hex ?? "#06b6d4",
                                color: zones.find((entry) => entry.id === selection.zoneId)?.color_hex ?? "#06b6d4",
                              }
                            : undefined
                        }
                      >
                        {zone ? `${rowLabelForIndex(rowIndex)}${colIndex + 1}` : ""}
                      </button>
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-2 border-rose-400 bg-rose-50"></div>
              <span>Đang chọn / xóa</span>
            </div>
          </div>
        </div>
      </div>

      {showZoneModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowZoneModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingZone ? "Chỉnh sửa khu vực" : "Tạo khu vực mới"}
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
                  defaultValue={editingZone?.color_hex || "#06b6d4"}
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
                  {editingZone ? "Lưu thay đổi" : "Tạo khu vực"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
