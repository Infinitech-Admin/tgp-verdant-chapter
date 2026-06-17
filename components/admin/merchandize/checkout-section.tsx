// components/admin/merchandize/checkout-section.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  FileText,
  Hash,
  Banknote,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItem {
  id: number
  name: string
  description?: string
  category?: string
  price: number
  stock: number
  image_url?: string
  quantity: number
  subtotal: number
}

interface UserInfo {
  id: number
  name: string
  email: string
  phone_number?: string
  address?: string
  fraternity_number?: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

interface PaymentMethod {
  id: string
  name: string
  accountName?: string
  accountNumber?: string
  instructions: string
  requiresProof: boolean
}

export default function CheckoutSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState("")
  const [notes, setNotes] = useState("")

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  // Payment methods with COD added
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Cash on Delivery",
      instructions: "Pay with cash when your order is delivered. Please prepare the exact amount if possible.",
      requiresProof: false,
    },
    {
      id: "gcash",
      name: "GCash",
      accountName: "Justin De Castro",
      accountNumber: "09456754591",
      instructions: "Send payment to the GCash number above and upload proof of payment.",
      requiresProof: true,
    },
    {
      id: "paymaya",
      name: "PayMaya",
      accountName: "Justin De Castro",
      accountNumber: "09456754591",
      instructions: "Send payment to the PayMaya number above and upload proof of payment.",
      requiresProof: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      accountName: "Juan Dela Cruz",
      accountNumber: "1234-5678-9012",
      instructions: "Transfer to Security Bank Account Number above and upload proof of payment.",
      requiresProof: true,
    },
  ]

  // Fetch user information using the new endpoint
  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/account", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUserInfo(data.data.user)
        return true
      } else {
        if (response.status === 401) {
          setError("Please log in to continue")
          setTimeout(() => router.push("/login"), 2000)
        } else {
          setError("Failed to load user information")
        }
        return false
      }
    } catch (err: any) {
      console.error("Error fetching user info:", err)
      setError("Failed to load user information")
      return false
    }
  }

  // Fetch selected cart items
  const fetchCheckoutItems = async () => {
    try {
      // Get selected item IDs from sessionStorage
      const selectedItemsJson = sessionStorage.getItem('checkoutItems')
      if (!selectedItemsJson) {
        setError("No items selected for checkout")
        setTimeout(() => router.push("/products/cart"), 2000)
        return false
      }

      const selectedItemIds: number[] = JSON.parse(selectedItemsJson)
      if (selectedItemIds.length === 0) {
        setError("No items selected for checkout")
        setTimeout(() => router.push("/products/cart"), 2000)
        return false
      }

      // Fetch all cart items
      const cartResponse = await fetch("/api/users/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const cartData = await cartResponse.json()

      if (!cartResponse.ok || !cartData.success) {
        throw new Error("Failed to fetch cart items")
      }

      // Filter only selected items
      const allCartItems: CartItem[] = cartData.data || []
      const selectedCartItems = allCartItems.filter(item =>
        selectedItemIds.includes(item.id)
      )

      if (selectedCartItems.length === 0) {
        setError("Selected items not found in cart")
        setTimeout(() => router.push("/cart"), 2000)
        return false
      }

      setCheckoutItems(selectedCartItems)
      return true
    } catch (err: any) {
      console.error("Error fetching checkout items:", err)
      setError(err.message || "Failed to load checkout items")
      return false
    }
  }

  // Initialize checkout
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true)

        // Fetch user info and checkout items in parallel
        const [userSuccess, itemsSuccess] = await Promise.all([
          fetchUserInfo(),
          fetchCheckoutItems()
        ])

        if (!userSuccess || !itemsSuccess) {
          // Errors are already set in the respective functions
          return
        }
      } catch (err: any) {
        console.error("Error initializing checkout:", err)
        setError(err.message || "Failed to load checkout information")
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }

      setProofOfPayment(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      setError(null)
    }
  }

  const removeProofOfPayment = () => {
    setProofOfPayment(null)
    setProofPreview("")
  }

  const getTotalPrice = () => {
    return checkoutItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod)
  }

  const handleSubmitOrder = async () => {
    try {
      // Validation
      if (!selectedPaymentMethod) {
        setError("Please select a payment method")
        return
      }

      const selectedMethod = getSelectedPaymentMethod()
      
      // Only require proof of payment for non-COD methods
      if (selectedMethod?.requiresProof && !proofOfPayment) {
        setError("Please upload proof of payment")
        return
      }

      if (checkoutItems.length === 0) {
        setError("No items to checkout")
        return
      }

      setSubmitting(true)
      setError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("payment_method", selectedPaymentMethod)
      
      // Only append proof of payment if it exists
      if (proofOfPayment) {
        formData.append("proof_of_payment", proofOfPayment)
      }
      
      formData.append("notes", notes)
      formData.append("total_amount", getTotalPrice().toString())
      formData.append("items", JSON.stringify(checkoutItems))

      const response = await fetch("/api/users/orders", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        // Clear sessionStorage
        sessionStorage.removeItem('checkoutItems')
        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          router.push(`/orders`)
        }, 2000)
      } else {
        setError(data.message || "Failed to submit order")
      }
    } catch (err: any) {
      console.error("Error submitting order:", err)
      setError(err.message || "Failed to submit order")
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`
  }

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }
    if (imageUrl.startsWith("/")) {
      return `${IMAGE_URL}${imageUrl}`
    }
    return `${IMAGE_URL}/${imageUrl}`
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </section>
    )
  }

  if (success) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll review your payment and process your order soon.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700"></div>
            <span>Redirecting to order details...</span>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/products/cart")}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-700" />
                Delivery Information
              </h2>

              {userInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <p className="mt-1 text-gray-900">{userInfo.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">{userInfo.email}</p>
                  </div>

                  {userInfo.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <p className="mt-1 text-gray-900">{userInfo.phone_number}</p>
                    </div>
                  )}

                  {userInfo.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="mt-1 text-gray-900">{userInfo.address}</p>
                    </div>
                  )}

                  {userInfo.fraternity_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Fraternity Number
                      </label>
                      <p className="mt-1 text-gray-900">{userInfo.fraternity_number}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-700" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "border-orange-700 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {method.id === "cod" && <Banknote className="w-5 h-5 text-green-600" />}
                          {method.id === "gcash" && <CreditCard className="w-5 h-5 text-blue-600" />}
                          {method.id === "paymaya" && <CreditCard className="w-5 h-5 text-green-600" />}
                          {method.id === "bank_transfer" && <CreditCard className="w-5 h-5 text-purple-600" />}
                          <p className="font-semibold text-gray-900">{method.name}</p>
                        </div>
                        {method.accountName && method.accountNumber && (
                          <p className="text-sm text-gray-600 mt-1">
                            {method.accountName} - {method.accountNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedPaymentMethod === method.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-gray-200"
                      >
                        <p className="text-sm text-gray-600">{method.instructions}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Proof of Payment - Only show if payment method requires it */}
            {getSelectedPaymentMethod()?.requiresProof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-700" />
                  Proof of Payment
                </h2>

                {proofPreview ? (
                  <div className="relative">
                    <img
                      src={proofPreview}
                      alt="Proof of payment"
                      className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      onClick={removeProofOfPayment}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </motion.div>
            )}

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-700" />
                Order Notes (Optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Any special instructions or notes for your order..."
              />
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <p className="text-sm font-semibold text-orange-700">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal ({checkoutItems.length} items)</span>
                  <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm">TBD</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-orange-700">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting || !selectedPaymentMethod || (getSelectedPaymentMethod()?.requiresProof && !proofOfPayment)}
                className="w-full mt-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}