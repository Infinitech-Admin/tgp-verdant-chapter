"use client";

import { useState, useEffect, JSX } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  X,
  Send,
  User,
  Calendar,
  MessageSquare,
  Contact,
} from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
  updated_at: string;
  replies?: ContactReply[];
}

interface ContactReply {
  id: number;
  contact_id: number;
  admin_id: number;
  message: string;
  sent_at: string;
  created_at: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminContactMessagesPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { toast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchMessages();
    }
  }, [authLoading, user, pagination.current_page, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/contact/admin?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMessages(data.data.data || []);
          setPagination({
            current_page: data.data.current_page || 1,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0,
            from: data.data.from || 0,
            to: data.data.to || 0,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch contact messages.",
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact messages.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    setReplyMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
    setReplyMessage("");
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reply message.",
      });
      return;
    }

    try {
      setIsSendingReply(true);

      const response = await fetch(
        `/api/contact/admin/${selectedMessage.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: replyMessage,
            recipientEmail: selectedMessage.email,
            recipientName: selectedMessage.name,
            originalSubject: selectedMessage.subject,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({ title: "Success", description: "Reply sent successfully!" });
        setReplyMessage("");
        closeModal();
        fetchMessages();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to send reply.",
        });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply.",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchMessages();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unread: "bg-[#fdf3e7] text-[#7a5c0a]",
      read: "bg-[#e8f5e8] text-[#1a4d1a]",
      replied: "bg-[#f2faf2] text-[#2d7a2d]",
    };
    const icons: Record<string, JSX.Element> = {
      unread: <Clock className="w-3 h-3" />,
      read: <Eye className="w-3 h-3" />,
      replied: <CheckCircle className="w-3 h-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? styles.read}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2faf2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
          <p className="mt-4 text-[#6b8f6b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e8f5e8] rounded-lg">
                  <Mail className="w-6 h-6 text-[#1a4d1a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2e1a]">
                    Contact Management
                  </h1>
                  <p className="text-sm text-[#6b8f6b]">
                    Manage and review contact messages
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#3d5c3d]">
                <Contact className="w-5 h-5 text-[#1a4d1a]" />
                <span className="font-medium">{pagination.total} Total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-3 gap-4 sm:hidden">
            {[
              {
                label: "Unread",
                value: messages.filter((m) => m.status === "unread").length,
                color: "text-[#d4a017]",
              },
              {
                label: "Read",
                value: messages.filter((m) => m.status === "read").length,
                color: "text-[#1a4d1a]",
              },
              {
                label: "Replied",
                value: messages.filter((m) => m.status === "replied").length,
                color: "text-[#2d7a2d]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white p-4 rounded-lg border border-[#d0e8d0] text-center"
              >
                <p className="text-xs text-[#6b8f6b] mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#d0e8d0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d1a] mx-auto" />
                  <p className="mt-4 text-[#6b8f6b]">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-[#a8d4a8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1a2e1a] mb-2">
                  No messages found
                </h3>
                <p className="text-[#6b8f6b]">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f2faf2] border-b border-[#d0e8d0]">
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Subject",
                          "Message",
                          "Status",
                          "Date",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8f5e8]">
                      {messages.map((message) => (
                        <tr
                          key={message.id}
                          className="hover:bg-[#f9fdf9] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="max-w-[150px] truncate text-sm font-medium text-[#1a2e1a]"
                              title={message.name}
                            >
                              {message.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="max-w-[180px] truncate text-sm text-[#6b8f6b]"
                              title={message.email}
                            >
                              {message.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="max-w-[200px] truncate text-sm text-[#1a2e1a]"
                              title={message.subject}
                            >
                              {message.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="max-w-[250px] truncate text-sm text-[#6b8f6b]"
                              title={message.message}
                            >
                              {message.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(message.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b8f6b]">
                            {formatDate(message.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleViewMessage(message)}
                              className="p-1.5 text-[#1a4d1a] hover:bg-[#e8f5e8] rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Scroll hint on mobile */}
                <div className="lg:hidden bg-[#f2faf2] border-t border-[#d0e8d0] px-4 py-2 text-center">
                  <p className="text-xs text-[#6b8f6b] flex items-center justify-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                    Swipe left to see more
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </p>
                </div>

                {/* Pagination */}
                {!loading && messages.length > 0 && (
                  <div className="px-6 py-4 border-t border-[#d0e8d0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-[#6b8f6b]">
                      Showing {pagination.from} to {pagination.to} of{" "}
                      {pagination.total} results
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                        className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#1a4d1a]" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.last_page) },
                          (_, i) => {
                            let pageNum = i + 1;
                            if (pagination.last_page > 5) {
                              if (pagination.current_page <= 3) pageNum = i + 1;
                              else if (
                                pagination.current_page >=
                                pagination.last_page - 2
                              )
                                pageNum = pagination.last_page - 4 + i;
                              else pageNum = pagination.current_page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                  pagination.current_page === pageNum
                                    ? "bg-[#1a4d1a] text-white"
                                    : "border border-[#c8e6c8] text-[#3d5c3d] hover:bg-[#f2faf2]"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                        className="p-2 border border-[#c8e6c8] rounded-lg hover:bg-[#f2faf2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-[#1a4d1a]" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border border-[#d0e8d0]">
              {/* Modal Header */}
              <div className="border-b border-[#d0e8d0] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#f2faf2] rounded-t-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-[#e8f5e8] rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#1a4d1a]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-[#1a2e1a] truncate">
                      Contact Message
                    </h2>
                    <p className="text-xs text-[#6b8f6b] mt-0.5">
                      Message #{selectedMessage.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-[#d0e8d0] rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-[#6b8f6b]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1 overscroll-contain">
                <div className="space-y-6 pb-4">
                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                    <span className="text-sm font-medium text-[#3d5c3d]">
                      Status
                    </span>
                    {getStatusBadge(selectedMessage.status)}
                  </div>

                  {/* Sender Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#1a2e1a] mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4d1a]" />
                      Sender Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> Name
                        </label>
                        <p className="text-sm text-[#1a2e1a] font-medium break-words">
                          {selectedMessage.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </label>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-sm text-[#1a4d1a] hover:text-[#2d7a2d] font-medium break-all underline underline-offset-2"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#1a2e1a] mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4d1a]" />
                      Message
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Subject
                        </label>
                        <p className="text-sm text-[#1a2e1a] font-semibold break-words">
                          {selectedMessage.subject}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                          Message
                        </label>
                        <div className="p-4 bg-[#f2faf2] border border-[#d0e8d0] rounded-lg">
                          <p className="text-sm text-[#1a2e1a] break-words whitespace-pre-wrap">
                            {selectedMessage.message}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Received
                        </label>
                        <p className="text-sm text-[#1a2e1a]">
                          {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Previous Replies */}
                  {selectedMessage.replies &&
                    selectedMessage.replies.length > 0 && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#1a2e1a] mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4d1a]" />
                          Previous Replies
                        </h3>
                        <div className="space-y-3">
                          {selectedMessage.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-[#e8f5e8] border border-[#c8e6c8] rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a4d1a] text-white rounded-full text-sm font-semibold">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Admin — {reply.admin.name}
                                </span>
                                <p className="text-xs text-[#6b8f6b]">
                                  {formatDate(reply.sent_at)}
                                </p>
                              </div>
                              <p className="text-sm text-[#1a2e1a] whitespace-pre-wrap">
                                {reply.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Reply Form */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#1a2e1a] mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4d1a]" />
                      Send Reply
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold text-[#6b8f6b] uppercase tracking-wide mb-1">
                        Your Reply
                      </label>
                      <textarea
                        rows={6}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-[#c8e6c8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] resize-none"
                        placeholder="Type your reply here..."
                        disabled={isSendingReply}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#d0e8d0] px-4 sm:px-6 py-3 bg-white rounded-b-xl flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    onClick={closeModal}
                    disabled={isSendingReply}
                    className="w-full sm:w-auto px-4 py-2.5 border border-[#c8e6c8] rounded-lg text-[#3d5c3d] hover:bg-[#f2faf2] transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#1a4d1a] text-white rounded-lg hover:bg-[#2d7a2d] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingReply ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
