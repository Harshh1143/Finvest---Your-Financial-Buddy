import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { Button } from "../ui/button";
const schema = z.object({
    amount: z.coerce.number().positive("Amount must be a positive number"),
    type: z.enum(["income", "expense"]),
    category: z.string().min(1, "Please select or type a category"),
    description: z.string().min(1, "Please provide a description"),
    date: z.string().min(1, "Please select a date"),
});
const POPULAR_CATEGORIES = [
    "Salary",
    "Housing",
    "Food",
    "Utilities",
    "Shopping",
    "Travel",
    "Entertainment",
    "Investments",
    "Others",
];
export function AddTransactionModal({ isOpen, onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "expense",
            date: new Date().toISOString().split("T")[0],
        },
    });
    const onSubmit = async (data) => {
        try {
            await onSuccess(data);
            reset();
            onClose();
        }
        catch (err) {
            console.error("Failed to add transaction:", err);
        }
    };
    return (<AnimatePresence>
      {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none"/>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Add transaction</h3>
                <p className="text-sm text-slate-400">Record a new financial transaction</p>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 p-1.5 text-slate-400 hover:text-white transition bg-white/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border border-white/5 bg-slate-950/50">
                <label className="cursor-pointer">
                  <input {...register("type")} type="radio" value="expense" className="sr-only peer"/>
                  <div className="py-2.5 text-center text-sm font-semibold rounded-xl text-slate-400 transition peer-checked:bg-white/10 peer-checked:text-white">
                    Expense
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input {...register("type")} type="radio" value="income" className="sr-only peer"/>
                  <div className="py-2.5 text-center text-sm font-semibold rounded-xl text-slate-400 transition peer-checked:bg-cyan-500/10 peer-checked:text-cyan-300 peer-checked:border peer-checked:border-cyan-500/20">
                    Income
                  </div>
                </label>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("amount")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.amount && (<p className="text-xs text-red-400">{errors.amount.message}</p>)}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("date")} type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 [color-scheme:dark]"/>
                </div>
                {errors.date && (<p className="text-xs text-red-400">{errors.date.message}</p>)}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <select {...register("category")} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:bg-white/10 [color-scheme:dark] appearance-none">
                    <option value="" disabled>Select category</option>
                    {POPULAR_CATEGORIES.map((cat) => (<option key={cat} value={cat}>
                        {cat}
                      </option>))}
                  </select>
                </div>
                {errors.category && (<p className="text-xs text-red-400">{errors.category.message}</p>)}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-500"/>
                  <textarea {...register("description")} placeholder="Describe transaction details..." rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 resize-none"/>
                </div>
                {errors.description && (<p className="text-xs text-red-400">{errors.description.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} className="flex-1 py-5 rounded-xl border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-600 text-slate-950">
                  {isSubmitting ? "Adding..." : "Add transaction"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
