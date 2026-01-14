import { useState } from "react";
import { Save, Bell, Clock, Users, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    schoolName: "Central High School",
    timezone: "America/New_York",
    lateThreshold: "09:00",
    absentThreshold: "10:00",
    autoRefresh: true,
    refreshInterval: "30",
    emailNotifications: true,
    dailyReport: true,
    weeklyReport: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-fade-in px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your attendance system preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>General</CardTitle>
          </div>
          <CardDescription>Basic system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Institution Name</Label>
              <Input
                id="schoolName"
                value={settings.schoolName}
                onChange={(e) =>
                  setSettings({ ...settings, schoolName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  setSettings({ ...settings, timezone: value })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Attendance Rules</CardTitle>
          </div>
          <CardDescription>Define attendance status thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lateThreshold">Late After</Label>
              <Input
                id="lateThreshold"
                type="time"
                value={settings.lateThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, lateThreshold: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Students arriving after this time are marked as late
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="absentThreshold">Absent After</Label>
              <Input
                id="absentThreshold"
                type="time"
                value={settings.absentThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, absentThreshold: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Students not checked in by this time are marked absent
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sync */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Data Sync</CardTitle>
          </div>
          <CardDescription>Configure real-time data synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh attendance data
              </p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoRefresh: checked })
              }
            />
          </div>
          {settings.autoRefresh && (
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
              <Select
                value={settings.refreshInterval}
                onValueChange={(value) =>
                  setSettings({ ...settings, refreshInterval: value })
                }
              >
                <SelectTrigger id="refreshInterval" className="w-[200px]">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage alert and report preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive attendance alerts via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily attendance summary
              </p>
            </div>
            <Switch
              checked={settings.dailyReport}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, dailyReport: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly analytics report
              </p>
            </div>
            <Switch
              checked={settings.weeklyReport}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, weeklyReport: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
