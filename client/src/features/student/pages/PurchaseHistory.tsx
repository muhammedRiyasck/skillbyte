import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { getStudentPurchases } from '../../enrollment/services/EnrollmentService';
import Spiner from '@shared/ui/Spiner';
import { ReceiptText, Calendar, CreditCard, BookOpen, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '@/shared/ui';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { DateRange } from '@shared/enums/DateRange';
import { ROUTES } from '@core/router/paths';

interface Purchase {
  id: string;
  productName: string;
  productImage?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  courseId?: string;
  mentorshipBookingId?: string;
}

const PurchaseHistory: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateRange | 'all'>('all');

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (dateFilter !== 'all') filters.dateRange = dateFilter;

      const data = await getStudentPurchases(page, itemsPerPage, filters);
      setPurchases(data?.data?.data || []);
      setTotalCount(data?.data?.totalCount || 0);
    } catch {
      console.error('Failed to load purchase history');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, dateFilter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading && purchases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Spiner />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 pb-10 text-gray-900 dark:bg-[#050914] dark:text-white">
    {/* =========================================================
        HEADER
    ========================================================= */}
    <div className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl dark:border-gray-800/80 dark:bg-[#050914]/95">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          <motion.div
            className="flex min-w-0 items-center gap-3"
          >
          

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Investments
              </p>

              <motion.h1 initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }} className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              tracking-tight
              text-gray-950
              dark:text-white
              flex
              items-center
              gap-3
            ">
                My Purchases
              </motion.h1>
            </div>
          </motion.div>

        </div>

        {/* =========================================================
            FILTERS
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-col gap-3 border-t border-gray-100 py-4 sm:flex-row dark:border-gray-800"
        >
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value as DateRange | "all");
              setPage(1);
            }}
            className="
              cursor-pointer
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/10
              dark:border-gray-800
              dark:bg-[#0b1220]
              dark:text-gray-300
            "
          >
            <option value="all">All Time</option>
            <option value={DateRange.THIRTY_DAYS}>
              Last 30 Days
            </option>
            <option value={DateRange.THREE_MONTHS}>
              Last 3 Months
            </option>
            <option value={DateRange.LAST_YEAR}>
              Last Year
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value as PaymentStatus | "all"
              );
              setPage(1);
            }}
            className="
              cursor-pointer
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/10
              dark:border-gray-800
              dark:bg-[#0b1220]
              dark:text-gray-300
            "
          >
            <option value="all">All Status</option>
            <option value={PaymentStatus.SUCCEEDED}>
              Succeeded
            </option>
            <option value={PaymentStatus.PENDING}>
              Pending
            </option>
            <option value={PaymentStatus.FAILED}>
              Failed
            </option>
            <option value={PaymentStatus.REFUNDED}>
              Refunded
            </option>
          </select>
        </motion.div>
      </div>
    </div>

    {/* =========================================================
        CONTENT
    ========================================================= */}
    <main className="mx-auto max-w-[1600px] px-4 pt-7 sm:px-6 lg:px-8">
      {purchases.length === 0 ? (
        /* =======================================================
           EMPTY STATE
        ======================================================= */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-6
            py-16
            text-center
            dark:border-gray-800
            dark:bg-[#0b1220]
          "
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              type: "spring",
              stiffness: 180,
            }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            <ReceiptText className="h-7 w-7" />
          </motion.div>

          <h3 className="mt-6 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
            No purchases yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            You haven't purchased any courses yet. Start
            building your learning journey today.
          </p>

          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="mt-7 inline-block"
          >
            <Link
              to="/courses"
              className="
                inline-flex
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-colors
                hover:bg-blue-700
                dark:hover:bg-blue-500
              "
            >
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* =====================================================
              DESKTOP TABLE
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              hidden
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              md:block
              dark:border-gray-800
              dark:bg-[#0b1220]
            "
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-[#101827]/70">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Course
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Order ID
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Provider
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {purchases.map((purchase, index) => (
                    <motion.tr
                      key={purchase.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.04,
                      }}
                      className="
                        group
                        transition-colors
                        hover:bg-gray-50/70
                        dark:hover:bg-[#101827]/50
                      "
                    >
                      {/* COURSE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {purchase.mentorshipBookingId &&
                          !purchase.productImage ? (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-500/10
                                text-blue-600
                                dark:text-blue-400
                              "
                            >
                              <Users className="h-5 w-5" />
                            </motion.div>
                          ) : (
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={
                                purchase.productImage ||
                                "/placeholder-course.png"
                              }
                              alt=""
                              className="
                                h-12
                                w-12
                                shrink-0
                                rounded-xl
                                bg-gray-100
                                object-cover
                                dark:bg-[#101827]
                              "
                            />
                          )}

                          <div className="min-w-0">
                            <div className="max-w-[280px] truncate font-semibold text-gray-900 dark:text-white">
                              {purchase.productName}
                            </div>

                            {purchase.mentorshipBookingId ? (
                              <span
                                className="
                                  mt-1.5
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  border
                                  border-blue-200
                                  bg-blue-50
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-semibold
                                  uppercase
                                  tracking-wider
                                  text-blue-600
                                  dark:border-blue-900/50
                                  dark:bg-blue-500/10
                                  dark:text-blue-400
                                "
                              >
                                <Users className="h-2.5 w-2.5" />
                                Mentorship
                              </span>
                            ) : (
                              <span
                                className="
                                  mt-1.5
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  border
                                  border-blue-200
                                  bg-blue-50
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-semibold
                                  uppercase
                                  tracking-wider
                                  text-blue-600
                                  dark:border-blue-900/50
                                  dark:bg-blue-500/10
                                  dark:text-blue-400
                                "
                              >
                                <BookOpen className="h-2.5 w-2.5" />
                                Course
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {formatDate(purchase.createdAt)}
                        </div>
                      </td>

                      {/* ORDER ID */}
                      <td className="px-6 py-5">
                        <span
                          className="
                            inline-flex
                            max-w-[130px]
                            truncate
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-2.5
                            py-1.5
                            font-mono
                            text-[11px]
                            text-gray-500
                            dark:border-gray-800
                            dark:bg-[#101827]
                            dark:text-gray-400
                          "
                        >
                          {purchase.stripePaymentIntentId
                            ? purchase.stripePaymentIntentId.slice(-10)
                            : purchase.paypalOrderId?.slice(-10)}
                        </span>
                      </td>

                      {/* PROVIDER */}
                      <td className="px-6 py-5">
                        <span
                          className="
                            inline-flex
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-2.5
                            py-1.5
                            font-mono
                            text-[11px]
                            text-gray-500
                            dark:border-gray-800
                            dark:bg-[#101827]
                            dark:text-gray-400
                          "
                        >
                          {purchase.stripePaymentIntentId
                            ? "Stripe"
                            : "PayPal"}
                        </span>
                      </td>

                      {/* AMOUNT */}
                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          {purchase.currency.toUpperCase()}{" "}
                          {purchase.amount.toLocaleString()}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-wide

                            ${
                              purchase.status ===
                              PaymentStatus.SUCCEEDED
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-500/10 dark:text-green-400"
                                : purchase.status ===
                                  PaymentStatus.FAILED
                                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400"
                                : purchase.status ===
                                  PaymentStatus.REFUNDED
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-500/10 dark:text-blue-400"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-500/10 dark:text-yellow-400"
                            }
                          `}
                        >
                          <span
                            className={`
                              h-1.5
                              w-1.5
                              rounded-full

                              ${
                                purchase.status ===
                                PaymentStatus.SUCCEEDED
                                  ? "bg-green-500"
                                  : purchase.status ===
                                    PaymentStatus.FAILED
                                  ? "bg-red-500"
                                  : purchase.status ===
                                    PaymentStatus.REFUNDED
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }
                            `}
                          />

                          {purchase.status.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-center">
                        {purchase.status ===
                          PaymentStatus.PENDING &&
                          purchase.courseId && (
                            <motion.div
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              className="inline-block"
                            >
                              <Link
                                to={`/checkout/${purchase.courseId}`}
                                className="
                                  inline-flex
                                  cursor-pointer
                                  items-center
                                  gap-2
                                  rounded-xl
                                  bg-blue-600
                                  px-3.5
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition-colors
                                  hover:bg-blue-700
                                  dark:hover:bg-blue-500
                                "
                              >
                                Retry Payment
                              </Link>
                            </motion.div>
                          )}

                        {purchase.status ===
                          PaymentStatus.PENDING &&
                          purchase.mentorshipBookingId && (
                            <motion.button
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() =>
                                navigate(
                                  ROUTES.student.mentorship
                                    .bookings
                                )
                              }
                              className="
                                inline-flex
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-3.5
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition-colors
                                hover:bg-blue-700
                                dark:hover:bg-blue-500
                              "
                            >
                              Continue Payment
                            </motion.button>
                          )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* =====================================================
              MOBILE CARDS
          ===================================================== */}
          <div className="space-y-4 md:hidden">
            {purchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
                whileHover={{ y: -2 }}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  dark:border-gray-800
                  dark:bg-[#0b1220]
                "
              >
                {/* TOP */}
                <div className="flex items-start gap-4">
                  {purchase.mentorshipBookingId &&
                  !purchase.productImage ? (
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-500/10
                        text-blue-600
                        dark:text-blue-400
                      "
                    >
                      <Users className="h-6 w-6" />
                    </div>
                  ) : (
                    <img
                      src={
                        purchase.productImage ||
                        "/placeholder-course.png"
                      }
                      alt=""
                      className="
                        h-14
                        w-14
                        shrink-0
                        rounded-xl
                        bg-gray-100
                        object-cover
                        dark:bg-[#101827]
                      "
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 dark:text-white">
                      {purchase.productName}
                    </h4>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(purchase.createdAt)}
                    </div>

                    <div className="mt-2">
                      {purchase.mentorshipBookingId ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          <Users className="h-2.5 w-2.5" />
                          Mentorship
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          <BookOpen className="h-2.5 w-2.5" />
                          Course
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Amount paid
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {purchase.currency.toUpperCase()}{" "}
                      {purchase.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Status
                    </p>

                    <div className="mt-1">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide

                          ${
                            purchase.status === "succeeded"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : purchase.status === "failed"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : purchase.status === "refunded"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-1.5
                            w-1.5
                            rounded-full

                            ${
                              purchase.status === "succeeded"
                                ? "bg-green-500"
                                : purchase.status === "failed"
                                ? "bg-red-500"
                                : purchase.status === "refunded"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                            }
                          `}
                        />

                        {purchase.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ORDER ID */}
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Order ID
                  </p>

                  <p className="mt-1 truncate font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {purchase.stripePaymentIntentId
                      ? purchase.stripePaymentIntentId.slice(-10)
                      : purchase.paypalOrderId?.slice(-10)}
                  </p>
                </div>

                {/* ACTION */}
                {purchase.status === PaymentStatus.PENDING &&
                  purchase.courseId && (
                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Link
                          to={`/checkout/${purchase.courseId}`}
                          className="
                            flex
                            w-full
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition-colors
                            hover:bg-blue-700
                            dark:hover:bg-blue-500
                          "
                        >
                          Retry Payment
                        </Link>
                      </motion.div>
                    </div>
                  )}

                {purchase.status === PaymentStatus.PENDING &&
                  purchase.mentorshipBookingId && (
                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          navigate(
                            ROUTES.student.mentorship.bookings
                          )
                        }
                        className="
                          flex
                          w-full
                          cursor-pointer
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition-colors
                          hover:bg-blue-700
                          dark:hover:bg-blue-500
                        "
                      >
                        Continue Payment
                      </motion.button>
                    </div>
                  )}
              </motion.div>
            ))}
          </div>

          {/* =====================================================
              PAGINATION
          ===================================================== */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="pt-2"
            >
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </motion.div>
          )}
        </div>
      )}
    </main>
  </div>
);
};

export default PurchaseHistory;
