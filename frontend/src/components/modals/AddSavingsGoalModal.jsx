import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Calendar, Tag, DollarSign } from "lucide-react";
import { Button } from "../ui/button";

const schema = z.object({
    name: z.string().min(1, "Please provide a goal name"),
    target_amount: z.coerce.number().positive("Target amount must be a positive number"),
    target_date: z.string().min(1, "Please select a target date").refine((val) => {
        const [year, month, day] = val.split("-").map(Number);
        const selectedDateUTC = Date.UTC(year, month - 1, day);
        const today = new Date();
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        return selectedDateUTC >= todayUTC;
    }, {
        message: "Target date cannot be in the past",
    }),
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-midnight/80 backdrop-blur-sm"/>

          {/* Modal Container */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-cream/10 bg-brand-midnight-card p-8 shadow-2xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-cream/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-cream">Create Savings Goal</h3>
                <p className="text-xs text-brand-silver">Define a target to save money towards</p>
              </div>
              <button onClick={onClose} className="rounded-lg border border-brand-cream/10 p-1.5 text-brand-silver hover:text-brand-cream transition bg-brand-cream/5">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Goal Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Goal Name</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("name")} type="text" placeholder="e.g. Europe Trip, Emergency Fund" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"/>
                </div>
                {errors.name && (<p className="text-xs text-red-400">{errors.name.message}</p>)}
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Target Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("target_amount")} type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 font-mono"/>
                </div>
                {errors.target_amount && (<p className="text-xs text-red-400 font-mono">{errors.target_amount.message}</p>)}
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <input {...register("target_date")} type="date" min={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 [color-scheme:dark] font-mono"/>
                </div>
                {errors.target_date && (<p className="text-xs text-red-400 font-mono">{errors.target_date.message}</p>)}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver/50"/>
                  <select {...register("category")} className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 pl-11 pr-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10 [color-scheme:dark] appearance-none">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat} className="bg-brand-midnight text-brand-cream">
                        {cat}
                      </option>))}
                  </select>
                </div>
                {errors.category && (<p className="text-xs text-red-400">{errors.category.message}</p>)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-5 rounded-lg border border-brand-cream/10 bg-transparent text-brand-silver hover:bg-brand-cream/5 hover:text-brand-cream">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-5 rounded-lg font-bold bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight">
                  {isSubmitting ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
