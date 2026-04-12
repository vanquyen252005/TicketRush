import { Link } from "react-router";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Event } from "../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getStatusBadge = () => {
    switch (event.status) {
      case "DRAFT":
        return (
          <div className="rounded-full bg-slate-500 px-3 py-1 text-xs text-white">
            Ban nhap
          </div>
        );
      case "SELLING":
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-xs text-white animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white"></span>
            Dang ban
          </div>
        );
      case "COMING_SOON":
        return (
          <div className="rounded-full bg-yellow-500 px-3 py-1 text-xs text-white">
            Sap mo ban
          </div>
        );
      case "SOLD_OUT":
        return (
          <div className="rounded-full bg-red-500 px-3 py-1 text-xs text-white">
            Het ve
          </div>
        );
      default:
        return null;
    }
  };

  const isDisabled =
    event.status === "SOLD_OUT" || event.status === "COMING_SOON" || event.status === "DRAFT";
  const eventDate = new Date(event.start_time);

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {event.status === "SOLD_OUT" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="transform -rotate-12 border-4 border-white px-8 py-4 text-4xl font-bold text-white">
              SOLD OUT
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">{getStatusBadge()}</div>
        <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {event.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-3 min-h-[3.5rem] line-clamp-2 text-xl font-bold text-slate-800">
          {event.name}
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(eventDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{format(eventDate, "HH:mm", { locale: vi })}</span>
          </div>
        </div>

        {isDisabled ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-slate-500"
          >
            {event.status === "SOLD_OUT"
              ? "Da het ve"
              : event.status === "DRAFT"
                ? "Dang an"
                : "Chua mo ban"}
          </button>
        ) : (
          <Link
            to={`/event/${event.id}`}
            className="block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-center text-white transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg"
          >
            Dat ve ngay
          </Link>
        )}
      </div>
    </div>
  );
}
