import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { Event } from "../../data/mock-data";
import { eventService } from "../../services/event-service";

const EMPTY_FORM: Partial<Event> = {
  name: "",
  description: "",
  location: "",
  image: "",
  start_time: "",
  end_time: "",
  status: "COMING_SOON",
};

const STATUS_OPTIONS: Array<{ value: Event["status"]; label: string }> = [
  { value: "DRAFT", label: "Ban nhap" },
  { value: "COMING_SOON", label: "Sap mo ban" },
  { value: "SELLING", label: "Dang ban" },
  { value: "SOLD_OUT", label: "Het ve" },
  { value: "COMPLETED", label: "Da ket thuc / Huy" },
];

export function AdminEventsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState<Partial<Event>>(EMPTY_FORM);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode || !id) {
      setFormData(EMPTY_FORM);
      setIsInitialLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        setIsInitialLoading(true);
        const event = await eventService.getEventById(id);
        setFormData(event);
        setError(null);
      } catch (err) {
        console.error("Failed to load event for editing:", err);
        setError("Khong tai duoc thong tin su kien de chinh sua.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadEvent();
  }, [id, isEditMode]);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name?.trim() || !formData.location?.trim() || !formData.start_time?.trim()) {
      setError("Ten su kien, dia diem va thoi gian bat dau la bat buoc.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode && id) {
        await eventService.updateEvent(id, formData);
      } else {
        await eventService.createEvent(formData);
      }

      navigate("/admin/events");
    } catch (err) {
      console.error("Failed to save event:", err);
      setError(err instanceof Error ? err.message : "Khong luu duoc su kien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
          <span>Dang tai thong tin su kien...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            {isEditMode ? "Cap nhat su kien" : "Tao su kien moi"}
          </h1>
          <p className="mt-2 text-slate-600">
            {isEditMode
              ? `Cap nhat thong tin cho su kien #${id}.`
              : "Nhap thong tin de tao su kien moi trong he thong."}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Ten su kien</span>
              <input
                name="name"
                value={formData.name ?? ""}
                onChange={handleFieldChange}
                placeholder="Vi du: Monsoon Music Festival"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Dia diem</span>
              <input
                name="location"
                value={formData.location ?? ""}
                onChange={handleFieldChange}
                placeholder="Vi du: Nha hat Hoa Binh, TP.HCM"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Mo ta</span>
            <textarea
              name="description"
              value={formData.description ?? ""}
              onChange={handleFieldChange}
              rows={5}
              placeholder="Mo ta ngan gon ve noi dung su kien..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Anh su kien</span>
            <input
              name="image"
              value={formData.image ?? ""}
              onChange={handleFieldChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Thoi gian bat dau
              </span>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time ?? ""}
                onChange={handleFieldChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Thoi gian ket thuc
              </span>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time ?? ""}
                onChange={handleFieldChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Trang thai</span>
            <select
              name="status"
              value={formData.status ?? "COMING_SOON"}
              onChange={handleFieldChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditMode ? "Luu thay doi" : "Tao su kien"}</span>
            </button>

            <Link
              to="/admin/events"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-slate-700 transition hover:bg-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lai danh sach</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
