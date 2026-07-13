"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { HERO_MAGIC_DEFAULTS, toBooleanSetting, toNumberSetting } from "@/lib/hero-magic-settings"

const MagicRings = dynamic(() => import("@/components/effects/MagicRings"), { ssr: false })

type Key = keyof typeof HERO_MAGIC_DEFAULTS

type NumberField = {
  key: Key
  label: string
  min?: number
  max?: number
  step?: number
}

const numberFields: NumberField[] = [
  { key: "hero.magic.ringCount", label: "Ring Count", min: 1, max: 10, step: 1 },
  { key: "hero.magic.speed", label: "Speed", min: 0, max: 3, step: 0.05 },
  { key: "hero.magic.attenuation", label: "Attenuation", min: 1, max: 20, step: 0.1 },
  { key: "hero.magic.lineThickness", label: "Line Thickness", min: 0.1, max: 8, step: 0.1 },
  { key: "hero.magic.baseRadius", label: "Base Radius", min: 0.05, max: 1, step: 0.01 },
  { key: "hero.magic.radiusStep", label: "Radius Step", min: 0, max: 0.5, step: 0.01 },
  { key: "hero.magic.scaleRate", label: "Scale Rate", min: 0, max: 0.7, step: 0.01 },
  { key: "hero.magic.opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
  { key: "hero.magic.blur", label: "Blur", min: 0, max: 20, step: 0.1 },
  { key: "hero.magic.noiseAmount", label: "Noise Amount", min: 0, max: 0.5, step: 0.01 },
  { key: "hero.magic.rotation", label: "Rotation", min: -180, max: 180, step: 1 },
  { key: "hero.magic.ringGap", label: "Ring Gap", min: 0.5, max: 4, step: 0.05 },
  { key: "hero.magic.fadeIn", label: "Fade In", min: 0, max: 2, step: 0.05 },
  { key: "hero.magic.fadeOut", label: "Fade Out", min: 0, max: 2, step: 0.05 },
  { key: "hero.magic.mouseInfluence", label: "Mouse Influence", min: 0, max: 1, step: 0.01 },
  { key: "hero.magic.hoverScale", label: "Hover Scale", min: 1, max: 2, step: 0.01 },
  { key: "hero.magic.parallax", label: "Parallax", min: 0, max: 0.3, step: 0.01 },
]

function Control({ field, settings, setSettings }: {
  field: NumberField
  settings: Record<Key, string>
  setSettings: React.Dispatch<React.SetStateAction<Record<Key, string>>>
}) {
  const value = settings[field.key]
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        <Input
          type="number"
          className="h-7 w-20 text-xs"
          value={value}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) => setSettings((prev) => ({ ...prev, [field.key]: event.target.value }))}
        />
      </div>
      <Input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => setSettings((prev) => ({ ...prev, [field.key]: event.target.value }))}
      />
    </div>
  )
}

export function HeroMagicRingsSettings() {
  const [settings, setSettings] = React.useState<Record<Key, string>>({ ...HERO_MAGIC_DEFAULTS })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "settings_load_failed")
      setSettings({ ...HERO_MAGIC_DEFAULTS, ...data })
    } catch (error: any) {
      toast.error(error?.message || "خطا در دریافت تنظیمات هیرو")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "settings_save_failed")
      toast.success("تنظیمات پس‌زمینه هیرو ذخیره شد")
    } catch (error: any) {
      toast.error(error?.message || "خطا در ذخیره تنظیمات هیرو")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>پس‌زمینه Magic Rings هیرو</CardTitle>
        <CardDescription>این تنظیمات در دیتابیس ذخیره می‌شوند و در صفحه اصلی اعمال می‌شوند.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <Label className="mb-2 block text-xs text-muted-foreground">Example</Label>
              <Select value={settings["hero.magic.example"]} onValueChange={(value) => setSettings((prev) => ({ ...prev, "hero.magic.example": value || "Basic" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Soft">Soft</SelectItem>
                  <SelectItem value="Bright">Bright</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {["hero.magic.color", "hero.magic.colorTwo"].map((key) => (
              <div key={key} className="rounded-lg border bg-muted/30 p-3">
                <Label className="mb-2 block text-xs text-muted-foreground">{key === "hero.magic.color" ? "Color" : "Color Two"}</Label>
                <div className="flex gap-2">
                  <Input type="color" className="h-9 w-14 p-1" value={settings[key as Key]} onChange={(event) => setSettings((prev) => ({ ...prev, [key]: event.target.value }))} />
                  <Input dir="ltr" value={settings[key as Key]} onChange={(event) => setSettings((prev) => ({ ...prev, [key]: event.target.value }))} />
                </div>
              </div>
            ))}
            {numberFields.map((field) => <Control key={field.key} field={field} settings={settings} setSettings={setSettings} />)}
            {["hero.magic.followMouse", "hero.magic.clickBurst"].map((key) => (
              <div key={key} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <Label className="text-xs text-muted-foreground">{key === "hero.magic.followMouse" ? "Follow Mouse" : "Click Burst"}</Label>
                <Switch
                  checked={settings[key as Key] === "true"}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [key]: checked ? "true" : "false" }))}
                />
              </div>
            ))}
          </div>
          <div className="sticky top-24 h-80 overflow-hidden rounded-xl border bg-background">
            <MagicRings
              color={settings["hero.magic.color"]}
              colorTwo={settings["hero.magic.colorTwo"]}
              speed={toNumberSetting(settings, "hero.magic.speed")}
              ringCount={toNumberSetting(settings, "hero.magic.ringCount")}
              attenuation={toNumberSetting(settings, "hero.magic.attenuation")}
              lineThickness={toNumberSetting(settings, "hero.magic.lineThickness")}
              baseRadius={toNumberSetting(settings, "hero.magic.baseRadius")}
              radiusStep={toNumberSetting(settings, "hero.magic.radiusStep")}
              scaleRate={toNumberSetting(settings, "hero.magic.scaleRate")}
              opacity={toNumberSetting(settings, "hero.magic.opacity")}
              blur={toNumberSetting(settings, "hero.magic.blur")}
              noiseAmount={toNumberSetting(settings, "hero.magic.noiseAmount")}
              rotation={toNumberSetting(settings, "hero.magic.rotation")}
              ringGap={toNumberSetting(settings, "hero.magic.ringGap")}
              fadeIn={toNumberSetting(settings, "hero.magic.fadeIn")}
              fadeOut={toNumberSetting(settings, "hero.magic.fadeOut")}
              followMouse={toBooleanSetting(settings, "hero.magic.followMouse")}
              mouseInfluence={toNumberSetting(settings, "hero.magic.mouseInfluence")}
              hoverScale={toNumberSetting(settings, "hero.magic.hoverScale")}
              parallax={toNumberSetting(settings, "hero.magic.parallax")}
              clickBurst={toBooleanSetting(settings, "hero.magic.clickBurst")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>بازنشانی</Button>
          <Button type="button" onClick={save} loading={saving} disabled={loading || saving}>ذخیره تنظیمات هیرو</Button>
        </div>
      </CardContent>
    </Card>
  )
}
