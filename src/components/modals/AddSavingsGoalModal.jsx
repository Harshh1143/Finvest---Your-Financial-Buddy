import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Calendar, Tag, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
const schema = z.object({
    name: z.string().min(1, "Please provide a goal name"),
    target_amount: z.coerce.number().positive("Target amount must be a positive number"),
    target_date: z.string().min(1, "Please select a target date"),
    category: z.string().min(1, "Please select or type a category"),
});
const CATEGORIES = ["Emergency Fund", "Retirement", "Travel", "Vehicle", "Home", "Education", "Gadgets", "Other"];
export function AddSavingsGoalModal({ isOpen, onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            category: "Emergency Fund",
            target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
    });
    const onSubmit = async (data) => {
        try {
            await onSuccess(data);
            reset();
            onClose();
        }
        catch (err) {
            console.error("Failed to add savings goal:", err);
        }
    };
    return (<AnimatePresence>
      {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none"/>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Create Savings Goal</h3>
                <p className="text-sm text-slate-400">Define a target to save money towards</p>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 p-1.5 text-slate-400 hover:text-white transition bg-white/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Goal Name */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Goal Name</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("name")} type="text" placeholder="e.g. Europe Trip, Emergency Fund" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.name && (<p className="text-xs text-red-400">{errors.name.message}</p>)}
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Target Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("target_amount")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.target_amount && (<p className="text-xs text-red-400">{errors.target_amount.message}</p>)}
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("target_date")} type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 [color-scheme:dark]"/>
                </div>
                {errors.target_date && (<p className="text-xs text-red-400">{errors.target_date.message}</p>)}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <select {...register("category")} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:bg-white/10 [color-scheme:dark] appearance-none">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>
                        {cat}
                      </option>))}
                  </select>
                </div>
                {errors.category && (<p className="text-xs text-red-400">{errors.category.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} className="flex-1 py-5 rounded-xl border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-600 text-slate-950">
                  {isSubmitting ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
