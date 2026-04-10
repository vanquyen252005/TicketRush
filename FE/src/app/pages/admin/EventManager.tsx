import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, Settings, Calendar, MapPin, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { AdminLayout } from "../../components/AdminLayout";

type AdminEventStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CANCELLED";

type AdminEvent = {
  id: number;
  name: string;
  description: string | null;
  location: string;
  imageUrl: string | null;
  startTime: string;
  endTime: string | null;
  status: AdminEventStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

type EventFormState = {
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: AdminEventStatus;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/admin/events`;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";

const emptyForm: EventFormState = {
  name: "",
  description: "",
  location: "",
  imageUrl: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  status: "DRAFT",
};

const statusLabel: Record<AdminEventStatus, string> = {
  DRAFT: "Nhap",
  PUBLISHED: "Dang ban",
  SOLD_OUT: "Het ve",
  CANCELLED: "Da huy",
};

const statusClassName: Record<AdminEventStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  SOLD_OUT: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

function toLocalDateInput(isoDateTime: string | null) {
  if (!isoDateTime) return { date: "", time: "" };
  const date = new Date(isoDateTime);
  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const localTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return { date: localDate, time: localTime };
}

function toApiDateTime(date: string, time: string) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

function formatEventDate(dateTime: string) {
  return new Date(dateTime).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
    if (data?.details && typeof data.details === "object") {
      return Object.values(data.details).join(", ");
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}

export default function EventManager() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyForm);

  const modalTitle = useMemo(
    () => (editingEvent ? "Cap nhat su kien" : "Tao su kien moi"),
    [editingEvent],
  );

  useEffect(() => {
    void loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data: AdminEvent[] = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the tai danh sach su kien");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingEvent(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(event: AdminEvent) {
    const start = toLocalDateInput(event.startTime);
    const end = toLocalDateInput(event.endTime);
    setEditingEvent(event);
    setForm({
      name: event.name,
      description: event.description ?? "",
      location: event.location,
      imageUrl: event.imageUrl ?? "",
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      status: event.status,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEvent(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      location: form.location.trim(),
      imageUrl: form.imageUrl.trim() || null,
      startTime: toApiDateTime(form.startDate, form.startTime),
      endTime: form.endDate && form.endTime ? toApiDateTime(form.endDate, form.endTime) : null,
      status: form.status,
    };

    if (!payload.startTime) {
      toast.error("Ngay gio bat dau la bat buoc");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(editingEvent ? `${API_URL}/${editingEvent.id}` : API_URL, {
        method: editingEvent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await loadEvents();
      closeModal();
      toast.success(editingEvent ? "Cap nhat su kien thanh cong" : "Tao su kien thanh cong");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the luu su kien");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: number) {
    const confirmed = window.confirm("Xoa su kien nay?");
    if (!confirmed) return;

    setDeletingId(eventId);
    try {
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setEvents((current) => current.filter((item) => item.id !== eventId));
      toast.success("Da xoa su kien");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the xoa su kien");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleQuickStatusUpdate(event: AdminEvent, status: AdminEventStatus) {
    try {
      const response = await fetch(`${API_URL}/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: event.name,
          description: event.description,
          location: event.location,
          imageUrl: event.imageUrl,
          startTime: event.startTime,
          endTime: event.endTime,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const updatedEvent: AdminEvent = await response.json();
      setEvents((current) =>
        current.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)),
      );
      toast.success("Da cap nhat trang thai su kien");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the cap nhat trang thai");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Quan ly su kien</h1>
          <p className="text-gray-600">Tao, chinh sua va xoa su kien tu trang admin</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Tao su kien moi</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white shadow-sm">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Chua co su kien nao</h2>
          <p className="mb-6 text-gray-600">Bat dau bang cach tao su kien dau tien cho he thong.</p>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Tao su kien
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg"
            >
              <div className="grid md:grid-cols-3">
                <img
                  src={event.imageUrl || FALLBACK_IMAGE}
                  alt={event.name}
                  className="h-full min-h-64 w-full object-cover"
                />
                <div className="space-y-5 p-6 md:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="mb-2 text-xl font-bold">{event.name}</h2>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatEventDate(event.startTime)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClassName[event.status]}`}>
                      {statusLabel[event.status]}
                    </span>
                  </div>

                  {event.description && (
                    <p className="line-clamp-3 text-sm leading-6 text-gray-600">{event.description}</p>
                  )}

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <button
                      onClick={() => navigate(`/admin/seat-builder/${event.id}`)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
                    >
                      <Settings className="h-4 w-4" />
                      <span>So do ghe</span>
                    </button>

                    <button
                      onClick={() =>
                        handleQuickStatusUpdate(
                          event,
                          event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                        )
                      }
                      className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                        event.status === "PUBLISHED"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      {event.status === "PUBLISHED" ? "Chuyen ve nhap" : "Mo ban"}
                    </button>

                    <button
                      onClick={() => openEditModal(event)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Chinh sua</span>
                    </button>

                    <button
                      onClick={() => void handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === event.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span>Xoa</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8"
              onClick={(modalEvent) => modalEvent.stopPropagation()}
            >
              <h2 className="mb-6 text-2xl font-bold">{modalTitle}</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ten su kien</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Anh Trai Say Hi Concert 2026"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Mo ta</label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Thong tin ngan gon ve su kien"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Dia diem</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, location: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Trang thai</label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as AdminEventStatus,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DRAFT">Nhap</option>
                      <option value="PUBLISHED">Dang ban</option>
                      <option value="SOLD_OUT">Het ve</option>
                      <option value="CANCELLED">Da huy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">URL hinh anh</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/event.jpg"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Ngay bat dau</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, startDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Gio bat dau</label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, startTime: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Ngay ket thuc</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, endDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Gio ket thuc</label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, endTime: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 transition-colors hover:bg-gray-50"
                  >
                    Huy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    <span>{editingEvent ? "Luu thay doi" : "Tao su kien"}</span>
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
