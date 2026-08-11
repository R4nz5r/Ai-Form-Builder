import { useState } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Lock, Palette, Moon, Sun, AlertTriangle, Check } from "lucide-react";
import { authApi } from "../services/index.js";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import { PageHeader } from "./Insights.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input, Field, Label } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { ConfirmModal } from "../components/ui/Modal.jsx";
import { cn } from "../lib/utils.js";

const AVATAR_COLORS = ["#0c8b7c", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#d97706", "#059669", "#334155"];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { setTheme, isDark, toggle } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [color, setColor] = useState(user?.avatarColor || "#0c8b7c");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({ name, avatarColor: color });
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) return toast.error("Fill in both fields");
    setSavingPwd(true);
    try {
      await authApi.changePassword(pwd);
      setPwd({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      toast.success("Account deleted");
      logout();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const profileDirty = name !== user?.name || color !== user?.avatarColor;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your account and preferences" />

      <div className="mt-6 space-y-5">
        {/* Profile */}
        <Section icon={User} title="Profile" desc="Your name and avatar.">
          <div className="flex items-center gap-4">
            <Avatar name={name} color={color} size="lg" />
            <div className="flex-1">
              <Field label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="mt-4">
            <Label>Avatar color</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("grid h-8 w-8 place-items-center rounded-full text-white transition-transform hover:scale-110", color === c && "ring-2 ring-offset-2 ring-offset-surface")}
                  style={{ background: c, "--tw-ring-color": c }}
                >
                  {color === c && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={saveProfile} loading={savingProfile} disabled={!profileDirty}>
              Save changes
            </Button>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" desc="Choose how Timely Forms AI looks to you.">
          <div className="grid grid-cols-2 gap-3">
            <ThemeOption active={!isDark} onClick={() => setTheme("light")} icon={Sun} label="Light" />
            <ThemeOption active={isDark} onClick={() => setTheme("dark")} icon={Moon} label="Dark" />
          </div>
          <p className="mt-3 text-xs text-muted">
            Tip: toggle anytime with the icon in the sidebar.{" "}
            <button onClick={toggle} className="font-medium text-brand-600 hover:underline">
              Switch now
            </button>
          </p>
        </Section>

        {/* Password */}
        <Section icon={Lock} title="Password" desc="Change your account password.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current password">
              <Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
            </Field>
            <Field label="New password" hint="At least 6 characters">
              <Input type="password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={savePassword} loading={savingPwd} disabled={!pwd.currentPassword || !pwd.newPassword}>
              Update password
            </Button>
          </div>
        </Section>

        {/* Danger zone */}
        <Card className="border-red-200 p-5 dark:border-red-900/50">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-fg">Delete account</h3>
              <p className="mt-0.5 text-sm text-muted">
                Permanently delete your account, all forms and responses. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete my account
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
        title="Delete your account?"
        description="All your forms and responses will be permanently removed. This action cannot be undone."
        confirmText="Delete account"
        danger
      />
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          {desc && <p className="text-xs text-muted">{desc}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function ThemeOption({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
        active ? "border-brand-500 ring-2 ring-brand-500/15" : "border-default hover:border-brand-300"
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-fg">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="text-sm font-medium text-fg">{label}</span>
      {active && <Check className="ml-auto h-4 w-4 text-brand-600" strokeWidth={3} />}
    </button>
  );
}
