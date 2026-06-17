"use client";
import { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Clock,
  Map,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";

export default function OfficeContactPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    office_location: "",
    phone_number: "",
    email: "",
    office_hours: "",
    map_link: "",
  });

  useEffect(() => {
    fetchOfficeContactData();
  }, []);

  const fetchOfficeContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/office-contact");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setIsEdit(true);
          setFormData({
            office_location: data.data.office_location || "",
            phone_number: data.data.phone_number || "",
            email: data.data.email || "",
            office_hours: data.data.office_hours || "",
            map_link: data.data.map_link || "",
          });
        } else {
          setIsEdit(false);
        }
      } else if (response.status === 404) {
        setIsEdit(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch office contact data");
      }
    } catch (error) {
      console.error("Error fetching office contact data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect to server. Please ensure Laravel backend is running.",
      );
      setIsEdit(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.office_location ||
        !formData.phone_number ||
        !formData.email ||
        !formData.office_hours
      ) {
        alert("Please fill in all required fields");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address");
        return;
      }
      setIsSubmitting(true);
      setError(null);
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch("/api/office-contact", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Invalid server response");
        return;
      }
      if (response.ok && data.success) {
        alert(`Office Contact ${isEdit ? "updated" : "created"} successfully`);
        fetchOfficeContactData();
      } else {
        setError(data.error || data.message || "Failed to save office contact");
        alert(data.error || data.message || "Failed to save office contact");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save office contact";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
            <p className="mt-4 text-[#6b8f6b] text-sm">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const fields = [
    {
      key: "office_location",
      label: "Office Location",
      icon: MapPin,
      required: true,
      type: "textarea",
      rows: 3,
      placeholder: "Enter complete office address",
      hint: "Enter the complete physical address of your office",
    },
    {
      key: "phone_number",
      label: "Phone Number",
      icon: Phone,
      required: true,
      type: "tel",
      placeholder: "e.g., +1 (555) 123-4567",
      hint: "Contact phone number for inquiries",
    },
    {
      key: "email",
      label: "Email Address",
      icon: Mail,
      required: true,
      type: "email",
      placeholder: "e.g., contact@example.com",
      hint: "Official email address for correspondence",
    },
    {
      key: "office_hours",
      label: "Office Hours",
      icon: Clock,
      required: true,
      type: "textarea",
      rows: 4,
      placeholder: "e.g., Monday - Friday: 9:00 AM - 5:00 PM",
      hint: "Specify when the office is open for visitors",
    },
    {
      key: "map_link",
      label: "Map Link",
      icon: Map,
      required: false,
      type: "url",
      placeholder: "e.g., https://maps.google.com/...",
      hint: "Google Maps or other map service link to your location",
    },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <div className="p-2 bg-[#e8f5e8] rounded-lg">
              <MapPin className="w-6 h-6 text-[#1a4d1a]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                Office Contact Management
              </h1>
              <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                Manage office contact information
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Retry */}
          {error && (
            <div className="bg-white rounded-xl border border-[#d0e8d0] p-5">
              <button
                onClick={fetchOfficeContactData}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading Data
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] p-6">
            <h2 className="text-base font-semibold text-[#1a2e1a] mb-6">
              Contact Information
            </h2>

            <div className="space-y-6">
              {fields.map(
                ({
                  key,
                  label,
                  icon: Icon,
                  required,
                  type,
                  rows,
                  placeholder,
                  hint,
                }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#1a4d1a]" />
                        {label}{" "}
                        {required ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-[#6b8f6b] font-normal">
                            (Optional)
                          </span>
                        )}
                      </div>
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        rows={rows}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent resize-none"
                        placeholder={placeholder}
                      />
                    ) : (
                      <input
                        type={type}
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent"
                        placeholder={placeholder}
                      />
                    )}
                    <p className="text-xs text-[#6b8f6b] mt-1">{hint}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Save */}
          <div className="bg-white rounded-xl border border-[#d0e8d0] p-5">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Contact Information
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
