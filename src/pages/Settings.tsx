import { useEffect, useState } from "react";
import { Save, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

const Settings = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [settings, setSettings] = useState({
    autoAbsentEnabled: true,
    absentAfterMinutes: 15,
    lateAfterMinutes: 5,
    timezone: "Asia/Bangkok",
  });

  /* =========================
     1️⃣ Load Settings
  ========================== */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "systemSettings", "attendance"));

        if (snap.exists()) {
          setSettings({
            autoAbsentEnabled: snap.data().autoAbsentEnabled ?? true,
            absentAfterMinutes: snap.data().absentAfterMinutes ?? 15,
            lateAfterMinutes: snap.data().lateAfterMinutes ?? 5,
            timezone: snap.data().timezone ?? "Asia/Bangkok",
          });
        }
      } catch (error) {
        console.error("Load settings error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /* =========================
     2️⃣ Save Settings
  ========================== */
  const handleSave = async () => {
    try {
      await setDoc(
        doc(db, "systemSettings", "attendanceLogs"),
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Settings saved",
        description: "Attendance settings updated successfully.",
      });
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  /* =========================
     3️⃣ Auto Absent Test Button
  ========================== */

const handleAutoAbsent = async () => {
  try {
    console.log("🔥 Auto Absent Start");

    const logsSnapshot = await getDocs(collection(db, "attendanceLogs"));
    const usersSnapshot = await getDocs(collection(db, "users"));

    const now = new Date();
    const todayString = now.toDateString();

    let createdCount = 0;

    const checkedInToday = new Set<string>();
    const alreadyAbsentToday = new Set<string>();

    // =========================
    // 1️⃣ ตรวจ log วันนี้
    // =========================
    for (const d of logsSnapshot.docs) {
      const data = d.data();

      const logTime =
        data.timestamp?.toDate?.() ??
        new Date(data.timestamp);

      if (!logTime || isNaN(logTime.getTime())) continue;

      if (logTime.toDateString() !== todayString) continue;

      if (data.type === "check-in") {
        checkedInToday.add(data.uid);
      }

      if (data.type === "auto-absent") {
        alreadyAbsentToday.add(data.uid);
      }
    }

    console.log("Checked-in today:", checkedInToday.size);
    console.log("Already absent today:", alreadyAbsentToday.size);

    // =========================
    // 2️⃣ Loop ทุก user
    // =========================
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();

      // ข้าม admin / teacher
      if (user.role !== "student") continue;

      const uid = userDoc.id;

      // ถ้า check-in แล้ววันนี้ → ข้าม
      if (checkedInToday.has(uid)) continue;

      // ถ้า absent แล้ววันนี้ → ข้าม
      if (alreadyAbsentToday.has(uid)) continue;

      console.log("📝 Creating absent for:", uid);

      await addDoc(collection(db, "attendanceLogs"), {
        uid,
        name: user.name ?? "",
        status: "absent",
        type: "auto-absent",
        timestamp: now,
        createdAt: now,
      });

      createdCount++;
    }

    console.log("✅ Auto Absent Done");
    alert(`Created ${createdCount} absent records`);
  } catch (error) {
    console.error("❌ Auto absent error:", error);
    alert("Auto absent failed. Check console.");
  }
};

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Settings</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Auto Absent</CardTitle>
          </div>
          <CardDescription>
            Automatically mark students absent if not checked in.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Auto Absent</Label>
            </div>
            <Switch
              checked={settings.autoAbsentEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoAbsentEnabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Absent After (minutes)</Label>
            <Input
              type="number"
              value={settings.absentAfterMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  absentAfterMinutes: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Late After (minutes)</Label>
            <Input
              type="number"
              value={settings.lateAfterMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  lateAfterMinutes: Number(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleAutoAbsent}
        disabled={processing}
        className="bg-red-500 hover:bg-red-600"
      >
        {processing ? "Processing..." : "Run Auto Absent Now"}
      </Button>
    </div>
  );
};

export default Settings;