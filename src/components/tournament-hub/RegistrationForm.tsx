"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 
from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"]

export function RegistrationForm({ seasonId }: { seasonId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")
  const {
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema) })

  const onSubmit = async (data: RegistrationInput) => {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, photoUrl, seasonId }),
    })
    if (res.ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
        <CheckCircle2 className="h-16 w-16 mx-auto text-pitch mb-4" />
        <h2 className="text-xl font-bold">Registration submitted</h2>
        <p className="text-muted-foreground mt-2">An admin will review and confirm your spot shortly.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-5">
      <div className="flex justify-center">
        <ImageUploader bucket="player-photos" value={photoUrl} onChange={setPhotoUrl} />
      </div>

      <div>
        <label className="text-sm font-medium">Full name</label>
        <Input {...register("playerName")} placeholder="e.g. Rahim Uddin" />
        {errors.playerName && <p className="text-xs text-danger mt-1">{errors.playerName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Position</label>
          {/* FIX APPLIED HERE: Added { shouldValidate: true } */}
          <Select onValueChange={(v) => setValue("position", v, { shouldValidate: true })}>
            <SelectTrigger className={errors.position ? "border-danger" : ""}>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.position && <p className="text-xs text-danger mt-1">{errors.position.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Jersey number</label>
          <Input type="number" {...register("jerseyNumber")} placeholder="e.g. 10" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">District</label>
        <Input {...register("district")} placeholder="e.g. Dhaka" />
        {errors.district && <p className="text-xs text-danger mt-1">{errors.district.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-pitch hover:bg-pitch-dark text-white">
        {isSubmitting ? "Submitting..." : "Submit registration"}
      </Button>
    </form>
  )
}