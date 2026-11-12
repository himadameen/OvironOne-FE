import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const STEPS = [
  "Business profile",
  "Owner & contact",
  "Location",
  "Plan & billing",
  "Modules",
  "Branding",
  "Review & launch",
];

export function CreateShopWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    shopName: "",
    category: "retail",
    owner: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    plan: "starter",
    modules: { pos: true, inventory: true, painters: false, ai: true },
    color: "#0d9488",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => {
    if (step === 0 && !form.shopName.trim()) {
      toast({ variant: "destructive", title: "Shop name required" });
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      toast({
        title: "Shop created (demo)",
        description: `${form.shopName || "New shop"} added to platform list.`,
      });
      navigate("/platform/shops");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create shop"
        description="Seven-step onboarding wizard for new tenants."
      />
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <Progress value={progress} />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label>Shop name</Label>
                <Input
                  className="mt-1"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  placeholder="e.g. Salem Hardware"
                />
              </div>
              <div>
                <Label>Business category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="paint">Paint & decor</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                    <SelectItem value="leather">Leather</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <Label>Owner name</Label>
                <Input
                  className="mt-1"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  className="mt-1"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <Label>Address</Label>
                <Input
                  className="mt-1"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input
                    className="mt-1"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    className="mt-1"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <div>
              <Label>Subscription plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter — ₹1,999/mo</SelectItem>
                  <SelectItem value="growth">Growth — ₹4,999/mo</SelectItem>
                  <SelectItem value="enterprise">Enterprise — Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              {(
                [
                  ["pos", "Point of Sale"],
                  ["inventory", "Inventory"],
                  ["painters", "Painter network"],
                  ["ai", "AI Assistant"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-md border p-3 cursor-pointer"
                >
                  <Checkbox
                    checked={form.modules[key]}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        modules: { ...form.modules, [key]: c === true },
                      })
                    }
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}
          {step === 5 && (
            <div>
              <Label>Primary brand colour</Label>
              <Input
                type="color"
                className="mt-1 h-12 w-full"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          )}
          {step === 6 && (
            <ul className="space-y-2 text-sm">
              {[
                ["Shop", form.shopName || "—"],
                ["Owner", form.owner || "—"],
                ["Location", [form.city, form.state].filter(Boolean).join(", ") || "—"],
                ["Plan", form.plan],
                ["Modules", Object.entries(form.modules).filter(([, v]) => v).map(([k]) => k).join(", ")],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium capitalize">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button onClick={next} className="gap-2">
          {step === STEPS.length - 1 ? (
            <>
              <Check className="h-4 w-4" />
              Launch shop
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
      <ol className="flex gap-1 flex-wrap">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "text-[10px] px-2 py-1 rounded-full border",
              i <= step ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground"
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
