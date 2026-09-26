import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Banknote } from "lucide-react";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import { getExpenses } from "../../api/expenseApi";
import { listCategories } from "../../api/categoryApi";
import { formatAmount } from "../../utils/formatAmount";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500";
const PERIODS = ["all", "day", "week", "month", "custom"];

function CashExpensesPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);

  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const cashAccount = useMemo(
    () => accounts.find((account) => account.type === "cash" && !account.isArchived),
    [accounts]
  );
  const cashAccountId = cashAccount?._id;

  useEffect(() => {
    dispatch(fetchAccounts());
    listCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (!cashAccountId) return;
    if (period === "custom" && (!startDate || !endDate || startDate > endDate)) return;

    const params = { account: cashAccountId };
    if (period !== "all") params.period = period;
    if (period === "custom") {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    if (category !== "all") params.category = category;

    let cancelled = false;
    getExpenses(params)
      .then((res) => {
        if (!cancelled) setExpenses(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setExpenses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cashAccountId, period, startDate, endDate, category]);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <Banknote className="text-brand-600" size={25} />
            {t("cash.expenses.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("cash.expenses.subtitle")}</p>
        </div>
        <Link to="/cash" className="font-semibold text-brand-700 hover:underline">
          {t("cash.expenses.back")}
        </Link>
      </div>

      {!cashAccount ? (
        <p className="rounded-2xl bg-white p-5 text-slate-500 shadow-sm ring-1 ring-slate-100">
          {t("cash.expenses.noCashAccount")}
        </p>
      ) : (
        <>
          <div className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("cash.expenses.period")}
              <select value={period} onChange={(event) => setPeriod(event.target.value)} className={inputClass}>
                {PERIODS.map((key) => (
                  <option key={key} value={key}>
                    {t(`expenses.filters.period.${key}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("cash.expenses.category")}
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                <option value="all">{t("cash.expenses.allCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            {period === "custom" && (
              <>
                <label className="text-sm font-semibold text-slate-700">
                  {t("expenses.filters.startDate")}
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  {t("expenses.filters.endDate")}
                  <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClass} />
                </label>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">{t("cash.expenses.total")}</p>
            <p className="tabular-amount mt-1 text-3xl font-extrabold text-expense">{formatAmount(total)} EGP</p>
          </div>

          <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">{t("cash.expenses.loading")}</p>
            ) : expenses.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">{t("cash.expenses.empty")}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <li key={expense._id} className="flex items-center justify-between gap-3 px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{expense.description}</p>
                      <p className="text-xs text-slate-500">
                        {expense.category} · {new Date(expense.date).toLocaleDateString(i18n.language)}
                      </p>
                    </div>
                    <span className="tabular-amount shrink-0 font-bold text-expense">
                      {formatAmount(expense.amount)} {expense.currency || "EGP"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CashExpensesPage;
