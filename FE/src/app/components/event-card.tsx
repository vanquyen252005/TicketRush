import { Link } from "react-router";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Event } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getStatusBadge = () => {
    switch (event.status) {
      case 'PUBLISHED':
      case 'SELLING':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Đang bán
          </div>
        );
      case 'COMING_SOON':
        return (
          <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs">
            Sắp mở bán
          </div>
        );
      case 'SOLD_OUT':
        return (
          <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
            Hết vé
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="px-3 py-1 bg-slate-500 text-white rounded-full text-xs">
            Đã hủy
          </div>
        );
      case 'DRAFT':
        return (
          <div className="px-3 py-1 bg-slate-400 text-white rounded-full text-xs">
            Bản nháp
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="px-3 py-1 bg-slate-600 text-white rounded-full text-xs">
            Đã kết thúc
          </div>
        );
      default:
        return null;
    }
  };

  const isDisabled = event.status === 'SOLD_OUT' || event.status === 'COMING_SOON' || event.status === 'DRAFT' || event.status === 'CANCELLED' || event.status === 'COMPLETED';
  const eventDate = new Date(event.startTime || event.start_time);

  return (
    <Link 
      to={`/event/${event.id}`}
      state={{ event }}
      className="block group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-95 cursor-pointer border border-slate-100"
    >
      {/* Event Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={event.imageUrl || event.image} 
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {event.status === 'SOLD_OUT' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="transform -rotate-12 text-4xl font-bold text-white border-4 border-white px-8 py-4">
              SOLD OUT
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full text-xs">
          {event.category || "Âm nhạc"}
        </div>
      </div>

      {/* Event Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-cyan-600 transition-colors">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{format(eventDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{format(eventDate, "HH:mm", { locale: vi })}</span>
          </div>
        </div>

        {/* CTA Button (Styled as div since parent is a Link) */}
        {isDisabled ? (
          <div className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 text-center font-bold">
            {event.status === 'SOLD_OUT' ? 'Đã hết vé' : 'Chưa mở bán'}
          </div>
        ) : (
          <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center font-bold group-hover:from-cyan-700 group-hover:to-blue-700 transition-all shadow-md group-hover:shadow-lg">
            Đặt vé ngay
          </div>
        )}
      </div>
    </Link>
  );
}
