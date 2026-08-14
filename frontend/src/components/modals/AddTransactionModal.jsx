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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-midnight/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-cream/10 bg-brand-midnight-card p-8 shadow-2xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-cream/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-cream">Add transaction</h3>
                <p className="text-xs text-brand-silver">Record a new financial transaction</p>
              </div>
              <button onClick={onClose} className="rounded-lg border border-brand-cream/10 p-1.5 text-brand-silver hover:text-brand-cream transition bg-brand-cream/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border border-brand-cream/5 bg-brand-midnight">
                <label className="cursor-pointer">
                  <input {...register("type")} type="radio" value="expense" className="sr-only peer"/>
                  <div className="py-2.5 text-center text-xs font-bold rounded-lg text-brand-silver transition peer-checked:bg-brand-cream/5 peer-checked:text-brand-cream">
                    Expense
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input {...register("type")} type="radio" value="income" className="sr-only peer"/>
                  <div className="py-2.5 text-center text-xs font-bold rounded-lg text-brand-silver transition peer-checked:bg-brand-cobalt peer-checked:text-brand-cream">
                    Income
                  </div>
                </label>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("amount")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 font-mono"/>
                </div>
                {errors.amount && (<p className="text-xs text-red-400 font-mono">{errors.amount.message}</p>)}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("date")} type="date" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 [color-scheme:dark] font-mono"/>
                </div>
                {errors.date && (<p className="text-xs text-red-400 font-mono">{errors.date.message}</p>)}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <select {...register("category")} className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 [color-scheme:dark] appearance-none">
                    <option value="" disabled className="bg-brand-midnight text-brand-cream">Select category</option>
                    {POPULAR_CATEGORIES.map((cat) => (<option key={cat} value={cat} className="bg-brand-midnight text-brand-cream">
                        {cat}
                      </option>))}
                  </select>
                </div>
                {errors.category && (<p className="text-xs text-red-400">{errors.category.message}</p>)}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-brand-silver/50"/>
                  <textarea {...register("description")} placeholder="Describe transaction details..." rows={3} className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 resize-none"/>
                </div>
                {errors.description && (<p className="text-xs text-red-400">{errors.description.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-5 rounded-lg border border-brand-cream/10 bg-transparent text-brand-silver hover:bg-brand-cream/5 hover:text-brand-cream">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-lg font-bold bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight">
                  {isSubmitting ? "Adding..." : "Add transaction"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
