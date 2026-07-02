import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar, Percent, Landmark } from "lucide-react";
import { Button } from "../ui/button";
const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    principal: z.coerce.number().positive("Principal must be a positive number"),
    rate: z.coerce.number().positive("Interest rate must be a positive number"),
    tenure_months: z.coerce.number().int().positive("Tenure must be a positive integer in months"),
    start_date: z.string().min(1, "Please select a start date"),
});
export function AddLoanModal({ isOpen, onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            start_date: new Date().toISOString().split("T")[0],
        },
    });
    const onSubmit = async (data) => {
        try {
            await onSuccess(data);
            reset();
            onClose();
        }
        catch (err) {
            console.error("Failed to add loan:", err);
        }
    };
    return (<AnimatePresence>
      {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none"/>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Add Loan</h3>
                <p className="text-sm text-slate-400">Track and calculate a new liability</p>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 p-1.5 text-slate-400 hover:text-white transition bg-white/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Loan Name */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Loan Name</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("name")} type="text" placeholder="e.g. Student Loan, Auto Mortgage" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.name && (<p className="text-xs text-red-400">{errors.name.message}</p>)}
              </div>

              {/* Principal Amount */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Principal Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("principal")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.principal && (<p className="text-xs text-red-400">{errors.principal.message}</p>)}
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Interest Rate (Annual %)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("rate")} type="number" step="0.01" placeholder="e.g. 5.25" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.rate && (<p className="text-xs text-red-400">{errors.rate.message}</p>)}
              </div>

              {/* Tenure Months */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Tenure (in months)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("tenure_months")} type="number" placeholder="e.g. 120" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {errors.tenure_months && (<p className="text-xs text-red-400">{errors.tenure_months.message}</p>)}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...register("start_date")} type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 [color-scheme:dark]"/>
                </div>
                {errors.start_date && (<p className="text-xs text-red-400">{errors.start_date.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} className="flex-1 py-5 rounded-xl border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-xl font-semibold bg-violet-600 hover:bg-violet-700 text-white">
                  {isSubmitting ? "Adding..." : "Add Loan"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
