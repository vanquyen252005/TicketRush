import { useEffect, useMemo, useState } from "react";
import { Zone, Seat } from "../types";
import { Armchair, X } from "lucide-react";

interface SeatSelectorProps {
  zones: Zone[];
  selectedSeats: number[];
  onSeatsChange: (seats: number[]) => void;
}

export function SeatSelector({ zones, selectedSeats, onSeatsChange }: SeatSelectorProps) {
  const [selectedZone, setSelectedZone] = useState<number>(zones[0]?.id || 1);

  useEffect(() => {
    if (zones.length === 0) {
      return;
    }

    if (!zones.some(zone => zone.id === selectedZone)) {
      setSelectedZone(zones[0].id);
    }
  }, [selectedZone, zones]);

  const zone = zones.find(z => z.id === selectedZone);
  const seats = useMemo(() => {
    if (!zone?.seats?.length) {
      return [];
    }

    return [...zone.seats].sort((a, b) => {
      const rowCompare = a.row_label.localeCompare(b.row_label, undefined, { numeric: true, sensitivity: "base" });
      if (rowCompare !== 0) {
        return rowCompare;
      }

      return a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [zone]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    if (selectedSeats.includes(seat.id)) {
      onSeatsChange(selectedSeats.filter(id => id !== seat.id));
    } else {
      onSeatsChange([...selectedSeats, seat.id]);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      return 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500';
    }
    
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-white border-slate-300 hover:bg-cyan-50 hover:border-cyan-500 cursor-pointer';
      case 'LOCKED':
        return 'bg-red-100 border-red-300 cursor-not-allowed';
      case 'BOOKED':
        return 'bg-slate-300 border-slate-400 cursor-not-allowed';
      default:
        return 'bg-white border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelectedZone(z.id)}
            disabled={(z.available ?? 1) === 0}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedZone === z.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                : (z.available ?? 1) === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-cyan-500'
            }`}
          >
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: z.color_hex }}
            ></div>
            <span>{z.name}</span>
            {z.available === 0 && <X className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {/* Stage */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white text-center py-4 rounded-lg shadow-lg">
        <div className="text-sm font-semibold">SÂN KHẤU</div>
      </div>

      {/* Seat Map */}
      <div className="bg-slate-50 rounded-xl p-6 overflow-x-auto">
        <div className="inline-block min-w-full">
          {seats.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Armchair className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Chưa có dữ liệu ghế cho khu vực này</p>
            </div>
          ) : (
            Array.from(new Set(seats.map(s => s.row_label))).map((row) => (
              <div key={row} className="flex items-center gap-2 mb-2">
                <div className="w-8 text-center font-semibold text-slate-600">
                  {row}
                </div>

                <div className="flex gap-1">
                  {seats
                    .filter(s => s.row_label === row)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'BOOKED' || seat.status === 'LOCKED'}
                        className={`min-w-[40px] h-10 px-1 rounded border-2 transition-all flex items-center justify-center text-xs ${getSeatColor(seat)}`}
                        title={`${row}${seat.seat_number} - ${seat.status === 'BOOKED' ? 'Đã bán' : seat.status === 'LOCKED' ? 'Đang giữ' : 'Có sẵn'}`}
                      >
                        {seat.status === 'BOOKED' ? (
                          <span className="text-slate-500 line-through opacity-70 font-semibold">{row}{seat.seat_number}</span>
                        ) : selectedSeats.includes(seat.id) ? (
                          <span className="text-white font-bold">{row}{seat.seat_number}</span>
                        ) : seat.status === 'LOCKED' ? (
                           <span className="text-red-400 font-semibold">{row}{seat.seat_number}</span>
                        ) : (
                          <span className="text-slate-700 font-medium">{row}{seat.seat_number}</span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border-2 border-slate-300 rounded flex items-center justify-center">
            <Armchair className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-slate-600">Có sẵn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
          <span className="text-slate-600">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
          <span className="text-slate-600">Đang giữ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-300 border-2 border-slate-400 rounded flex items-center justify-center">
            <X className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-slate-600">Đã bán</span>
        </div>
      </div>
    </div>
  );
}
