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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-midnight/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-cream/10 bg-brand-midnight-card p-8 shadow-2xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-cream/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-cream">Add Loan</h3>
                <p className="text-xs text-brand-silver">Track and calculate a new liability</p>
              </div>
              <button onClick={onClose} className="rounded-lg border border-brand-cream/10 p-1.5 text-brand-silver hover:text-brand-cream transition bg-brand-cream/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Loan Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Loan Name</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("name")} type="text" placeholder="e.g. Student Loan, Auto Mortgage" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"/>
                </div>
                {errors.name && (<p className="text-xs text-red-400">{errors.name.message}</p>)}
              </div>

              {/* Principal Amount */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Principal Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("principal")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 font-mono"/>
                </div>
                {errors.principal && (<p className="text-xs text-red-400 font-mono">{errors.principal.message}</p>)}
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Interest Rate (Annual %)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("rate")} type="number" step="0.01" placeholder="e.g. 5.25" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 font-mono"/>
                </div>
                {errors.rate && (<p className="text-xs text-red-400 font-mono">{errors.rate.message}</p>)}
              </div>

              {/* Tenure Months */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Tenure (in months)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("tenure_months")} type="number" placeholder="e.g. 120" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 font-mono"/>
                </div>
                {errors.tenure_months && (<p className="text-xs text-red-400 font-mono">{errors.tenure_months.message}</p>)}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("start_date")} type="date" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 [color-scheme:dark] font-mono"/>
                </div>
                {errors.start_date && (<p className="text-xs text-red-400 font-mono">{errors.start_date.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-5 rounded-lg border border-brand-cream/10 bg-transparent text-brand-silver hover:bg-brand-cream/5 hover:text-brand-cream">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-lg font-bold bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight">
                  {isSubmitting ? "Adding..." : "Add Loan"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
